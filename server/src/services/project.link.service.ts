import * as projectLinkRepo from "../database/repositories/project.link.repository";
import { assertProjectLeader, assertProjectMembership } from "./helper/auhtorization.helper";
import { CreateProjectLinkInput, UpdateProjectLinkInput } from "../schemas/projectLinkSchema";
import { NotFoundError } from "../errors/AppError";


//POST /api/v1/projects/:id/links
export async function createProjectLink(projectId: number, userId: number, linkInput: CreateProjectLinkInput) {
    await assertProjectLeader(projectId, userId)
    return await projectLinkRepo.createLink(projectId, userId, linkInput)
}

//PATCH /api/v1/links/:id
export async function updateProjectLink(linkId: number, userId: number, linkInput: UpdateProjectLinkInput) {
    const link = await projectLinkRepo.getLinkById(linkId)
    if (!link) {
        throw new NotFoundError("Link is not found")
    }
    await assertProjectLeader(link!.projectId, userId)
    return await projectLinkRepo.updateLink(linkId, linkInput)
}

// DELETE /api/v1/links/:id
export async function deleteProjectLink(
    linkId: number,
    userId: number
) {
    const link = await projectLinkRepo.getLinkById(linkId);

    if (!link) {
        throw new NotFoundError("Link is not found");
    }

    await assertProjectLeader(link.projectId, userId);

    await projectLinkRepo.deleteLink(linkId);
}