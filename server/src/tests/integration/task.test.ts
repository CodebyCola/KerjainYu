import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { cleanDatabase, closeDb } from '../helpers/testDb';
import { registerAndLogin } from '../helpers/auth';

export async function createProject(cookie: string) {
    const projectResult = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookie)
        .send({
            project: { title: 'Website Redesign', deadline: '2026-09-30' },
            links: [],
        });
    return { projectResult };
}

afterAll(async () => {
    await closeDb();
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
        // TODO: setup member biasa, lalu assert 403 FORBIDDEN
    });
});

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