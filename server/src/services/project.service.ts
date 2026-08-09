import * as projectRepo from "../database/repositories/project.repository";
import * as projectMemberRepo from "../database/repositories/project.member.repository";
import * as projectLinkRepo from "../database/repositories/project.link.repository";
import * as projectSchema from "../schemas/projectSchema";
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
    const [project] = await projectRepo.createProject(projectInput, trx);
    await projectMemberRepo.setLeader(project.id, userId, trx);
    if (linksInput.length > 0) {
      await projectLinkRepo.createLink(project.id, userId, linksInput, trx);
    }

    return project;
  });
}

//GET /api/v1/projects/:id
export async function getDetailProject(projectId: number, userId: number) {
  const [project, membership] = await Promise.all([
    projectRepo.getProjectById(projectId),
    ,
    projectMemberRepo.getRole(projectId, userId),
  ]);
  if (!project) {
    throw new NotFoundError("Project not found!");
  }
  if (!membership) {
    throw new ForbiddenError("You're not part of this project!");
  }
}
