import app from "../../app";
import request from "supertest";


export async function createSwapRequest(
    cookie: string,
    taskId: number,
    requestedTo: number,
    targetTaskId?: number,
) {
    return request(app)
        .post(`/api/v1/tasks/${taskId}/swap-requests`)
        .set("Cookie", cookie)
        .send({
            requestedTo,
            ...(targetTaskId !== undefined ? { targetTaskId } : {}),
        });
}