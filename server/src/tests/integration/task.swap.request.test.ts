import request from "supertest";
import app from "../../app";
import { db } from "../../database/db";

import { registerAndLogin } from "../helpers/auth";
import { createProject, inviteAndAccept } from "../helpers/project";
import { getTask } from "../helpers/task";
import { closeDb } from "../helpers/testDb";
import { afterAll, describe, expect, it } from "vitest";

afterAll(async () => {
    await closeDb();
});

// ============================================================
// HELPERS
// ============================================================

async function createTask(
    cookie: string,
    projectId: number,
    title = "Task for swap",
) {
    const res = await request(app)
        .post(`/api/v1/projects/${projectId}/tasks`)
        .set("Cookie", cookie)
        .send({
            title,
            description: "Task used for swap integration tests",
        });

    return res;
}


async function claimTask(
    cookie: string,
    taskId: number,
) {
    return request(app)
        .patch(`/api/v1/tasks/${taskId}/claim`)
        .set("Cookie", cookie);
}


async function assignTask(
    leaderCookie: string,
    taskId: number,
    userId: number,
) {
    return request(app)
        .patch(`/api/v1/tasks/${taskId}/assign`)
        .set("Cookie", leaderCookie)
        .send({
            userId,
        });
}


async function createSwapRequest(
    cookie: string,
    taskId: number,
    requestedTo: number,
    targetTaskId?: number,
) {
    const body: {
        requestedTo: number;
        targetTaskId?: number;
    } = {
        requestedTo,
    };

    if (targetTaskId !== undefined) {
        body.targetTaskId = targetTaskId;
    }

    return request(app)
        .post(`/api/v1/tasks/${taskId}/swap-requests`)
        .set("Cookie", cookie)
        .send(body);
}


async function getSwapRequestFromDb(id: number) {
    return db("task_swap_requests")
        .where({ id })
        .first();
}


async function getTaskFromDb(id: number) {
    return db("tasks")
        .where({ id })
        .first();
}


// ============================================================
// CREATE SWAP REQUEST
// ============================================================

describe("POST /api/v1/tasks/:id/swap-requests", () => {

    it("should create a one-way swap request successfully", async () => {
        const leader = await registerAndLogin("swap_leader_1");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_member_1",
        );

        const target = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_target_1",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Swap task",
        );

        expect(taskRes.status).toBe(201);

        const taskId = taskRes.body.data.id;

        const assignRes = await assignTask(
            leader.cookie,
            taskId,
            member.userId,
        );

        expect(assignRes.status).toBe(200);

        const res = await createSwapRequest(
            member.cookie,
            taskId,
            leader.userId,
        );

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        expect(res.body.data).toEqual(
            expect.objectContaining({
                taskId,
                requestedBy: member.userId,
                requestedTo: leader.userId,
                targetTaskId: null,
                status: "pending",
            }),
        );
    });


    it("should create a two-way task swap successfully", async () => {
        const leader = await registerAndLogin("swap_leader_2");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_user_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_user_b",
        );

        const taskARes = await createTask(
            leader.cookie,
            projectId,
            "Task A",
        );

        const taskBRes = await createTask(
            leader.cookie,
            projectId,
            "Task B",
        );

        expect(taskARes.status).toBe(201);
        expect(taskBRes.status).toBe(201);

        const taskAId = taskARes.body.data.id;
        const taskBId = taskBRes.body.data.id;

        // Assign Task A → User A
        const assignA = await assignTask(
            leader.cookie,
            taskAId,
            userA.userId,
        );

        // Assign Task B → User B
        const assignB = await assignTask(
            leader.cookie,
            taskBId,
            userB.userId,
        );

        expect(assignA.status).toBe(200);
        expect(assignB.status).toBe(200);

        // Verify actual task state before creating swap
        const taskA = await getTask(taskAId, leader.cookie);
        const taskB = await getTask(taskBId, leader.cookie);


        expect(taskA.assigneeId).toBe(userA.userId);
        expect(taskB.assigneeId).toBe(userB.userId);

        expect(taskA.status).toBe("todo");
        expect(taskB.status).toBe("todo");



        // User A offers Task A ↔ Task B to User B
        const swapRes = await createSwapRequest(
            userA.cookie,
            taskAId,
            userB.userId,
            taskBId,
        );
        expect(swapRes.status).toBe(200);
        expect(swapRes.body.success).toBe(true);

        expect(swapRes.body.data).toEqual(
            expect.objectContaining({
                taskId: taskAId,
                targetTaskId: taskBId,
                requestedBy: userA.userId,
                requestedTo: userB.userId,
                status: "pending",
            }),
        );
    });

    it("should reject swap request from a user who does not own the task", async () => {
        const leader = await registerAndLogin("swap_leader_3");
        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_owner",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_not_owner",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Owned task",
        );

        const taskId = taskRes.body.data.id;

        const assignRes = await assignTask(
            leader.cookie,
            taskId,
            userA.userId,
        );

        expect(assignRes.status).toBe(200);

        const res = await createSwapRequest(
            userB.cookie,
            taskId,
            userA.userId,
        );

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });


    it("should reject swapping a task with yourself", async () => {
        const leader = await registerAndLogin("swap_leader_4");
        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const member = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_self",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Self swap task",
        );

        const taskId = taskRes.body.data.id;

        const assignRes = await assignTask(
            leader.cookie,
            taskId,
            member.userId,
        );

        expect(assignRes.status).toBe(200);

        const res = await createSwapRequest(
            member.cookie,
            taskId,
            member.userId,
        );


        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });


    it("should reject swapping a task with itself", async () => {
        const leader = await registerAndLogin("swap_leader_5");
        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_self_task",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_self_task_target",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Same task",
        );

        const taskId = taskRes.body.data.id;

        const assignRes = await assignTask(
            leader.cookie,
            taskId,
            userA.userId,
        );

        expect(assignRes.status).toBe(200);

        const res = await createSwapRequest(
            userA.cookie,
            taskId,
            userB.userId,
            taskId,
        );

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });


    it("should reject target task belonging to another user", async () => {
        const leader = await registerAndLogin("swap_leader_6");
        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_owner_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_owner_b",
        );

        const userC = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_owner_c",
        );

        const taskARes = await createTask(
            leader.cookie,
            projectId,
            "Task A",
        );

        const taskBRes = await createTask(
            leader.cookie,
            projectId,
            "Task B",
        );

        const taskAId = taskARes.body.data.id;
        const taskBId = taskBRes.body.data.id;

        expect(
            (await assignTask(leader.cookie, taskAId, userA.userId)).status
        ).toBe(200);

        expect(
            (await assignTask(leader.cookie, taskBId, userC.userId)).status
        ).toBe(200);

        const res = await createSwapRequest(
            userA.cookie,
            taskAId,
            userB.userId,
            taskBId,
        );

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });


    it("should reject target task from another project", async () => {
        const leader = await registerAndLogin("swap_leader_7");

        const project1 = await createProject(leader.cookie);
        const project2 = await createProject(leader.cookie);

        const userA = await inviteAndAccept(
            leader.cookie,
            project1.projectResult.body.data.id,
            "swap_cross_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            project2.projectResult.body.data.id,
            "swap_cross_b",
        );

        const taskARes = await createTask(
            leader.cookie,
            project1.projectResult.body.data.id,
            "Project 1 task",
        );

        const taskBRes = await createTask(
            leader.cookie,
            project2.projectResult.body.data.id,
            "Project 2 task",
        );

        const taskAId = taskARes.body.data.id;
        const taskBId = taskBRes.body.data.id;

        expect(
            (await assignTask(leader.cookie, taskAId, userA.userId)).status
        ).toBe(200);

        expect(
            (await assignTask(leader.cookie, taskBId, userB.userId)).status
        ).toBe(200);

        const res = await createSwapRequest(
            userA.cookie,
            taskAId,
            userB.userId,
            taskBId,
        );

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
    });


    it("should reject a second pending swap request for the same task", async () => {
        const leader = await registerAndLogin("swap_leader_8");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_pending_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_pending_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Pending task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(leader.cookie, taskId, userA.userId)).status
        ).toBe(200);

        const first = await createSwapRequest(
            userA.cookie,
            taskId,
            userB.userId,
        );

        expect(first.status).toBe(200);

        const second = await createSwapRequest(
            userA.cookie,
            taskId,
            userB.userId,
        );

        expect(second.status).toBe(409);
        expect(second.body.error.code).toBe("CONFLICT");
    });


    it("should reject swap for a task that is not todo or ongoing", async () => {
        const leader = await registerAndLogin("swap_leader_9");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_status_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_status_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Completed task",
        );

        expect(taskRes.status).toBe(201);

        const taskId = taskRes.body.data.id;

        const assignRes = await request(app)
            .patch(`/api/v1/tasks/${taskId}/assign`)
            .set("Cookie", leader.cookie)
            .send({
                userId: userA.userId,
            });

        expect(assignRes.status).toBe(200);

        await db("tasks")
            .where({ id: taskId })
            .update({
                status: "submitted",
            });

        const res = await createSwapRequest(
            userA.cookie,
            taskId,
            userB.userId,
        );

        expect(res.status).toBe(409);
        expect(res.body.error.code).toBe("CONFLICT");
        expect(res.body.error.message).toBe(
            "Only tasks with status 'todo' or 'ongoing' can be swapped"
        );
    });

    it("should reject request when target user is not a project member", async () => {
        const leader = await registerAndLogin("swap_leader_10");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "swap_member_only",
        );

        const outsider = await registerAndLogin("swap_outsider");

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Member task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                userA.userId,
            )).status
        ).toBe(200);

        const res = await createSwapRequest(
            userA.cookie,
            taskId,
            outsider.userId,
        );

        expect(res.status).toBe(403);
    });


    it("should reject unauthenticated request", async () => {
        const leader = await registerAndLogin("swap_leader_11");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Auth task",
        );

        const taskId = taskRes.body.data.id;

        const res = await request(app)
            .post(`/api/v1/tasks/${taskId}/swap-requests`)
            .send({
                requestedTo: leader.userId,
            });

        expect(res.status).toBe(401);
    });


    it("should reject invalid task id", async () => {
        const user = await registerAndLogin("swap_invalid_task");

        const res = await request(app)
            .post("/api/v1/tasks/not-a-number/swap-requests")
            .set("Cookie", user.cookie)
            .send({
                requestedTo: user.userId + 1,
            });

        expect(res.status).toBe(400);
    });
});


// ============================================================
// RESPOND — FREE SWAP
// ============================================================

describe("PATCH /api/v1/swap-requests/:id/respond", () => {

    it("should approve a one-way swap when free swap is enabled", async () => {
        const leader = await registerAndLogin("respond_leader_1");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_a",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Respond task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        // Pastikan project memang allowFreeSwap.
        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        expect(swapRes.status).toBe(200);

        const swapId = swapRes.body.data.id;

        const respondRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberB.cookie)
            .send({
                status: "approved",
            });

        expect(respondRes.status).toBe(204);

        const swapAfter = await getSwapRequestFromDb(swapId);

        expect(swapAfter.status).toBe("approved");
        expect(swapAfter.resolvedBy).toBeNull();

        const taskAfter = await getTaskFromDb(taskId);

        expect(taskAfter.assigneeId).toBe(memberB.userId);
    });


    it("should reject a swap when requestedTo rejects it", async () => {
        const leader = await registerAndLogin("respond_leader_2");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_reject_a",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_reject_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Rejected task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        const swapId = swapRes.body.data.id;

        const respondRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberB.cookie)
            .send({
                status: "rejected",
            });

        expect(respondRes.status).toBe(204);

        const swapAfter = await getSwapRequestFromDb(swapId);

        expect(swapAfter.status).toBe("rejected");
        expect(swapAfter.resolvedBy).toBeNull();

        const taskAfter = await getTaskFromDb(taskId);

        expect(taskAfter.assigneeId).toBe(memberA.userId);
    });


    it("should reject response from a user who is not requestedTo when free swap is enabled", async () => {
        const leader = await registerAndLogin("respond_leader_3");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_owner",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_target",
        );

        const memberC = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_wrong",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Wrong responder task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        const swapId = swapRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberC.cookie)
            .send({
                status: "approved",
            });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });


    // ========================================================
    // LEADER APPROVAL
    // ========================================================

    it("should allow the leader to approve when free swap is disabled", async () => {
        const leader = await registerAndLogin("respond_leader_4");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_leader_mode_a",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_leader_mode_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Leader approval task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: false });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        const swapId = swapRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", leader.cookie)
            .send({
                status: "approved",
            });

        expect(res.status).toBe(204);

        const swapAfter = await getSwapRequestFromDb(swapId);

        expect(swapAfter.status).toBe("approved");
        expect(swapAfter.resolvedBy).toBe(leader.userId);

        const taskAfter = await getTaskFromDb(taskId);

        expect(taskAfter.assigneeId).toBe(memberB.userId);
    });


    it("should reject response from non-leader when free swap is disabled", async () => {
        const leader = await registerAndLogin("respond_leader_5");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_nonleader_a",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_nonleader_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Leader required task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: false });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        const swapId = swapRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberB.cookie)
            .send({
                status: "approved",
            });

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });


    it("should reject responding to a non-existent swap request", async () => {
        const user = await registerAndLogin("respond_not_found");

        const res = await request(app)
            .patch("/api/v1/swap-requests/999999/respond")
            .set("Cookie", user.cookie)
            .send({
                status: "approved",
            });

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });


    it("should reject responding to an already resolved swap request", async () => {
        const leader = await registerAndLogin("respond_duplicate");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const memberA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_duplicate_a",
        );

        const memberB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "respond_duplicate_b",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Already responded",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                memberA.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            memberA.cookie,
            taskId,
            memberB.userId,
        );

        const swapId = swapRes.body.data.id;

        const first = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberB.cookie)
            .send({
                status: "rejected",
            });

        expect(first.status).toBe(204);

        const second = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", memberB.cookie)
            .send({
                status: "approved",
            });

        expect(second.status).toBe(409);
        expect(second.body.error.code).toBe("CONFLICT");
    });


    it("should reject invalid response status", async () => {
        const user = await registerAndLogin("respond_invalid_status");

        const res = await request(app)
            .patch("/api/v1/swap-requests/1/respond")
            .set("Cookie", user.cookie)
            .send({
                status: "cancelled",
            });

        expect(res.status).toBe(400);
    });


    it("should reject unauthenticated response", async () => {
        const res = await request(app)
            .patch("/api/v1/swap-requests/1/respond")
            .send({
                status: "approved",
            });

        expect(res.status).toBe(401);
    });
});


// ============================================================
// TWO-WAY SWAP
// ============================================================

describe("Two-way task swap", () => {

    it("should exchange both task owners when approved", async () => {
        const leader = await registerAndLogin("two_way_leader");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "two_way_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "two_way_b",
        );

        const taskARes = await createTask(
            leader.cookie,
            projectId,
            "Task A",
        );

        const taskBRes = await createTask(
            leader.cookie,
            projectId,
            "Task B",
        );

        const taskAId = taskARes.body.data.id;
        const taskBId = taskBRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskAId,
                userA.userId,
            )).status
        ).toBe(200);

        expect(
            (await assignTask(
                leader.cookie,
                taskBId,
                userB.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            userA.cookie,
            taskAId,
            userB.userId,
            taskBId,
        );
        expect(swapRes.status).toBe(200);

        const swapId = swapRes.body.data.id;

        const respondRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", userB.cookie)
            .send({
                status: "approved",
            });

        expect(respondRes.status).toBe(204);

        const taskA = await getTaskFromDb(taskAId);
        const taskB = await getTaskFromDb(taskBId);

        expect(taskA.assigneeId).toBe(userB.userId);
        expect(taskB.assigneeId).toBe(userA.userId);
    });


    it("should keep both task owners unchanged when two-way swap is rejected", async () => {
        const leader = await registerAndLogin("two_way_reject_leader");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const userA = await inviteAndAccept(
            leader.cookie,
            projectId,
            "two_way_reject_a",
        );

        const userB = await inviteAndAccept(
            leader.cookie,
            projectId,
            "two_way_reject_b",
        );

        const taskARes = await createTask(
            leader.cookie,
            projectId,
            "Reject A",
        );

        const taskBRes = await createTask(
            leader.cookie,
            projectId,
            "Reject B",
        );

        const taskAId = taskARes.body.data.id;
        const taskBId = taskBRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskAId,
                userA.userId,
            )).status
        ).toBe(200);

        expect(
            (await assignTask(
                leader.cookie,
                taskBId,
                userB.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            userA.cookie,
            taskAId,
            userB.userId,
            taskBId,
        );

        const swapId = swapRes.body.data.id;

        const respondRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", userB.cookie)
            .send({
                status: "rejected",
            });

        expect(respondRes.status).toBe(204);

        const taskA = await getTaskFromDb(taskAId);
        const taskB = await getTaskFromDb(taskBId);

        expect(taskA.assigneeId).toBe(userA.userId);
        expect(taskB.assigneeId).toBe(userB.userId);
    });
});


// ============================================================
// CANCEL
// ============================================================

describe("PATCH /api/v1/swap-requests/:id/cancel", () => {

    it("should allow the requester to cancel their pending swap request", async () => {
        const leader = await registerAndLogin("cancel_leader_1");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const requester = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_requester",
        );

        const target = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_target",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Cancel task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                requester.userId,
            )).status
        ).toBe(200);

        const swapRes = await createSwapRequest(
            requester.cookie,
            taskId,
            target.userId,
        );

        expect(swapRes.status).toBe(200);

        const swapId = swapRes.body.data.id;

        const cancelRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/cancel`)
            .set("Cookie", requester.cookie);

        expect(cancelRes.status).toBe(204);

        const swapAfter = await getSwapRequestFromDb(swapId);

        expect(swapAfter.status).toBe("cancelled");
        expect(swapAfter.resolvedBy).toBeNull();

        const taskAfter = await getTaskFromDb(taskId);

        expect(taskAfter.assigneeId).toBe(requester.userId);
    });


    it("should reject cancellation by requestedTo", async () => {
        const leader = await registerAndLogin("cancel_leader_2");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const requester = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_requester_2",
        );

        const target = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_target_2",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Cancel auth task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                requester.userId,
            )).status
        ).toBe(200);

        const swapRes = await createSwapRequest(
            requester.cookie,
            taskId,
            target.userId,
        );

        const swapId = swapRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/cancel`)
            .set("Cookie", target.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });


    it("should reject cancellation by another user", async () => {
        const leader = await registerAndLogin("cancel_leader_3");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const requester = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_requester_3",
        );

        const target = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_target_3",
        );

        const stranger = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_stranger_3",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Cancel stranger task",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                requester.userId,
            )).status
        ).toBe(200);

        const swapRes = await createSwapRequest(
            requester.cookie,
            taskId,
            target.userId,
        );

        const swapId = swapRes.body.data.id;

        const res = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/cancel`)
            .set("Cookie", stranger.cookie);

        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe("FORBIDDEN");
    });


    it("should reject cancelling an already responded swap request", async () => {
        const leader = await registerAndLogin("cancel_leader_4");

        const project = await createProject(leader.cookie);
        const projectId = project.projectResult.body.data.id;

        const requester = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_resolved_requester",
        );

        const target = await inviteAndAccept(
            leader.cookie,
            projectId,
            "cancel_resolved_target",
        );

        const taskRes = await createTask(
            leader.cookie,
            projectId,
            "Resolved cancellation",
        );

        const taskId = taskRes.body.data.id;

        expect(
            (await assignTask(
                leader.cookie,
                taskId,
                requester.userId,
            )).status
        ).toBe(200);

        await db("projects")
            .where({ id: projectId })
            .update({ allow_free_swap: true });

        const swapRes = await createSwapRequest(
            requester.cookie,
            taskId,
            target.userId,
        );

        const swapId = swapRes.body.data.id;

        const respondRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/respond`)
            .set("Cookie", target.cookie)
            .send({
                status: "rejected",
            });

        expect(respondRes.status).toBe(204);

        const cancelRes = await request(app)
            .patch(`/api/v1/swap-requests/${swapId}/cancel`)
            .set("Cookie", requester.cookie);

        expect(cancelRes.status).toBe(409);
        expect(cancelRes.body.error.code).toBe("CONFLICT");
    });


    it("should reject cancellation of a non-existent swap request", async () => {
        const user = await registerAndLogin("cancel_not_found");

        const res = await request(app)
            .patch("/api/v1/swap-requests/999999/cancel")
            .set("Cookie", user.cookie);

        expect(res.status).toBe(404);
        expect(res.body.error.code).toBe("NOT_FOUND");
    });


    it("should reject unauthenticated cancellation", async () => {
        const res = await request(app)
            .patch("/api/v1/swap-requests/1/cancel");

        expect(res.status).toBe(401);
    });


    it("should reject invalid swap request id", async () => {
        const user = await registerAndLogin("cancel_invalid_id");

        const res = await request(app)
            .patch("/api/v1/swap-requests/not-a-number/cancel")
            .set("Cookie", user.cookie);

        expect(res.status).toBe(400);
    });
});