import { db } from "../db";
import { Knex } from "knex";
import { Project } from "../../types/entities/project.types";
import { ProjectMember } from "../../types/entities/projectMember.types";

export async function createProject(
  data: {
    title: string;
    allowFreeSwap: boolean;
    deadline?: Date;
  },
  trx?: Knex.Transaction,
): Promise<Project> {
  const executor = trx || db;

  const [project] = await executor<Project>("projects")
    .insert(data)
    .returning("*");

  return project;
}

export async function updateProject(
  projectId: number,
  data: Partial<{
    title: string;
    allowFreeSwap: boolean;
    status: string;
    deadline: Date;
    isArchived: boolean;
    isArchivedAt: Date;
  }>,
) {
  // const [updatedProject] = db("projects").where({ id: projectId }).update(data).returning("*")
  // return updateProject
  return db("projects")
    .where({ id: projectId })
    .update(data)
    .returning("*")
    .then((rows) => rows[0]);
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  return db<Project>("projects").where("id", id).first();
}


export async function getProjectsByUserId(user_id: number) {
  const projects = await db<Project>("projects")
    .join("project_members", "projects.id", "project_members.project_id")
    .where("project_members.user_id", user_id)
    .select("projects.*");

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((project) => project.id);

  const members = await db<ProjectMember>("project_members")
    .join("users", "project_members.user_id", "users.id")
    .whereIn("project_members.project_id", projectIds)
    .where("project_members.status", "active")
    .select([
      "project_members.id",
      "project_members.project_id",
      "project_members.user_id",
      "users.username",
      "users.avatar_url",
      "project_members.role",
    ]);

  return projects.map((project) => ({
    ...project,
    members: members
      .filter((member) => member.projectId === project.id)
      .map((member) => ({
        id: member.id,
        userId: member.user_id,
        username: member.username,
        avatarUrl: member.avatar_url,
        role: member.role,
      })),
  }));
}
