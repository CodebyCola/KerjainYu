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

    it('should be login with credentials and set both accessToken and refreshToken cookies', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budiman", password: "Password123" })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)

        const cookies = res.headers['set-cookie'] as unknown as string[];
        expect(cookies).toBeDefined();
        expect(cookies.some(c => c.startsWith('accessToken='))).toBe(true);
        expect(cookies.some(c => c.startsWith('refreshToken='))).toBe(true);

        expect(res.body.data.accessToken).toBeUndefined();
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

describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should issue a new accessToken and rotate the refreshToken', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const newCookies = res.headers['set-cookie'] as unknown as string[];
        expect(newCookies.some(c => c.startsWith('accessToken='))).toBe(true);
        expect(newCookies.some(c => c.startsWith('refreshToken='))).toBe(true);
    });

    it('should reject if the old refreshToken is used again after rotation', async () => {
        const { cookie } = await registerAndLogin("budiman");

        // Pakai refresh token pertama kali — ini harus berhasil dan me-rotate token
        const firstRefresh = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookie);
        expect(firstRefresh.status).toBe(200);

        // Pakai COOKIE LAMA (dari login, bukan dari hasil refresh) lagi — harus ditolak
        const secondRefresh = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookie);

        expect(secondRefresh.status).toBe(401);
        expect(secondRefresh.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject when no refreshToken cookie is provided', async () => {
        const res = await request(app).post('/api/v1/auth/refresh');

        expect(res.status).toBe(401);
    });
});

describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it('should log out successfully and clear cookies', async () => {
        const { cookie } = await registerAndLogin("budiman");

        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const clearedCookies = res.headers['set-cookie'] as unknown as string[];
        expect(clearedCookies.some(c => c.startsWith('accessToken=;') || c.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
    });

    it('should reject using the refreshToken again after logout', async () => {
        const { cookie } = await registerAndLogin("budiman");

        await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);

        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .set('Cookie', cookie);

        expect(res.status).toBe(401);
    });

    it('should still succeed even without a refreshToken cookie (idempotent)', async () => {
        const res = await request(app).post('/api/v1/auth/logout');
        console.log(res)
        expect(res.status).toBe(200);
    });
});