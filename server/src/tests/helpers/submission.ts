import app from "../../app";
import request from "supertest";

export async function createSubmission(
    cookie: string,
    taskId: number,
    data: {
        note?: string;
    } = {},
) {
    return request(app)
        .post(`/api/v1/tasks/${taskId}/submissions`)
        .set("Cookie", cookie)
        .send(data);
}

export async function reviewSubmission(
    cookie: string,
    submissionId: number,
    data: {
        reviewStatus: "approved" | "revision_requested" | "rejected";
        reviewNote?: string;
    },
) {
    return request(app)
        .patch(`/api/v1/submissions/${submissionId}/review`)
        .set("Cookie", cookie)
        .send(data);
}

export async function getPendingSubmissions(
    cookie: string,
    projectId: number,
) {
    return request(app)
        .get(`/api/v1/projects/${projectId}/pending-submissions`)
        .set("Cookie", cookie);
}