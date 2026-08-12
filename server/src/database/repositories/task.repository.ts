import { db } from "../db";
import { Knex } from "knex";

export async function createTask(
  data: {
    title: string;
    description?: string;
    status: string;
    priority?: number | null;
    displayOrder: number;
    deadline: Date;
  },
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks")
    .insert(data)
    .returning("*")
    .then((rows) => {
      return rows[0];
    });
}

export async function updateTask(
  taskId: number,
  data: Partial<{
    title: string;
    description?: string;
    status: string;
    priority: number;
    displayOrder: number;
    deadline: Date;
  }>,
  trx?: Knex.Transaction
) {
  const executor = trx || db
  return executor("tasks").where("id", taskId).update(data).returning("*");
}
export async function getTaskById(taskId: number) {
  return db("tasks").where("id", taskId).first()
}


export async function getTasksByUser(userId: number) {
  return db("tasks").join("projects", "projects.id", "tasks.project_id").where("assignee_id", userId).where("project.status", "ongoing").select("tasks.*", "projects.title as projectTitle");
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

