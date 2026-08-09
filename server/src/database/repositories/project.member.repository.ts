import { db } from "../db";
import { Knex } from "knex";

// For Leader setting up the project, so it will automaticallya assign the user as a leader of the project
export async function setLeader(
  projectId: number,
  userId: number,
  trx?: Knex.Transaction,
) {
  const executor = trx || db;
  return executor("project_members").insert({
    project_id: projectId,
    user_id: userId,
    role: "leader",
  });
}

export async function addMember(projectId: number, userId: number) {
  return db("project_members").insert({
    project_id: projectId,
    user_id: userId,
    role: "member",
  });
}
export async function removeMember(projectId: number, userId: number) {
  return db("project_members")
    .where({
      project_id: projectId,
      user_id: userId,
    })
    .del();
}
