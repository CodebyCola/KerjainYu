import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { cleanDatabase, closeDb } from "../helpers/testDb";
import { registerAndLogin } from "../helpers/auth";

export async function createProject(cookie: string) {
  const projectResult = await request(app)
    .post("/api/v1/projects")
    .set("Cookie", cookie)
    .send({
      project: { title: "Website Redesign", deadline: "2026-09-30" },
      links: [
        {
          label: "Figma",
          url: "https://figma.com/file/abc",
          category: "design",
        },
      ],
    });
  return { projectResult };
}

afterAll(async () => {
  await closeDb();
});
describe("POST /api/v1/projects", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("should create a project successfully with links and creator becomes leader", async () => {
    const { cookie, userId, username } = await registerAndLogin("budiman");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: { title: "Website Redesign", deadline: "2026-09-30" },
        links: [
          {
            label: "Figma",
            url: "https://figma.com/file/abc",
            category: "design",
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();

    const projectId = res.body.data.id;
    const detailRes = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.membership.userId).toBe(userId);
    expect(detailRes.body.data.membership.role).toBe("leader");
    expect(detailRes.body.data.links.length).toBe(1);
  });
  it("should create a project successfuly without links and creator becomes leader", async () => {
    const { cookie, userId } = await registerAndLogin("budiman");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: { title: "Website Redesign", deadline: "2026-09-30" },
        links: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();

    const projectId = res.body.data.id;
    const detailRes = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.membership.userId).toBe(userId);
    expect(detailRes.body.data.membership.role).toBe("leader");
    expect(detailRes.body.data.links.length).toBe(0);
  });

  it("should reject if the user have not login yet", async () => {
    const res = await request(app)
      .post("/api/v1/projects")
      .send({
        project: { title: "Website Redesign", deadline: "2026-09-30" },
        links: [
          {
            label: "Figma",
            url: "https://figma.com/file/abc",
            category: "design",
          },
        ],
      });
    expect(res.status).toBe(401);
  });

  it("should reject when title is missing", async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: {},
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should reject when link url is invalid", async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: { title: "Website Redesign" },
        links: [
          { label: "Broken", url: "not-a-valid-url", category: "design" },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/projects", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("should fetch project that are belong to user (wether user is the leader or member) (0 projects)", async () => {
    const { cookie, userId } = await registerAndLogin("gua_ga_punya_project");

    const res = await request(app).get("/api/v1/projects").set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
  it("should fetch project that are belong to user (wether user is the leader or member) (have projects)", async () => {
    const { cookie, userId } = await registerAndLogin("gua_ga_punya_project");
    const projectResult = await createProject(cookie);

    const res = await request(app).get("/api/v1/projects").set("Cookie", cookie);
    // console.log(res)
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
  it(`should reject if the user have'nt login yet`, async () => {
    const res = await request(app).get("/api/v1/projects");
    expect(res.status).toBe(401);
  });
  it("should not include projects the user is not a member of", async () => {
    const owner = await registerAndLogin("pemilik_project");
    await createProject(owner.cookie);

    const { cookie } = await registerAndLogin("bukan_member");

    const res = await request(app).get("/api/v1/projects").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});

describe("PATCH /api/v1/projects/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("should update a project successfully", async () => {
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie)
      .send({ title: "Website Redesign v2", status: "completed" });
    // console.log(JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Website Redesign v2");
    expect(res.body.data.status).toBe("completed");
  });

  it("should reject update with empty body", async () => {
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return not found for non-existent project", async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .patch("/api/v1/projects/999999")
      .set("Cookie", cookie)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("should reject update from a user who is not a member", async () => {
    const owner = await registerAndLogin("pemilik_project");
    const { projectResult } = await createProject(owner.cookie);
    const projectId = projectResult.body.data.id;

    const { cookie: strangerCookie } = await registerAndLogin("bukan_member");

    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Cookie", strangerCookie)
      .send({ title: "Hacked Title" });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should reject request without authentication", async () => {
    const res = await request(app)
      .patch("/api/v1/projects/1")
      .send({ title: "Updated Title" });

    expect(res.status).toBe(401);
  });

  it("should update archived into true and is_archived_at to now", async () => {
    const owner = await registerAndLogin("budiman");
    const { projectResult } = await createProject(owner.cookie);
    const projectId = projectResult.body.data.id;
    const res = await request(app)
      .patch(`/api/v1/projects/${projectId}`)
      .set("Cookie", owner.cookie)
      .send({ isArchived: true });
    // console.log(res)
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
    // expect(res.body.data.isArchivedAt).toBe(new Date());
  });
});

describe("GET /api/v1/projects/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("should return project detail with membership and links for a member", async () => {
    const { cookie, userId } = await registerAndLogin("budiman");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: { title: "Website Redesign", deadline: "2026-09-30" },
        links: [
          {
            label: "Figma",
            url: "https://figma.com/file/abc",
            category: "design",
          },
        ],
      });
    const projectId = res.body.data.id;

    const detailRes = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.project.id).toBe(projectId);
    expect(detailRes.body.data.membership.userId).toBe(userId);
    expect(detailRes.body.data.membership.role).toBe("leader");
    expect(detailRes.body.data.links.length).toBe(1);
  });

  it("should return not found for non-existent project", async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .get("/api/v1/projects/999999")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("should reject access from a user who is not a member", async () => {
    const owner = await registerAndLogin("pemilik_project");
    const { projectResult } = await createProject(owner.cookie);
    const projectId = projectResult.body.data.id;

    const { cookie: strangerCookie } = await registerAndLogin("bukan_member");

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}`)
      .set("Cookie", strangerCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("should reject request without authentication", async () => {
    const res = await request(app).get("/api/v1/projects/1");

    expect(res.status).toBe(401);
  });
});
// ─────────────────────────────────────────────
// GET /api/v1/projects/:id/tasks
// ─────────────────────────────────────────────

describe('GET /api/v1/projects/:id/tasks', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return an empty array when the project has no tasks yet', async () => {
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('should return not found for a non-existent project', async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .get('/api/v1/projects/999999/tasks')
      .set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject access from a user who is not a member', async () => {
    const owner = await registerAndLogin("pemilik_project");
    const { projectResult } = await createProject(owner.cookie);
    const projectId = projectResult.body.data.id;

    const { cookie: strangerCookie } = await registerAndLogin("bukan_member");

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/tasks`)
      .set('Cookie', strangerCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should reject request without authentication', async () => {
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app).get(`/api/v1/projects/${projectId}/tasks`);

    expect(res.status).toBe(401);
  });

  it('should reject a non-numeric project id', async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .get('/api/v1/projects/abc/tasks')
      .set('Cookie', cookie);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/projects/:id/members', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return the creator as an active leader member', async () => {
    const { cookie, userId } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/members`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].userId).toBe(userId);
    expect(res.body.data[0].role).toBe('leader');
    expect(res.body.data[0].status).toBe('active');
  });

  it.skip('should be visible to any active member, not just the leader', async () => {
    // Catatan: test ini butuh cara menambahkan member kedua ke project.
    // Jika endpoint "add member" / "accept invite" belum ada, skip dulu
    // test ini (it.skip) dan tambahkan lagi begitu endpoint itu dibuat —
    // saat ini repository addMember() sudah ada tapi belum ada endpoint HTTP-nya.
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/members`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    // TODO: perluas assertion ini begitu endpoint tambah-member tersedia,
    // untuk verifikasi member KEDUA (bukan cuma leader) juga bisa akses endpoint ini.
  });

  it('should return not found for a non-existent project', async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .get('/api/v1/projects/999999/members')
      .set('Cookie', cookie);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should reject access from a user who is not a member', async () => {
    const owner = await registerAndLogin("pemilik_project");
    const { projectResult } = await createProject(owner.cookie);
    const projectId = projectResult.body.data.id;

    const { cookie: strangerCookie } = await registerAndLogin("bukan_member");

    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/members`)
      .set('Cookie', strangerCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should reject request without authentication', async () => {
    const { cookie } = await registerAndLogin("budiman");
    const { projectResult } = await createProject(cookie);
    const projectId = projectResult.body.data.id;

    const res = await request(app).get(`/api/v1/projects/${projectId}/members`);

    expect(res.status).toBe(401);
  });

  it('should reject a non-numeric project id', async () => {
    const { cookie } = await registerAndLogin("budiman");

    const res = await request(app)
      .get('/api/v1/projects/abc/members')
      .set('Cookie', cookie);

    expect(res.status).toBe(400);
  });
});