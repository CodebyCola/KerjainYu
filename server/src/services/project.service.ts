import * as projectRepo from "../database/repositories/project.repository";
import * as projectMemberRepo from "../database/repositories/project.member.repository";
import * as projectLinkRepo from "../database/repositories/project.link.repository";
import * as taskRepo from "../database/repositories/task.repository"
import * as projectSchema from "../schemas/projectSchema";
import { findByUsername } from "../database/repositories/user.repository";
import { assertProjectMembership } from "./helper/auhtorization.helper";
import { db } from "../database/db";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/AppError";
import { CreateProjectLinkInput } from "../schemas/projectLinkSchema";

//POST /api/v1/projects
export async function createProjectWithLinks(
  projectInput: projectSchema.CreateProjectInput,
  linksInput: CreateProjectLinkInput[],
  userId: number,
) {
  return db.transaction(async (trx) => {
    const project = await projectRepo.createProject(projectInput, trx);
    await projectMemberRepo.setLeader(project.id, userId, trx);
    if (linksInput.length > 0) {
      await projectLinkRepo.createLink(project.id, userId, linksInput, trx);
    }
    return project;
  });
}

//POST /api/v1/projects/:id/invitations
export async function addMember(projectId: number, leaderId: number, memberUsername: string) {
  await assertProjectMembership(projectId, leaderId)
  const prospectiveMember = await findByUsername(memberUsername)
  if (!prospectiveMember) {
    throw new NotFoundError("User is not found")
  }
  if (prospectiveMember.id === leaderId) {
    throw new ConflictError("You're already part of this project")
  }
}

//GET /api/v1/projects/:id
export async function getDetailProject(projectId: number, userId: number) {
  const [project, membership, links] = await Promise.all([
    projectRepo.getProjectById(projectId),
    projectMemberRepo.getRole(projectId, userId),
    projectLinkRepo.getAllLinksByProject(projectId),
  ]);
  await assertProjectMembership(projectId, userId)
  return [project, membership, links];
}

//GET /api/v1/projects
export async function getAllProjects(userId: number) {
  const projects = await projectRepo.getProjectsByUserId(userId);
  return projects;
}


//GET /api/v1/projects/:id/tasks
export async function getTasksByProject(projectId: number, userId: number) {
  await assertProjectMembership(projectId, userId)
  const tasks = await taskRepo.getTasksByProject(projectId)
  return tasks
}

//GET /api/v1/projects/:id/members -> Returning all members that is belong to the project + active
export async function getMembersByProject(projectId: number, userId: number) {
  await assertProjectMembership(projectId, userId)
  const members = await projectMemberRepo.getMembersByProject(projectId)
  return members;
}

//PATCH /api/v1/projects/:id
export async function updateProject(
  projectId: number,
  userId: number,
  input: projectSchema.UpdateProjectInput,
) {
  const [project, membership] = await Promise.all([
    projectRepo.getProjectById(projectId),
    projectMemberRepo.getRole(projectId, userId),
  ]);
  if (!project) {
    throw new NotFoundError("Project not found");
  }
  if (membership?.role !== "leader") {
    throw new ForbiddenError("Only the leader who can update the project");
  }
  if (input.isArchived) {
    input.isArchivedAt = new Date();
  }
  return await projectRepo.updateProject(project.id, input);
}
