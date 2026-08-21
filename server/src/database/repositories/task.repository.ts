import { db } from "../db";
import { Knex } from "knex";
import { TaskStatusSchema } from "../../schemas/task.schema";
import { Task } from "../../types/entities/task.types";
export async function createTask(
  projectId: number,
  data: {
    title: string;
    description?: string;
    status: TaskStatusSchema;
    priority?: number;
    isClaimable: boolean;
    deadline?: Date;
  },
  createdBy: number,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks").insert({ ...data, projectId, createdBy }).returning("*").then((rows) => rows[0]);
}

export async function updateTask(
  taskId: number,
  data: Partial<{
    title: string;
    description?: string;
    status: string;
    priority: number;
    deadline: Date;
    assigneId?: number | null
    isClaimable?: boolean | true,
  }>,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks").where("id", taskId).update(data).returning("*").then((rows) => rows[0]);
}

export async function assignTask(taskId: number, assigneeId: number, trx?: Knex.Transaction) {
  const executor = trx || db;
  return executor("tasks").where({ id: taskId, status: "unclaimed" }).update({ assigneeId: assigneeId, status: "todo" }).select("id,assignee_id,status").returning("*")
    .then((rows) => rows[0]);
}
export async function getTaskById(taskId: number): Promise<Task | undefined> {
  return db<Task>("tasks").where("id", taskId).first();
}

export async function getTaskDetailWithRelations(taskId: number) {
  const task = await db("tasks")
    .leftJoin("users", "tasks.assignee_id", "users.id")
    .where("tasks.id", taskId)
    .select([
      "tasks.id",
      "tasks.title",
      "tasks.description",
      "tasks.status",
      "tasks.priority",
      "tasks.display_order",
      "tasks.project_id",
      "tasks.deadline",
      "tasks.assignee_id",
      "tasks.created_by",
      "tasks.is_claimable",
      "tasks.created_at",
      "tasks.updated_at",
      db.raw('"users"."id" as "assigneeUserId"'),
      db.raw('"users"."username" as "assigneeUsername"'),
      db.raw('"users"."avatar_url" as "assigneeAvatarUrl"'),
    ])
    .first();

  if (!task) return undefined;

  const latestSubmission = await db("task_submissions")
    .where("task_id", taskId)
    .orderBy("submitted_at", "desc")
    .first();

  const { assigneeUserId, assigneeUsername, assigneeAvatarUrl, ...taskFields } = task;

  return {
    ...taskFields,
    assignee:
      assigneeUserId != null
        ? { id: assigneeUserId, username: assigneeUsername, avatarUrl: assigneeAvatarUrl }
        : null,
    latestSubmission: latestSubmission ?? null,
  };
}

export async function getTasksByUser(userId: number) {
  return db("tasks")
    .join("projects", "projects.id", "tasks.project_id")
    .where("assignee_id", userId)
    .where("projects.status", "ongoing")
    .select("tasks.*", "projects.title as projectTitle");
}


export async function getTasksByProject(projectId: number, userId?: number) {
  return await db("tasks")
    .where("project_id", projectId)
    .modify((queryBuilder) => {
      if (userId) {
        queryBuilder.where("assignee_id", userId);
      }
    })
    .select("*");
}

export async function doTask(taskId: number) {
  return db("tasks").where({ id: taskId, status: "todo" }).update({ status: "ongoing" }).returning("*").then((rows) => rows[0])
}

export async function unassignTask(projectId: number, assigneeId: number, trx?: Knex.Transaction) {
  const executor = trx || db
  return executor("tasks").where({ project_id: projectId, assignee_id: assigneeId }).whereIn("status", ['todo', 'ongoing']).update({ assignee_id: null, status: "unclaimed" })
}

export async function updateTaskStatusIfAllowed(
  taskId: number,
  statuses: TaskStatusSchema[],
  newStatus: TaskStatusSchema,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;

  const [updated] = await executor("tasks")
    .where("id", taskId)
    .whereIn("status", statuses)
    .update({
      status: newStatus,
      updatedAt: new Date(),
    })
    .returning("*");

  return updated;
}