// src/tests/integration/health.test.ts — BARU
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('GET /health', () => {
    it('should return success true', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});