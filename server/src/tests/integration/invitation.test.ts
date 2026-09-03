import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { cleanDatabase, closeDb } from '../helpers/testDb';
import { registerAndLogin } from '../helpers/auth';

export async function createProject(cookie: string) {
    const projectResult = await request(app)
        .post('/api/v1/projects')
        .set('Cookie', cookie)
        .send({ project: { title: 'Website Redesign' }, links: [] });
    return { projectResult };
}

afterAll(async () => {
    await closeDb();
});

describe('POST /api/v1/projects/:id/invitations', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should invite a user successfully as the project leader', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const invitee = await registerAndLogin("sari");

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const invitationsRes = await request(app).get('/api/v1/invitations').set('Cookie', invitee.cookie);
        expect(invitationsRes.body.data.length).toBe(1);
    });

    it('should reject when inviting yourself', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: leader.userId });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it.skip('should reject inviting a user who is already an active member', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const invitee = await registerAndLogin("sari");
        await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });

        // invitee accept dulu
        const invitationsRes = await request(app).get('/api/v1/invitations').set('Cookie', invitee.cookie);
        const invitationId = invitationsRes.body.data[0].id;
        await request(app)
            .patch(`/api/v1/invitations/${invitationId}`)
            .set('Cookie', invitee.cookie)
            .send({ status: 'accept' });

        // leader coba invite lagi user yang SUDAH jadi member aktif
        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });
        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject inviting a user who already has a pending invitation', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const invitee = await registerAndLogin("sari");
        await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject when target user does not exist', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: 999999 });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should reject invitation from a non-leader member', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const { cookie: strangerCookie } = await registerAndLogin("bukan_leader");
        const targetUser = await registerAndLogin("target_orang");

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', strangerCookie)
            .send({ userId: targetUser.userId });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject an invalid (non-numeric) userId', async () => {
        const leader = await registerAndLogin("budiman");
        const { projectResult } = await createProject(leader.cookie);
        const projectId = projectResult.body.data.id;

        const res = await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: "abc" });

        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject request without authentication', async () => {
        const res = await request(app)
            .post('/api/v1/projects/1/invitations')
            .send({ userId: 1 });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/users/search', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should find a user by partial username match', async () => {
        const { cookie } = await registerAndLogin("budiman");
        await registerAndLogin("sari_developer");

        const res = await request(app)
            .get('/api/v1/users/search?username=sari')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].username).toBe('sari_developer');
    });

    it('should not expose the password field', async () => {
        const { cookie } = await registerAndLogin("budiman");
        await registerAndLogin("sari_developer");

        const res = await request(app)
            .get('/api/v1/users/search?username=sari')
            .set('Cookie', cookie);

        expect(res.body.data[0].password).toBeUndefined();
    });

    it('should exclude users already related to the given project', async () => {
        const leader = await registerAndLogin("budiman");
        const projectRes = await request(app)
            .post('/api/v1/projects')
            .set('Cookie', leader.cookie)
            .send({ project: { title: 'Test Project' }, links: [] });
        const projectId = projectRes.body.data.id;

        const invitee = await registerAndLogin("sari_developer");
        await request(app)
            .post(`/api/v1/projects/${projectId}/invitations`)
            .set('Cookie', leader.cookie)
            .send({ userId: invitee.userId });

        const res = await request(app)
            .get(`/api/v1/users/search?username=sari&excludeProjectId=${projectId}`)
            .set('Cookie', leader.cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it('should return an empty array when no user matches', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .get('/api/v1/users/search?username=tidak_ada_user_seperti_ini')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(0);
    });

    it('should reject request without authentication', async () => {
        const res = await request(app).get('/api/v1/users/search?username=budi');

        expect(res.status).toBe(401);
    });
});