import * as taskSwapRequestRepo from "../database/repositories/task.swap.request.repository"
import * as taskRepo from "../database/repositories/task.repository"
import * as projectRepo from "../database/repositories/project.repository"
import { createTaskLogOwnership } from "../database/repositories/task_ownership_log.repository"
import { NotFoundError, ConflictError, ForbiddenError } from "../errors/AppError"
import { assertTaskAccess } from "./helper/task.helper"
import { assertProjectLeader, assertProjectMembership } from "./helper/auhtorization.helper";
import { db } from "../database/db"

export async function createSwapTask(
    taskId: number,
    requestedBy: number,
    requestedTo: number,
    targetTaskId?: number,
) {
    const task = await assertTaskAccess(taskId, requestedBy);

    if (task.assigneeId != requestedBy) {
        throw new ForbiddenError("You can only offer a swap for a task assigned to you");
    }
    if (!['todo', 'ongoing'].includes(task.status)) {
        throw new ConflictError("Only tasks with status 'todo' or 'ongoing' can be swapped");
    }
    if (requestedBy == requestedTo) {
        throw new ConflictError("You cannot request a swap with yourself");
    }

    let targetTask = null;
    if (targetTaskId) {
        if (targetTaskId == taskId) {
            throw new ConflictError("Cannot swap a task with itself");
        }
        targetTask = await assertTaskAccess(targetTaskId, requestedTo);
        if (targetTask.assigneeId != requestedTo) {
            throw new ConflictError("Target task does not belong to the user you're requesting to swap with");
        }
        if (targetTask.projectId !== task.projectId) {
            throw new ConflictError("Both tasks must belong to the same project");
        }
        if (!['todo', 'ongoing'].includes(targetTask.status)) {
            throw new ConflictError("Target task must be in 'todo' or 'ongoing' status");
        }
    } else {
        await assertProjectMembership(task.projectId, requestedTo);
    }

    const existingPending = await taskSwapRequestRepo.getPendingSwapRequestForTask(taskId);
    if (existingPending) {
        throw new ConflictError("This task already has a pending swap request");
    }

    return taskSwapRequestRepo.createSwapRequest({ taskId, targetTaskId, requestedBy, requestedTo });
}
//PATCH /api/v1/swap-requests/:id/respond
export async function respondSwapRequest(
    swapId: number,
    userId: number,
    status: "approved" | "rejected"
) {
    const swapRequest = await taskSwapRequestRepo.getSwapRequestById(swapId);
    if (!swapRequest) {
        throw new NotFoundError("Swap request not found");
    }
    if (swapRequest.status !== "pending") {
        throw new ConflictError("This swap request has already been responded to");
    }

    const task = await taskRepo.getTaskById(swapRequest.taskId);
    if (!task) {
        throw new NotFoundError("Task not found");
    }
    const project = await projectRepo.getProjectById(task.projectId);
    if (!project) {
        throw new NotFoundError("Project not found");
    }

    let resolvedBy: number | null = null;

    if (project.allowFreeSwap) {
        if (userId !== swapRequest.requestedTo) {
            throw new ForbiddenError("Only the user you're requesting to swap with can respond to this request");
        }
        resolvedBy = null;
    } else {
        // butuh leader
        await assertProjectLeader(project.id, userId);
        resolvedBy = userId;
    }

    return db.transaction(async (trx) => {
        if (status === "approved") {
            await trx("tasks").where({ id: swapRequest.taskId }).update({ assigneeId: swapRequest.requestedTo });
            await createTaskLogOwnership({
                taskId: swapRequest.taskId,
                fromUserId: swapRequest.requestedBy,
                toUserId: swapRequest.requestedTo,
                reason: "swap",
            }, trx);

            if (swapRequest.targetTaskId) {
                await trx("tasks").where({ id: swapRequest.targetTaskId }).update({ assigneeId: swapRequest.requestedBy });
                await createTaskLogOwnership({
                    taskId: swapRequest.targetTaskId,
                    fromUserId: swapRequest.requestedTo,
                    toUserId: swapRequest.requestedBy,
                    reason: "swap",
                }, trx);
            }
        }

        return taskSwapRequestRepo.updateSwapRequestStatus(swapId, status, resolvedBy, trx);
    });
}

//PATCH /api/v1/swap-requests/:id/cancel
export async function cancelSwapRequest(swapId: number, userId: number) {
    const swapRequest = await taskSwapRequestRepo.getSwapRequestById(swapId);
    if (!swapRequest) {
        throw new NotFoundError("Swap request not found");
    }
    if (swapRequest.requestedBy !== userId) {
        throw new ForbiddenError("You can only cancel your own swap request");
    }
    if (swapRequest.status !== "pending") {
        throw new ConflictError("This swap request has already been responded to");
    }
    return taskSwapRequestRepo.updateSwapRequestStatus(swapId, "cancelled", null);
}

// Bentuk baris mentah hasil join di getIncoming/OutgoingSwapRequestsForUser
type SwapRequestListRow = {
    id: number;
    status: string;
    taskId: number;
    taskTitle: string;
    taskProjectId: number;
    targetTaskId: number | null;
    targetTaskTitle: string | null;
    requestedById: number;
    requestedByUsername: string;
    requestedToId: number;
    requestedToUsername: string;
    resolvedBy: number | null;
    resolvedAt: Date | null;
    createdAt: Date;
};

// Ubah baris hasil join (flat) jadi bentuk nested { task, targetTask,
// requestedBy, requestedTo } yang dipakai di response API.
function toSwapRequestListItem(row: SwapRequestListRow) {
    return {
        id: row.id,
        status: row.status,
        task: { id: row.taskId, title: row.taskTitle, projectId: row.taskProjectId },
        targetTask: row.targetTaskId ? { id: row.targetTaskId, title: row.targetTaskTitle } : null,
        requestedBy: { id: row.requestedById, username: row.requestedByUsername },
        requestedTo: { id: row.requestedToId, username: row.requestedToUsername },
        resolvedBy: row.resolvedBy,
        resolvedAt: row.resolvedAt,
        createdAt: row.createdAt,
    };
}

//GET /api/v1/swap-requests/incoming
export async function getIncomingSwapRequests(userId: number) {
    const rows = await taskSwapRequestRepo.getIncomingSwapRequestsForUser(userId);
    return rows.map(toSwapRequestListItem);
}

//GET /api/v1/swap-requests/outgoing
export async function getOutgoingSwapRequests(userId: number) {
    const rows = await taskSwapRequestRepo.getOutgoingSwapRequestsForUser(userId);
    return rows.map(toSwapRequestListItem);
}