import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { cleanDatabase, closeDb } from "../helpers/testDb";
import { registerAndLogin } from "../helpers/auth";
import {
    createProject,
    inviteAndAccept,
} from "../helpers/project";

afterAll(async () => {
    await closeDb();
});
describe("POST /api/v1/projects/:id/links", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should create a link successfully for project leader", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.label).toBe("GitHub");
        expect(res.body.data.url).toBe(
            "https://github.com/budiman/project"
        );
    });

    it("should reject duplicate URL within the same project", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const link = {
            label: "GitHub",
            url: "https://github.com/budiman/project",
            category: "development",
        };

        const firstRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send(link);

        expect(firstRes.status).toBe(201);

        const secondRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send(link);

        expect(secondRes.status).toBe(409);
        expect(secondRes.body.error.code).toBe("CONFLICT");
    });

    it("should allow the same URL in different projects", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const projectOne = await createProject(cookie);
        const projectTwo = await createProject(cookie);

        const projectOneId = projectOne.projectResult.body.data.id;
        const projectTwoId = projectTwo.projectResult.body.data.id;

        const link = {
            label: "GitHub",
            url: "https://github.com/budiman/project",
            category: "development",
        };

        const firstRes = await request(app)
            .post(`/api/v1/projects/${projectOneId}/links`)
            .set("Cookie", cookie)
            .send(link);

        expect(firstRes.status).toBe(201);

        const secondRes = await request(app)
            .post(`/api/v1/projects/${projectTwoId}/links`)
            .set("Cookie", cookie)
            .send(link);

        expect(secondRes.status).toBe(201);
    });

    it("should reject link creation from a non-leader member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", member.cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/sari/project",
                category: "development",
            });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject when project does not exist", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post("/api/v1/projects/999999/links")
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject invalid project id", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post("/api/v1/projects/abc/links")
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid link body", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "Invalid Link",
                url: "not-a-valid-url",
                category: "development",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .post("/api/v1/projects/1/links")
            .send({
                label: "GitHub",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(401);
    });
});


describe("PATCH /api/v1/links/:id", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should update a link successfully for project leader", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;
        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });


        expect(createRes.status).toBe(201);

        const linkId = createRes.body.data.id;
        const res = await request(app)
            .patch(`/api/v1/links/${linkId}`)
            .set("Cookie", cookie)
            .send({
                label: "Updated GitHub",
                url: "https://github.com/budiman/project-v2",
                category: "development",
            });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should return not found when link does not exist", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch("/api/v1/links/999999")
            .set("Cookie", cookie)
            .send({
                label: "Updated Link",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject update from a non-leader member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;
        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", leader.cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });

        const linkId = createRes.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const res = await request(app)
            .patch(`/api/v1/links/${linkId}`)
            .set("Cookie", member.cookie)
            .send({
                label: "Hacked Link",
                url: "https://github.com/sari/hacked",
                category: "development",
            });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject duplicate URL when updating a link", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        // Create first link
        const firstRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub One",
                url: "https://github.com/budiman/project-one",
                category: "development",
            });

        // Create second link with DIFFERENT URL
        const secondRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub Two",
                url: "https://github.com/budiman/project-two",
                category: "development",
            });

        expect(firstRes.status).toBe(201);
        expect(secondRes.status).toBe(201);

        const secondLinkId = secondRes.body.data.id;

        // Try changing second link's URL
        // to the URL already owned by first link
        const res = await request(app)
            .patch(`/api/v1/links/${secondLinkId}`)
            .set("Cookie", cookie)
            .send({
                label: "Duplicate",
                url: "https://github.com/budiman/project-one",
                category: "development",
            });
        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });

    it("should reject invalid link id", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch("/api/v1/links/abc")
            .set("Cookie", cookie)
            .send({
                label: "Updated Link",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid update body", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            })

        const linkId = createRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/links/${linkId}`)
            .set("Cookie", cookie)
            .send({
                label: "",
                url: "invalid-url",
                category: "development",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .patch("/api/v1/links/1")
            .send({
                label: "Updated Link",
                url: "https://github.com/example/project",
                category: "development",
            });

        expect(res.status).toBe(401);
    });
});

describe("DELETE /api/v1/links/:id", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should delete a link successfully for project leader", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });

        expect(createRes.status).toBe(201);

        const linkId = createRes.body.data.id;

        const deleteRes = await request(app)
            .delete(`/api/v1/links/${linkId}`)
            .set("Cookie", cookie);

        expect(deleteRes.status).toBe(204);
    });

    it("should return not found when link does not exist", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .delete("/api/v1/links/999999")
            .set("Cookie", cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject deletion from a non-leader member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", leader.cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });

        expect(createRes.status).toBe(201);

        const linkId = createRes.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const deleteRes = await request(app)
            .delete(`/api/v1/links/${linkId}`)
            .set("Cookie", member.cookie);

        expect(deleteRes.status).toBe(403);
        expect(deleteRes.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject deletion without authentication", async () => {
        const res = await request(app)
            .delete("/api/v1/links/1");

        expect(res.status).toBe(401);
    });

    it("should reject invalid link id", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .delete("/api/v1/links/abc")
            .set("Cookie", cookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should no longer find the link after deletion", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/links`)
            .set("Cookie", cookie)
            .send({
                label: "GitHub",
                url: "https://github.com/budiman/project",
                category: "development",
            });

        const linkId = createRes.body.data.id;

        const deleteRes = await request(app)
            .delete(`/api/v1/links/${linkId}`)
            .set("Cookie", cookie);

        expect(deleteRes.status).toBe(204);

        // Try deleting the same link again
        const secondDeleteRes = await request(app)
            .delete(`/api/v1/links/${linkId}`)
            .set("Cookie", cookie);

        expect(secondDeleteRes.status).toBe(404);
        expect(secondDeleteRes.body.error.code).toBe("NOT_FOUND");
    });
});