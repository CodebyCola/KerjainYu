import * as projectMemberRepo from "../database/repositories/project.member.repository";
import { findById } from "../database/repositories/user.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";
import { db } from "../database/db";
import { notifyUser } from "./notification.service";


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

    return db.transaction(async (trx) => {
        const updated = await projectMemberRepo.updateMembershipStatus(membership.id, newStatus, trx)
        if (response === 'accept') {
            const leader = await projectMemberRepo.getProjectLeader(membership.projectId)
            if (leader) {
                const user = await findById(userId) // butuh username utk pesan
                await notifyUser({
                    userId: leader.userId,
                    type: "member_added",
                    referenceType: "project",
                    referenceId: membership.projectId,
                    message: `${user?.username ?? "A user"} joined your project`,
                }, trx)
            }
        }
        return updated
    })
}