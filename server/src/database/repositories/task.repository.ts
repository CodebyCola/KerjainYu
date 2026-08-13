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
    createdBy: number;
  },
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks").insert(data).returning("*");
}

export async function updateTask(
  taskId: number,
  data: Partial<{
    title: string;
    description?: string;
    status: string;
    priority: number;
    deadline: Date;
  }>,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks").where("id", taskId).update(data).returning("*");
}
export async function getTaskById(taskId: number): Promise<Task | undefined> {
  return db<Task>("tasks").where("id", taskId).first();
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
