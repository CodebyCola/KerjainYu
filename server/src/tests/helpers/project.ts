import app from "../../app";
import request from "supertest";
import { registerAndLogin } from "./auth";
import { db } from "../../database/db";

export async function createProject(cookie: string) {
    const projectResult = await request(app)
        .post("/api/v1/projects")
        .set("Cookie", cookie)
        .send({
            project: { title: "Website Redesign", deadline: "2026-09-30" },
            links: [
                {
                    label: "Figma",
                    url: "https://figma.com/file/abc",
                    category: "design",
                },
            ],
        });
    return { projectResult };
}

export async function inviteAndAccept(leaderCookie: string, projectId: number, inviteeUsername = 'sari') {
    const invitee = await registerAndLogin(inviteeUsername);
    await request(app)
        .post(`/api/v1/projects/${projectId}/invitations`)
        .set('Cookie', leaderCookie)
        .send({ userId: invitee.userId });

    const invitationsRes = await request(app).get('/api/v1/invitations').set('Cookie', invitee.cookie);
    const invitationId = invitationsRes.body.data[0].id;
    const acceptRes = await request(app)
        .patch(`/api/v1/invitations/${invitationId}`)
        .set('Cookie', invitee.cookie)
        .send({ status: 'accept' });
    // console.log('accept:', acceptRes.status, JSON.stringify(acceptRes.body));

    const rawRow = await db('project_members').where({ userId: invitee.userId, projectId }).first();
    // console.log('DB row after accept:', rawRow);
    // console.log('accept:', acceptRes.status, JSON.stringify(acceptRes.body)); // TAMBAHIN
    return invitee;
}
export async function getMembers(cookie: string, projectId: number) {
    const res = await request(app).get(`/api/v1/projects/${projectId}/members`).set('Cookie', cookie);
    return res.body.data as Array<{ userId: number; role: string; status: string }>;
}