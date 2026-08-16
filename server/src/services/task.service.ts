import * as taskRepo from "../database/repositories/task.repository";
import * as projectRepo from "../database/repositories/project.repository";
import * as projectMemberRepo from "../database/repositories/project.member.repository";
import * as taskInput from "../schemas/task.schema";
import * as taskOwnershipLogRepo from "../database/repositories/task_ownership_log.repository"
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";
// import { ProjectIdParams } from "../schemas/projectSchema
import {
  assertProjectMembership,
  assertProjectLeader,
} from "./helper/auhtorization.helper";
import { db } from "../database/db";

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
    const claimed = await taskRepo.claimTask(taskId, userId, trx)
    if (!claimed) {
      throw new ConflictError("This task has already been claimed by the other members")
    }
    await taskOwnershipLogRepo.createTaskLogOwnership({ taskId: taskId, fromUserId: null, toUserId: userId, reason: "claimed" }, trx)
    return claimed
  })
}


