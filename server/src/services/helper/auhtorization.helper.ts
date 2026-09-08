import { ConflictError, ForbiddenError, NotFoundError } from "../../errors/AppError";
import * as projectRepo from "../../database/repositories/project.repository";
import * as projectMemberRepo from "../../database/repositories/project.member.repository";
import * as projectSchema from "../../schemas/projectSchema";

export async function assertProjectMembership(
  projectId: number,
  userId: number,
) {
  const project = await projectRepo.getProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Proyek tidak dapat ditemukan");
  }

  const membership = await projectMemberRepo.getRole(projectId, userId);
  if (!membership || membership.status !== "active") {
    throw new ForbiddenError("Kamu bukan bagian dari proyek ini");
  }

  return { project, membership };
}

export async function assertProjectLeader(projectId: number, userId: number) {
  const result = await assertProjectMembership(projectId, userId);

  if (result.membership.role !== "leader") {
    throw new ForbiddenError("Hanya ketua yang bisa melakukan aksi ini");
  }

  return result;
}

export function assertProjectIsActive(project: { status: string; isArchived: boolean }) {
  if (project.isArchived || project.status === "completed") {
    throw new ConflictError("Can't do this action because the project's already done / archived");
  }
}