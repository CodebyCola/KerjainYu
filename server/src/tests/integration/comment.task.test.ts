import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { cleanDatabase, closeDb } from "../helpers/testDb";
import { registerAndLogin } from "../helpers/auth";
import { createProject, inviteAndAccept } from "../helpers/project";


async function createTask(leaderCookie: string, projectId: number, overrides: Record<string, any> = {}) {
    return request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Cookie', leaderCookie)
        .send({ title: 'Setup CI/CD pipeline', isClaimable: true, ...overrides });
}

afterAll(async () => {
    await closeDb();
});

describe("GET /api/v1/tasks/:id/comments", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should return comments for a task", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "This task looks easy",
            });

        await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "I can handle this task",
            });

        const res = await request(app)
            .get(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        expect(res.body.data).toHaveLength(2);

        expect(res.body.data[0]).toMatchObject({
            username: "budiman",
            comment: "This task looks easy",
        });

        expect(res.body.data[1]).toMatchObject({
            username: "budiman",
            comment: "I can handle this task",
        });
    });

    it("should return an empty array when the task has no comments", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .get(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    });

    it("should allow a project member to view task comments", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const taskResult = await createTask(
            leader.cookie,
            projectId
        );

        const taskId = taskResult.body.data.id;

        await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", leader.cookie)
            .send({
                comment: "Comment from leader",
            });

        const res = await request(app)
            .get(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", member.cookie);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toMatchObject({
            username: "budiman",
            comment: "Comment from leader",
        });
    });

    it("should return not found for a non-existent task", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .get("/api/v1/tasks/999999/comments")
            .set("Cookie", cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject access from a user who is not a project member", async () => {
        const owner = await registerAndLogin("pemilik_project");

        const { projectResult } = await createProject(owner.cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(
            owner.cookie,
            projectId
        );

        const taskId = taskResult.body.data.id;

        const stranger = await registerAndLogin("bukan_member");

        const res = await request(app)
            .get(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", stranger.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .get("/api/v1/tasks/1/comments");

        expect(res.status).toBe(401);
    });
});


describe("POST /api/v1/tasks/:id/comments", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should create a comment successfully", async () => {
        const { cookie, userId } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "I will start working on this task",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe(
            "Successfuly add comment to task"
        );

        expect(res.body.data.taskId).toBe(taskId);
        expect(res.body.data.userId).toBe(userId);
        expect(res.body.data.comment).toBe(
            "I will start working on this task"
        );
    });

    it("should allow a project member to create a comment", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const taskResult = await createTask(
            leader.cookie,
            projectId
        );

        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", member.cookie)
            .send({
                comment: "I can help with this task",
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        expect(res.body.data.taskId).toBe(taskId);
        expect(res.body.data.userId).toBe(member.userId);
        expect(res.body.data.comment).toBe(
            "I can help with this task"
        );
    });

    it("should reject an empty comment", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject a whitespace-only comment", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "     ",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject a comment longer than 1000 characters", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const longComment = "a".repeat(1001);

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: longComment,
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject a request when comment is missing", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject unknown fields", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(cookie, projectId);
        const taskId = taskResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", cookie)
            .send({
                comment: "Valid comment",
                unknownField: "should not be accepted",
            });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return not found for a non-existent task", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post("/api/v1/tasks/999999/comments")
            .set("Cookie", cookie)
            .send({
                comment: "Comment on non-existent task",
            });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject access from a user who is not a project member", async () => {
        const owner = await registerAndLogin("budiman");

        const { projectResult } = await createProject(owner.cookie);
        const projectId = projectResult.body.data.id;

        const taskResult = await createTask(
            owner.cookie,
            projectId
        );

        const taskId = taskResult.body.data.id;

        const stranger = await registerAndLogin("bukan_member");

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/comments`)
            .set("Cookie", stranger.cookie)
            .send({
                comment: "I should not be able to comment here",
            });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .post("/api/v1/tasks/1/comments")
            .send({
                comment: "Unauthenticated comment",
            });

        expect(res.status).toBe(401);
    });
});
