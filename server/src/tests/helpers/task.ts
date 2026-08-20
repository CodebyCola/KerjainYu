import app from "../../app";
import request from "supertest";


export async function getTask(taskId: number, cookie: string) {
    const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set("Cookie", cookie);

    return res.body.data;
}
export async function createTask(leaderCookie: string, projectId: number, overrides: Record<string, any> = {}) {
    return request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set('Cookie', leaderCookie)
        .send({ title: 'Setup CI/CD pipeline', isClaimable: true, ...overrides });
}