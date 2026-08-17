import * as projectMemberRepo from "../database/repositories/project.member.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";


export async function getAllInvitations(userId: number) {
    return projectMemberRepo.getInvitations(userId)
}

export async function respondToInvitation(membershipId: number, userId: number, response: 'accept' | 'reject') {
    const membership = await projectMemberRepo.getById(membershipId)
    if (!membership) {
        throw new NotFoundError("Invitation not found")
    }
    if (membership.userId !== userId) {
        throw new ForbiddenError("This invitation does'nt belong to you")
    }
    if (membership.status !== "invited") {
        throw new ConflictError("This invitation has already been responded to")
    }

    const newStatus = response === 'accept' ? 'active' : 'rejected'
    return await projectMemberRepo.updateMembershipStatus(membership.id, newStatus)
}