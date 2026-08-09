import { db } from "../db";
import { Knex } from "knex";

export async function createProject(
  data: { title: string; allowFreeSwap: boolean; deadline?: Date },
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("projects").insert(data).returning("*");
}

export async function updateProject(
  projectId: number,
  data: Partial<{
    title: string;
    allowFreeSwap: boolean;
    status: string;
    deadline: Date;
    isArchived: boolean;
  }>,
) {
  return db("projects").where({ id: projectId }).update(data).returning("*");
}
// export async function getAllProjectByUserId(userId: number, role: string) {
//     returning db("projects")
// }

// export async function
