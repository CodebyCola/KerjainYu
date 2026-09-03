import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { cleanDatabase, closeDb } from "../helpers/testDb";
import { registerAndLogin } from "../helpers/auth";
import { createProject, getMembers, inviteAndAccept } from "../helpers/project"
import { db } from "../../database/db";

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
    expect(res.status).toBe(200);
    expect(res.body.data.isArchived).toBe(true);
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

describe("DELETE /api/v1/projects/:id", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it("should delete project successfully when requested by project leader", async () => {
    const { cookie, userId } = await registerAndLogin("leader");

    const { projectResult } = await createProject(cookie);

    expect(projectResult.status).toBe(201);

    const projectId = projectResult.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      success: true,
      message: "Successfuly deleted project",
    });

    // Project benar-benar terhapus
    const project = await db("projects")
      .where({ id: projectId })
      .first();

    expect(project).toBeUndefined();

    // Membership leader ikut terhapus
    const membership = await db("project_members")
      .where({
        projectId,
        userId,
      })
      .first();

    expect(membership).toBeUndefined();

    // Links ikut terhapus
    const links = await db("project_links")
      .where({ projectId });

    expect(links).toHaveLength(0);
  });

  it("should reject when user is not authenticated", async () => {
    const { cookie } = await registerAndLogin("leader");

    const { projectResult } = await createProject(cookie);

    const projectId = projectResult.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`);

    expect(res.status).toBe(401);

    // Project tidak boleh terhapus
    const project = await db("projects")
      .where({ id: projectId })
      .first();

    expect(project).toBeDefined();
  });

  it("should reject when user is not project member", async () => {
    const { cookie: leaderCookie } = await registerAndLogin("leader");

    const { projectResult } = await createProject(leaderCookie);

    const projectId = projectResult.body.data.id;

    const { cookie: outsiderCookie } =
      await registerAndLogin("outsider");

    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", outsiderCookie);

    expect(res.status).toBe(403);

    const project = await db("projects")
      .where({ id: projectId })
      .first();

    expect(project).toBeDefined();
  });

  it("should reject when user is project member but not leader", async () => {
    const { cookie: leaderCookie } = await registerAndLogin("leader");

    const { projectResult } = await createProject(leaderCookie);

    const projectId = projectResult.body.data.id;

    const member = await inviteAndAccept(
      leaderCookie,
      projectId,
      "member",
    );

    const res = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", member.cookie);

    expect(res.status).toBe(403);

    const project = await db("projects")
      .where({ id: projectId })
      .first();

    expect(project).toBeDefined();
  });

  it("should reject when project does not exist", async () => {
    const { cookie } = await registerAndLogin("leader");

    const nonExistentProjectId = 999999999;

    const res = await request(app)
      .delete(`/api/v1/projects/${nonExistentProjectId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
  });

  it("should reject when project id is invalid", async () => {
    const { cookie } = await registerAndLogin("leader");

    const res = await request(app)
      .delete("/api/v1/projects/not-a-number")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should delete project successfully when it has no links", async () => {
    const { cookie } = await registerAndLogin("leader");

    const res = await request(app)
      .post("/api/v1/projects")
      .set("Cookie", cookie)
      .send({
        project: {
          title: "Project Without Links",
          deadline: "2026-09-30",
        },
        links: [],
      });

    expect(res.status).toBe(201);

    const projectId = res.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({
      success: true,
      message: "Successfuly deleted project",
    });

    const project = await db("projects")
      .where({ id: projectId })
      .first();

    expect(project).toBeUndefined();
  });

  it("should delete project links", async () => {
    const { cookie } = await registerAndLogin("leader");

    const { projectResult } = await createProject(cookie);

    const projectId = projectResult.body.data.id;

    const linksBefore = await db("project_links")
      .where({ projectId });

    expect(linksBefore.length).toBeGreaterThan(0);

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(deleteRes.status).toBe(200);

    const linksAfter = await db("project_links")
      .where({ projectId });

    expect(linksAfter).toHaveLength(0);
  });

  it("should delete project members", async () => {
    const { cookie: leaderCookie } =
      await registerAndLogin("leader");

    const { projectResult } = await createProject(leaderCookie);

    const projectId = projectResult.body.data.id;

    const member1 = await inviteAndAccept(
      leaderCookie,
      projectId,
      "member1",
    );

    const member2 = await inviteAndAccept(
      leaderCookie,
      projectId,
      "member2",
    );

    const membersBefore = await getMembers(
      leaderCookie,
      projectId,
    );

    expect(membersBefore).toHaveLength(3);

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", leaderCookie);

    expect(deleteRes.status).toBe(200);

    const membersAfter = await db("project_members")
      .where({ projectId });

    expect(membersAfter).toHaveLength(0);

    // User account tidak ikut terhapus
    const user1 = await db("users")
      .where({ id: member1.userId })
      .first();

    const user2 = await db("users")
      .where({ id: member2.userId })
      .first();

    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
  });

  it("should delete project and its tasks", async () => {
    const { cookie } = await registerAndLogin("leader");

    const { projectResult } = await createProject(cookie);

    const projectId = projectResult.body.data.id;

    /*
     * Sesuaikan payload dengan endpoint create task
     * yang lo punya.
     */
    const taskRes = await request(app)
      .post(`/api/v1/projects/${projectId}/tasks`)
      .set("Cookie", cookie)
      .send({
        title: "Design Homepage",
      });

    expect(taskRes.status).toBe(201);

    const taskId = taskRes.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", cookie);

    expect(deleteRes.status).toBe(200);

    const project = await db("projects")
      .where({ id: projectId })
      .first();

    const task = await db("tasks")
      .where({ id: taskId })
      .first();

    expect(project).toBeUndefined();
    expect(task).toBeUndefined();
  });

  it("should not delete another project", async () => {
    const { cookie: leader1Cookie } =
      await registerAndLogin("leader1");

    const { cookie: leader2Cookie } =
      await registerAndLogin("leader2");

    const project1 = await createProject(leader1Cookie);
    const project2 = await createProject(leader2Cookie);

    const projectId1 = project1.projectResult.body.data.id;
    const projectId2 = project2.projectResult.body.data.id;

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId1}`)
      .set("Cookie", leader1Cookie);

    expect(deleteRes.status).toBe(200);

    const deletedProject = await db("projects")
      .where({ id: projectId1 })
      .first();

    const untouchedProject = await db("projects")
      .where({ id: projectId2 })
      .first();

    expect(deletedProject).toBeUndefined();
    expect(untouchedProject).toBeDefined();

    // Project kedua masih bisa diakses oleh leader-nya
    const detailRes = await request(app)
      .get(`/api/v1/projects/${projectId2}`)
      .set("Cookie", leader2Cookie);

    expect(detailRes.status).toBe(200);
  });

  it("should delete project and all related records", async () => {
    // 1. Create users
    const { cookie: leaderCookie, userId: leaderId } =
      await registerAndLogin("leader");

    const { userId: memberId } =
      await registerAndLogin("member");

    // 2. Create project
    const { projectResult } = await createProject(leaderCookie);
    const projectId = projectResult.body.data.id;

    // 3. Insert member
    await db("project_members").insert({
      project_id: projectId,
      user_id: memberId,
      role: "member",
      status: "active",
    });

    // 4. Insert another project member/link
    const [link] = await db("project_links")
      .insert({
        project_id: projectId,
        label: "GitHub",
        url: "https://github.com/test/project",
        category: "development",
        added_by: leaderId,
      })
      .returning("id");

    // 5. Create task
    const [task] = await db("tasks")
      .insert({
        title: "Test Task",
        description: "Task for cascade delete test",
        status: "ongoing",
        project_id: projectId,
        assignee_id: memberId,
        created_by: leaderId,
        is_claimable: false,
      })
      .returning("id");

    const taskId = Number(task.id);

    // 6. Ownership log
    const [ownershipLog] = await db("task_ownership_log")
      .insert({
        task_id: taskId,
        from_user_id: null,
        to_user_id: memberId,
        reason: "assigned",
      })
      .returning("id");

    // 7. Task swap request
    const [swapRequest] = await db("task_swap_requests")
      .insert({
        task_id: taskId,
        target_task_id: null,
        requested_by: memberId,
        requested_to: leaderId,
        status: "pending",
      })
      .returning("id");

    // 8. Comment
    const [comment] = await db("comments_task")
      .insert({
        task_id: taskId,
        user_id: memberId,
        comment: "Test comment",
      })
      .returning("id");

    // 9. Submission
    const [submission] = await db("task_submissions")
      .insert({
        task_id: taskId,
        submitted_by: memberId,
        note: "Test submission",
        review_status: "pending",
      })
      .returning("id");

    const submissionId = Number(submission.id);

    // 10. Attachment
    const [attachment] = await db("submission_attachments")
      .insert({
        submission_id: submissionId,
        type: "file",
        object_key: "test/test-file.pdf",
        file_name: "test-file.pdf",
        mime_type: "application/pdf",
        file_size: 1234,
      })
      .returning("id");

    // 11. Appeal
    const [appeal] = await db("task_appeals")
      .insert({
        task_id: taskId,
        submission_id: submissionId,
        raised_by: memberId,
        reason: "Test appeal",
        status: "pending",
      })
      .returning("id");

    // --------------------------------------------------
    // VERIFY DATA EXISTS BEFORE DELETE
    // --------------------------------------------------

    expect(
      await db("projects").where({ id: projectId }).first()
    ).toBeDefined();

    expect(
      await db("project_members").where({ project_id: projectId })
    ).toHaveLength(2);

    expect(
      await db("project_links").where({ project_id: projectId })
    ).toHaveLength(2);

    expect(
      await db("tasks").where({ project_id: projectId })
    ).toHaveLength(1);

    expect(
      await db("task_ownership_log").where({ task_id: taskId })
    ).toHaveLength(1);

    expect(
      await db("task_swap_requests").where({ task_id: taskId })
    ).toHaveLength(1);

    expect(
      await db("comments_task").where({ task_id: taskId })
    ).toHaveLength(1);

    expect(
      await db("task_submissions").where({ task_id: taskId })
    ).toHaveLength(1);

    expect(
      await db("submission_attachments").where({
        submission_id: submissionId,
      })
    ).toHaveLength(1);

    expect(
      await db("task_appeals").where({ task_id: taskId })
    ).toHaveLength(1);

    // --------------------------------------------------
    // DELETE PROJECT
    // --------------------------------------------------

    const deleteRes = await request(app)
      .delete(`/api/v1/projects/${projectId}`)
      .set("Cookie", leaderCookie);

    expect(deleteRes.status).toBe(200);

    expect(deleteRes.body).toEqual({
      success: true,
      message: "Successfuly deleted project",
    });

    // --------------------------------------------------
    // VERIFY EVERYTHING IS DELETED
    // --------------------------------------------------

    expect(
      await db("projects").where({ id: projectId })
    ).toHaveLength(0);

    expect(
      await db("project_members").where({ project_id: projectId })
    ).toHaveLength(0);

    expect(
      await db("project_links").where({ project_id: projectId })
    ).toHaveLength(0);

    expect(
      await db("tasks").where({ project_id: projectId })
    ).toHaveLength(0);

    expect(
      await db("task_ownership_log").where({ task_id: taskId })
    ).toHaveLength(0);

    expect(
      await db("task_swap_requests").where({ task_id: taskId })
    ).toHaveLength(0);

    expect(
      await db("comments_task").where({ task_id: taskId })
    ).toHaveLength(0);

    expect(
      await db("task_submissions").where({ task_id: taskId })
    ).toHaveLength(0);

    expect(
      await db("submission_attachments").where({
        submission_id: submissionId,
      })
    ).toHaveLength(0);

    expect(
      await db("task_appeals").where({ task_id: taskId })
    ).toHaveLength(0);

    // User TIDAK boleh ikut terhapus
    expect(
      await db("users").where({ id: leaderId }).first()
    ).toBeDefined();

    expect(
      await db("users").where({ id: memberId }).first()
    ).toBeDefined();
  });
});