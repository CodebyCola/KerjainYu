import * as taskRepo from "../database/repositories/task.repository";
import * as taskInput from "../schemas/task.schema";
import * as taskOwnershipLogRepo from "../database/repositories/task_ownership_log.repository"
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";
import {
  assertProjectMembership,
  assertProjectLeader,
} from "./helper/auhtorization.helper";
import { db } from "../database/db";
import { assertTaskAccess, assertTaskDetailAccess } from "./helper/task.helper";

//POST /api/v1/projects/:id/tasks
export async function createTask(
  projectId: number,
  userId: number,
  input: taskInput.CreateTaskInput,
) {
  await assertProjectLeader(projectId, userId);
  const tasks = await taskRepo.createTask(projectId, input, userId);
  return tasks;
}

//GET api/v1/tasks/:id
export async function getTaskDetail(taskId: number, userId: number) {
  const task = await assertTaskDetailAccess(taskId, userId)
  return task;
}

//GET api/v1/tasks/me -> Showing all tasks that are belong to user
export async function getTasksByUser(userId: number) {
  const tasks = await taskRepo.getTasksByUser(userId);
  return tasks;
}

//PATCH api/v1/tasks/:id -> Update task
export async function updateTask(
  taskId: number,
  userId: number,
  input: taskInput.UpdateTasktInput,
) {
  const task = await taskRepo.getTaskById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found");
  }
  await assertProjectLeader(task.projectId, userId);
  const tasks = await taskRepo.updateTask(task.id, input);
  return tasks;
}

//PATCH /api/v1/tasks/:id/claim
export async function claimTask(taskId: number, userId: number) {
  const task = await taskRepo.getTaskById(taskId)
  if (!task) {
    throw new NotFoundError("Task not found")
  }
  await assertProjectMembership(task.projectId, userId)
  if (!task.isClaimable) {
    throw new ConflictError("This task is not claimable, only the leader who can assign the tasks")
  }
  return db.transaction(async (trx) => {
    const claimed = await taskRepo.assignTask(taskId, userId, trx)
    if (!claimed) {
      throw new ConflictError("This task has already been claimed by the other members")
    }
    await taskOwnershipLogRepo.createTaskLogOwnership({ taskId: taskId, fromUserId: null, toUserId: userId, reason: "claimed" }, trx)
    return claimed
  })
}

//PATCH /api/v1/tasks/:id/assign
export async function assignTask(taskId: number, leaderId: number, targetUserId: number) {
  const task = await taskRepo.getTaskById(taskId)
  if (!task) {
    throw new NotFoundError("Task is not found")
  }
  if (task.assigneeId !== null) {
    throw new ConflictError("This task is already assign to other member")
  }
  await assertProjectLeader(task.projectId, leaderId)
  await assertProjectMembership(task.projectId, targetUserId)
  return db.transaction(async (trx) => {

    const assigned = await taskRepo.assignTask(
      taskId,
      targetUserId,
      trx
    );

    if (!assigned) {
      throw new ConflictError(
        "This task has already been assigned to another member"
      );
    }

    await taskOwnershipLogRepo.createTaskLogOwnership(
      {
        taskId,
        fromUserId: null,
        toUserId: targetUserId,
        reason: "assigned",
      },
      trx
    );

    return assigned;
  });
}

//PATCH /api/v1/tasks/:id/ongoing
export async function doTask(taskId: number, userId: number) {
  const task = await taskRepo.getTaskById(taskId)
  if (!task) {
    throw new NotFoundError("Task not found")
  }
  await assertProjectMembership(task.projectId, userId)
  if (task.assigneeId !== userId) {
    throw new ForbiddenError("Only the assignee can perform this action")
  }

  const updated = await taskRepo.doTask(taskId)
  if (!updated) {
    throw new ConflictError(`Task must be in 'todo' status to start working on it (current status: ${task.status})`)
  }
  return updated
}