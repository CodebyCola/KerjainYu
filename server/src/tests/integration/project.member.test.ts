import { describe, it, expect, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { cleanDatabase, closeDb } from "../helpers/testDb";
import { registerAndLogin } from "../helpers/auth";
import { createProject, inviteAndAccept, getMembers } from "../helpers/project"
import { db } from "../../database/db";

afterAll(async () => {
    await closeDb();
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


describe('PATCH /api/v1/projects/:id/leader', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should transfer leadership successfully', async () => {
        const oldLeader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(oldLeader.cookie);
        const projectId = projectResult.body.data.id;

        const newLeader = await inviteAndAccept(oldLeader.cookie, projectId);

        const res = await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', oldLeader.cookie)
            .send({ userId: newLeader.userId });
        // console.log(res.status)
        // console.log(JSON.stringify(res.body, null, 2))

        expect(res.status).toBe(200);
        expect(res.body.data.userId).toBe(newLeader.userId);
        expect(res.body.data.role).toBe('leader');
    });

    it('should demote the old leader to member (not leave two leaders)', async () => {
        const oldLeader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(oldLeader.cookie);
        const projectId = projectResult.body.data.id;

        const newLeader = await inviteAndAccept(oldLeader.cookie, projectId);

        await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', oldLeader.cookie)
            .send({ userId: newLeader.userId });

        const members = await getMembers(newLeader.cookie, projectId);

        const oldLeaderMembership = members.find((m) => m.userId === oldLeader.userId);
        const newLeaderMembership = members.find((m) => m.userId === newLeader.userId);

        expect(oldLeaderMembership?.role).toBe('member');
        expect(newLeaderMembership?.role).toBe('leader');

        const leaderCount = members.filter((m) => m.role === 'leader').length;
        expect(leaderCount).toBe(1); // To make sure there's no two leader
    });

    it('should allow the new leader to perform leader-only actions after transfer', async () => {
        const oldLeader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(oldLeader.cookie);
        const projectId = projectResult.body.data.id;

        const newLeader = await inviteAndAccept(oldLeader.cookie, projectId);

        await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', oldLeader.cookie)
            .send({ userId: newLeader.userId });

        // leader baru coba bikin task (aksi leader-only)
        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', newLeader.cookie)
            .send({ title: 'Task by new leader' });
        expect(taskRes.status).toBe(201);

        // leader LAMA sekarang harus DITOLAK melakukan aksi leader-only
        const oldLeaderTaskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', oldLeader.cookie)
            .send({ title: 'Task by old leader' });
        expect(oldLeaderTaskRes.status).toBe(403);
    });

    it('should reject transferring leadership to yourself', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', leader.cookie)
            .send({ userId: leader.userId });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject transferring leadership to a user who is not a member', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const { userId: strangerId } = await registerAndLogin("bukan_member");

        const res = await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', leader.cookie)
            .send({ userId: strangerId });


        expect(res.status).toBe(403);
    });

    it('should reject transfer attempt from a non-leader member', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(leader.cookie, projectId, "sari");
        const anotherMember = await inviteAndAccept(leader.cookie, projectId, "citra");

        const res = await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', member.cookie) // not the leader
            .send({ userId: anotherMember.userId });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject when target userId is missing', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/projects/${projectId}/leader`)
            .set('Cookie', leader.cookie)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request without authentication', async () => {
        const res = await request(app)
            .patch('/api/v1/projects/1/leader')
            .send({ userId: 2 });

        expect(res.status).toBe(401);
    });
});

describe("POST /api/v1/projects/:id/leave", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should allow an active member to leave the project", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/leave`)
            .set("Cookie", member.cookie);

        expect(res.status).toBe(204);

        const members = await getMembers(
            leader.cookie,
            projectId
        );

        expect(
            members.some((m) => m.userId === member.userId)
        ).toBe(false);
    });

    it("should unassign the member's tasks when leaving the project", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );
        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", leader.cookie)
            .send({
                title: "Task assigned to Sari",
                description: "Test task",
                deadline: "2026-09-30",
            });

        expect(taskRes.status).toBe(201);

        const taskId = taskRes.body.data.id;

        // Assign task to member
        // const assignRes = await request(app)
        //     .patch(`/api/v1/tasks/${taskId}/assign`)
        //     .set("Cookie", leader.cookie)
        //     .send({
        //         userId: member.userId,
        //     });
        const claimTask = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', member.cookie);
        expect(claimTask.status).toBe(200);

        // Member leaves project
        const leaveRes = await request(app)
            .post(`/api/v1/projects/${projectId}/leave`)
            .set("Cookie", member.cookie);

        expect(leaveRes.status).toBe(204);

        // Verify task is unassigned
        const taskAfterLeave = await db("tasks")
            .where({ id: taskId })
            .first();
        expect(taskAfterLeave.assigneeId).toBeNull();
        expect(taskAfterLeave.status).toBe("unclaimed");
    });

    it("should reject leaving when user is not a project member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const stranger = await registerAndLogin("stranger");

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/leave`)
            .set("Cookie", stranger.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject leaving an already inactive membership", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        // Leave once
        const firstLeave = await request(app)
            .post(`/api/v1/projects/${projectId}/leave`)
            .set("Cookie", member.cookie);

        expect(firstLeave.status).toBe(204);

        // Try leaving again
        const secondLeave = await request(app)
            .post(`/api/v1/projects/${projectId}/leave`)
            .set("Cookie", member.cookie);

        expect(secondLeave.status).toBe(409);
        expect(secondLeave.body.error.code).toBe("CONFLICT");
    });

    it("should reject when project does not exist", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post("/api/v1/projects/999999/leave")
            .set("Cookie", cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .post("/api/v1/projects/1/leave");

        expect(res.status).toBe(401);
    });

    it("should reject invalid project id", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post("/api/v1/projects/abc/leave")
            .set("Cookie", cookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
});

describe("DELETE /api/v1/projects/:id/members/:userId", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should allow the project leader to remove an active member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const res = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${member.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(204);

        const members = await getMembers(
            leader.cookie,
            projectId
        );

        expect(
            members.some((m) => m.userId === member.userId)
        ).toBe(false);
    });

    it("should unassign the removed member's tasks", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        /*
         * Create task.
         * Sesuaikan endpoint ini dengan task API kamu.
         */
        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", leader.cookie)
            .send({
                title: "Task assigned to Sari",
                description: "Test task",
                deadline: "2026-09-30",
            });

        expect(taskRes.status).toBe(201);

        const taskId = taskRes.body.data.id;

        // Assign task to Sari
        // const assignRes = await request(app)
        //     .patch(`/api/v1/tasks/${taskId}/assign`)
        //     .set("Cookie", leader.cookie)
        //     .send({
        //         userId: member.userId,
        //     });
        const claimTask = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', member.cookie);

        expect(claimTask.status).toBe(200);

        // Remove Sari from project
        const removeRes = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${member.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(removeRes.status).toBe(204);

        // Task must be unassigned
        const task = await db("tasks")
            .where({ id: taskId })
            .first();

        expect(task.assigneeId).toBeNull();
        expect(task.status).toBe("unclaimed")
    });

    it("should reject a non-leader member from removing another member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member1 = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        const member2 = await inviteAndAccept(
            leader.cookie,
            projectId,
            "joko"
        );

        const res = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${member2.userId}`
            )
            .set("Cookie", member1.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject removing the project leader", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${leader.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });

    it("should reject removing a user who is not a project member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const stranger = await registerAndLogin("stranger");

        const res = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${stranger.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject removing an already inactive member", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari"
        );

        // Remove once
        const firstRemove = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${member.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(firstRemove.status).toBe(204);

        // Try removing again
        const secondRemove = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/${member.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(secondRemove.status).toBe(409);
        expect(secondRemove.body.error.code).toBe("CONFLICT");
    });

    it("should reject when project does not exist", async () => {
        const leader = await registerAndLogin("budiman");
        const target = await registerAndLogin("sari");

        const res = await request(app)
            .delete(
                `/api/v1/projects/999999/members/${target.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject invalid project id", async () => {
        const leader = await registerAndLogin("budiman");
        const target = await registerAndLogin("sari");

        const res = await request(app)
            .delete(
                `/api/v1/projects/abc/members/${target.userId}`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject invalid user id", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .delete(
                `/api/v1/projects/${projectId}/members/abc`
            )
            .set("Cookie", leader.cookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .delete("/api/v1/projects/1/members/2");

        expect(res.status).toBe(401);
    });
});