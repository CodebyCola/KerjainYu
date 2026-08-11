import { db } from "../db";
import { Knex } from "knex";

export async function createTask(
  data: {
    title: string;
    description?: string;
    status: string;
    priority: number;
    displayOrder: number;
    deadline: Date;
  },
  trx: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("tasks")
    .insert(data)
    .returning("*")
    .then((rows) => {
      rows[0];
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
) {
  return db("tasks").where("id", taskId).update(data).returning("*");
}
export async function getAllTaskByUser(userId: number) {
  return db("tasks").where("assignee_id", userId).returning("*");
}
export async function getAllTaskByProject(projectId: number) {
  return db("tasks").where("project_id", projectId).returning("*");
}
    