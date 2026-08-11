import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from "../../app"
import { cleanDatabase, closeDb } from '../helpers/testDb'
import { registerAndLogin } from "../helpers/auth"

afterAll(async () => {
    await cleanDatabase()
    await closeDb()
})


describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
        await cleanDatabase()
    });

    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budiman", password: "Password123" })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.username).toBe("budiman")
        expect(res.body.data.password).toBeUndefined()
    })

    it('should reject registration with weak password', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budiman", password: "pass" })
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
    it('should reject duplicate username', async () => {
        await request(app).post('/api/v1/auth/register').send({ username: "budiman", password: "Password123" })
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budiman", password: "Password123" })
        expect(res.status).toBe(409)
        expect(res.body.error.code).toBe('CONFLICT')
    })
})

describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
        await cleanDatabase()
        await request(app).post('/api/v1/auth/register').send({ username: "budiman", password: "Password123" })
    })

    it('should be login with credentials', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budiman", password: "Password123" })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.headers['set-cookie']).toBeDefined()
    })
    it('should reject login with wrong password', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budiman", password: "Password12adsasd3" })
        expect(res.status).toBe(401)
        expect(res.body.error.code).toBe("UNAUTHORIZED")
    })
    it('should reject login with non-existent username', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budimaniiiii", password: "Password123" })
        expect(res.status).toBe(401)
        expect(res.body.error.code).toBe("UNAUTHORIZED")
    })

})

describe('PATCH /api/v1/auth/me', () => {
    beforeEach(async () => {
        await cleanDatabase()
    })
    it('should update the information about user', async () => {
        const { cookie, username } = await registerAndLogin("budiman")

        const res = await request(app)
            .patch('/api/v1/auth/me')
            .set('Cookie', cookie)
            .send({ username: "budiman123", fullName: "budiman Santoso" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.username).toBe("budiman123");
        expect(res.body.data.password).toBeUndefined();
        expect(res.body.data.fullName).toBe("budiman Santoso");
        expect(res.body.data.avatarUrl).toBeNull();
    });

    it('should reject update without authentication', async () => {
        const res = await request(app)
            .patch('/api/v1/auth/me')
            .send({ fullName: "budiman Santoso" });

        expect(res.status).toBe(401);
    });

})

describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should show the current user information', async () => {
        const { cookie, username } = await registerAndLogin("budiman")

        const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.data.username).toBe("budiman");
        expect(res.body.data.password).toBeUndefined();
    });

    it('should reject request without authentication', async () => {
        const res = await request(app).get('/api/v1/auth/me');
        expect(res.status).toBe(401);
    });
});