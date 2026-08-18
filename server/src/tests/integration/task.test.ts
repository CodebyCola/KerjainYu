import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { cleanDatabase, closeDb } from '../helpers/testDb';
import { registerAndLogin } from '../helpers/auth';
import { createProject, inviteAndAccept } from '../helpers/project';

async function createTask(leaderCookie: string, projectId: number, overrides: Record<string, any> = {}) {
    return request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Cookie', leaderCookie)
        .send({ title: 'Setup CI/CD pipeline', isClaimable: true, ...overrides });
}

afterAll(async () => {
    await closeDb();
});



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


describe('POST /api/v1/projects/:id/tasks', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should create a task successfully as the project leader', async () => {
        const { cookie } = await registerAndLogin("budiman");
        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', cookie)
            .send({ title: 'Design homepage mockup', priority: 1 });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Design homepage mockup');
        expect(res.body.data.projectId).toBe(projectId);
        expect(res.body.data.status).toBe('unclaimed');
    });

    it('should reject when title is missing', async () => {
        const { cookie } = await registerAndLogin("budiman");
        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', cookie)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return not found for a non-existent project', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post('/api/v1/projects/999999/tasks')
            .set('Cookie', cookie)
            .send({ title: 'Some task' });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject request without authentication', async () => {
        const { cookie } = await registerAndLogin("budiman");
        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .send({ title: 'Some task' });

        expect(res.status).toBe(401);
    });

    // NOTE: test ini butuh cara menambahkan member NON-leader ke project
    // (endpoint invite/add-member belum ada saat ini). Aktifkan begitu tersedia.
    it.skip('should reject task creation from a member who is not the leader', async () => {
    });
});

describe('GET /api/v1/tasks/:id', () => {
    beforeEach(async () => {
        await cleanDatabase();
    })

    it('should return detail task by id where the user is belong to the project', async () => {
        const { cookie } = await registerAndLogin("budiman")
        const { projectResult } = await createProject(cookie)
        const projectId = projectResult.body.data.id
        const task = await request(app).post(`/api/v1/projects/${projectId}/tasks`).set('Cookie', cookie).send({ title: 'Some task' });
        const res = await request(app).get(`/api/v1/tasks/${task.body.data.id}`).set('Cookie', cookie)

        expect(res.status).toBe(200)
        expect(res.body.data.id).toBe(task.body.data.id)
    });

    it('should reject return detail task by id where the user is NOT belong to the project', async () => {
        const { cookie } = await registerAndLogin("budiman")
        const { cookie: stranger_cookie } = await registerAndLogin("stranger")
        const { projectResult } = await createProject(cookie)
        const projectId = projectResult.body.data.id
        const task = await request(app).post(`/api/v1/projects/${projectId}/tasks`).set('Cookie', cookie).send({ title: 'Some task' });
        const res = await request(app).get(`/api/v1/tasks/${task.body.data.id}`).set('Cookie', stranger_cookie)
        // console.log(res.body.data)

        expect(res.status).toBe(403)
    })

    it('should return 404 Not Found error for task that is not exist', async () => {
        const { cookie } = await registerAndLogin("budiman")
        const { projectResult } = await createProject(cookie)
        const projectId = projectResult.body.data.id
        const task = await request(app).post(`/api/v1/projects/${projectId}/tasks`).set('Cookie', cookie).send({ title: 'Some task' });
        const res = await request(app).get(`/api/v1/tasks/124141523`).set('Cookie', cookie)

        expect(res.status).toBe(404)
    })
})


describe('PATCH /api/v1/tasks/:id', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should update a task successfully as the project leader', async () => {
        const { cookie } = await registerAndLogin("budiman");
        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', cookie)
            .send({ title: 'Design homepage mockup' });
        const taskId = createRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}`)
            .set('Cookie', cookie)
            .send({ status: 'ongoing', priority: 2 });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('ongoing');
        expect(res.body.data.priority).toBe(2);
    });

    it('should return not found for a non-existent task', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch('/api/v1/tasks/999999')
            .set('Cookie', cookie)
            .send({ status: 'ongoing' });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject update from a user who is not the project leader', async () => {
        const owner = await registerAndLogin("budiman");
        const { projectResult } = await createProject(owner.cookie);
        const projectId = projectResult.body.data.id;

        const createRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', owner.cookie)
            .send({ title: 'Design homepage mockup' });
        const taskId = createRes.body.data.id;

        const { cookie: strangerCookie } = await registerAndLogin("bukan_leader");

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}`)
            .set('Cookie', strangerCookie)
            .send({ status: 'ongoing' });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject request without authentication', async () => {
        const res = await request(app)
            .patch('/api/v1/tasks/1')
            .send({ status: 'ongoing' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should return an empty array when the user has no assigned tasks', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app).get('/api/v1/tasks').set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(0);
    });

    it('should reject request without authentication', async () => {
        const res = await request(app).get('/api/v1/tasks');

        expect(res.status).toBe(401);
    });
});

afterAll(async () => {
    await closeDb();
});

describe('PATCH /api/v1/tasks/:id/claim', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should let a project member claim an unclaimed, claimable task', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(leader.cookie, projectId);

        const taskRes = await createTask(leader.cookie, projectId);
        const taskId = taskRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', member.cookie);
        expect(res.status).toBe(200);
        expect(res.body.data.assigneeId).toBe(member.userId);
        expect(res.body.data.status).toBe('todo');
    });

    it('should reject claiming a task that is not claimable', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const member = await inviteAndAccept(leader.cookie, projectId);

        const taskRes = await createTask(leader.cookie, projectId, { isClaimable: false });
        const taskId = taskRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', member.cookie);

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject claiming a task that has already been claimed', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const firstClaimer = await inviteAndAccept(leader.cookie, projectId, "sari");
        const secondClaimer = await inviteAndAccept(leader.cookie, projectId, "citra");

        const taskRes = await createTask(leader.cookie, projectId);
        const taskId = taskRes.body.data.id;

        await request(app).patch(`/api/v1/tasks/${taskId}/claim`).set('Cookie', firstClaimer.cookie);

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', secondClaimer.cookie);

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should allow only ONE claim to succeed when two members claim simultaneously (race condition)', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const claimerA = await inviteAndAccept(leader.cookie, projectId, "sari");
        const claimerB = await inviteAndAccept(leader.cookie, projectId, "citra");

        const taskRes = await createTask(leader.cookie, projectId);
        const taskId = taskRes.body.data.id;

        // fire kedua request BERSAMAAN, bukan berurutan — ini yang membuktikan
        // atomic update di level database beneran mencegah double-claim
        const [resA, resB] = await Promise.all([
            request(app).patch(`/api/v1/tasks/${taskId}/claim`).set('Cookie', claimerA.cookie),
            request(app).patch(`/api/v1/tasks/${taskId}/claim`).set('Cookie', claimerB.cookie),
        ]);

        const statuses = [resA.status, resB.status].sort();
        expect(statuses).toEqual([200, 409]); // tepat satu sukses, satu gagal — bukan 200/200

        const detailRes = await request(app)
            .get(`/api/v1/projects/${projectId}/tasks`)
            .set('Cookie', leader.cookie);
        const claimedTask = detailRes.body.data.find((t: any) => t.id === taskId);
        expect(claimedTask.status).toBe('todo');
        expect([claimerA.userId, claimerB.userId]).toContain(claimedTask.assigneeId);
    });

    it('should return not found for a non-existent task', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch('/api/v1/tasks/999999/claim')
            .set('Cookie', cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject claiming from a user who is not a project member', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const taskRes = await createTask(leader.cookie, projectId);
        const taskId = taskRes.body.data.id;

        const { cookie: strangerCookie } = await registerAndLogin("bukan_member");

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set('Cookie', strangerCookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject request without authentication', async () => {
        const res = await request(app).patch('/api/v1/tasks/1/claim');

        expect(res.status).toBe(401);
    });
});

describe("PATCH /api/v1/tasks/:id/ongoing", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should change task status to ongoing for the assignee", async () => {
        const { cookie, userId } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        // Create task
        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", cookie)
            .send({
                title: "Implement authentication",
                description: "Implement JWT authentication",
                deadline: "2026-09-30",
            });

        expect(taskRes.status).toBe(201);

        const taskId = taskRes.body.data.id;

        // Claim task so user becomes assignee
        const claimRes = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set("Cookie", cookie);

        expect(claimRes.status).toBe(200);

        // Start working on task
        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/ongoing`)
            .set("Cookie", cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(taskId);
        expect(res.body.data.status).toBe("ongoing");
    });

    it("should return not found for non-existent task", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch("/api/v1/tasks/999999/ongoing")
            .set("Cookie", cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should reject a user who is not a member of the project", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", leader.cookie)
            .send({
                title: "Implement authentication",
                description: "Implement JWT authentication",
                deadline: "2026-09-30",
            });

        const taskId = taskRes.body.data.id;

        const stranger = await registerAndLogin("stranger");

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/ongoing`)
            .set("Cookie", stranger.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject a project member who is not the assignee", async () => {
        const leader = await registerAndLogin("budiman");

        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", leader.cookie)
            .send({
                title: "Implement authentication",
                description: "Implement JWT authentication",
                deadline: "2026-09-30",
            });

        const taskId = taskRes.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "sari",
        );

        const res = await request(app)
            .patch(`/api/v1/tasks/${taskId}/ongoing`)
            .set("Cookie", member.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("should reject a task that is not in todo status", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const { projectResult } = await createProject(cookie);
        const projectId = projectResult.body.data.id;

        const taskRes = await request(app)
            .post(`/api/v1/projects/${projectId}/tasks`)
            .set("Cookie", cookie)
            .send({
                title: "Implement authentication",
                description: "Implement JWT authentication",
                deadline: "2026-09-30",
            });

        const taskId = taskRes.body.data.id;

        // Claim → user becomes assignee
        const claimRes = await request(app)
            .patch(`/api/v1/tasks/${taskId}/claim`)
            .set("Cookie", cookie);

        expect(claimRes.status).toBe(200);

        // First request changes todo → ongoing
        const firstRes = await request(app)
            .patch(`/api/v1/tasks/${taskId}/ongoing`)
            .set("Cookie", cookie);

        expect(firstRes.status).toBe(200);
        expect(firstRes.body.data.status).toBe("ongoing");

        // Second request should fail
        const secondRes = await request(app)
            .patch(`/api/v1/tasks/${taskId}/ongoing`)
            .set("Cookie", cookie);

        expect(secondRes.status).toBe(409);
        expect(secondRes.body.error.code).toBe("CONFLICT");
    });

    it("should reject request without authentication", async () => {
        const res = await request(app)
            .patch("/api/v1/tasks/1/ongoing");

        expect(res.status).toBe(401);
    });

    it("should reject invalid task id", async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .patch("/api/v1/tasks/abc/ongoing")
            .set("Cookie", cookie);

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
});