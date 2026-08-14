import { ForbiddenError, NotFoundError } from "../../errors/AppError";
import * as projectRepo from "../../database/repositories/project.repository";
import * as projectMemberRepo from "../../database/repositories/project.member.repository";
import * as projectSchema from "../../schemas/projectSchema";

export async function assertProjectMembership(
  projectId: number,
  userId: number,
) {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project's not found");
  }

  const membership = await projectMemberRepo.getRole(projectId, userId);
  if (!membership) {
    throw new ForbiddenError("You're not part of this project");
  }

  return { project, membership };
}

export async function assertProjectLeader(projectId: number, userId: number) {
  const result = await assertProjectMembership(projectId, userId);

  if (result.membership.role !== "leader") {
    throw new ForbiddenError("Only project leader can perform this action");
  }

  return result;
}