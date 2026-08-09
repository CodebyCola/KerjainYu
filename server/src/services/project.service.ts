import * as projectRepo from "../database/repositories/project.repository";
import * as projectMemberRepo from "../database/repositories/project.member.repository";
import * as projectLinkRepo from "../database/repositories/project.link.repository";
import * as projectSchema from "../schemas/projectSchema";
import { db } from "../database/db";
import { ConflictError, UnauthorizedError } from "../errors/AppError";
import { CreateProjectLinkInput } from "../schemas/projectLinkSchema";

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
