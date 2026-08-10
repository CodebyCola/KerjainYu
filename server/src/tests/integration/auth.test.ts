import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from "../../app"
import { cleanDatabase, closeDb } from '../helpers/testDb'


afterAll(async () => {
    await closeDb()
})


describe('POST /api/v1/auth/register', () => {
    beforeEach(async () => {
        await cleanDatabase()
    });

    it('should register a new user successfully', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budi", password: "Password123" })

        expect(res.status).toBe(201)
        expect(res.body.success).toBe(true)
        expect(res.body.data.username).toBe("budi")
        expect(res.body.data.password).toBeUndefined()
    })

    it('should reject registration with weak password', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budi", password: "pass" })
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
    it('should reject duplicate username', async () => {
        await request(app).post('/api/v1/auth/register').send({ username: "budi", password: "Password123" })
        const res = await request(app).post('/api/v1/auth/register').send({ username: "budi", password: "Password123" })
        expect(res.status).toBe(409)
        expect(res.body.error.code).toBe('CONFLICT')
    })
})

describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
        await cleanDatabase()
        await request(app).post('/api/v1/auth/register').send({ username: "budi", password: "Password123" })
    })

    it('should be login with credentials', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budi", password: "Password123" })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.headers['set-cookie']).toBeDefined()
    })
    it('should reject login with wrong password', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budi", password: "Password12adsasd3" })
        expect(res.status).toBe(401)
        expect(res.body.error.code).toBe("UNAUTHORIZED")
    })
    it('should reject login with non-existent username', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({ username: "budiiiiii", password: "Password123" })
        expect(res.status).toBe(401)
        expect(res.body.error.code).toBe("UNAUTHORIZED")
    })
})