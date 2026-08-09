import { db } from "../db";
import { Knex } from "knex";
import { Project } from "./../../types/project.types";
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

export async function getProjectById(id: number): Promise<Project | undefined>  {
  return db<Project>("projects").where("id", id).first();
}
