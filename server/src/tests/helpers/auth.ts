import request from 'supertest';
import app from '../../app';
import { randomUUID } from 'crypto';

export async function registerAndLogin(usernamePrefix = 'testuser') {
    const username = usernamePrefix === 'testuser'
        ? `${usernamePrefix}_${randomUUID().slice(0, 8)}`
        : usernamePrefix;

    const password = 'Password123';

    await request(app).post('/api/v1/auth/register').send({ username, password });
    const loginRes = await request(app).post('/api/v1/auth/login').send({ username, password });
    // console.log('DEBUG loginRes.body:', JSON.stringify(loginRes.body, null, 2)); // TAMBAHIN INI
    return {
        cookie: loginRes.headers['set-cookie'],
        userId: loginRes.body.data.id,
        username,
    };
}