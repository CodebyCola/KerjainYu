import request from 'supertest';
import app from '../../app';
import { randomUUID } from 'crypto';

export async function registerAndLogin(username?: string, password = 'Password123') {
    const finalUsername = username ?? `testuser_${randomUUID().slice(0, 8)}`;

    await request(app).post('/api/v1/auth/register').send({ username: finalUsername, password });
    const loginRes = await request(app).post('/api/v1/auth/login').send({ username: finalUsername, password });

    // set-cookie itu array berisi SEMUA cookie yang di-set (accessToken DAN refreshToken sekaligus).
    // Meneruskan array ini apa adanya ke .set('Cookie', cookie) sudah cukup — supertest/superagent
    // otomatis kirim semua cookie di dalamnya dalam satu request.
    return {
        cookie: loginRes.headers['set-cookie'],
        userId: loginRes.body.data.id,
        username: finalUsername,
    };
}