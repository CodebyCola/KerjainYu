
import * as taskRepo from "../database/repositories/task.repository"
import * as projectMemberRepo from "../database/repositories/project.member.repository";
import { assertProjectLeader, assertProjectMembership } from "./helper/auhtorization.helper";
import { ConflictError } from "../errors/AppError";
import { db } from "../database/db";

//GET /api/v1/projects/:id/members -> Returning all members that is belong to the project + active
export async function getMembersByProject(projectId: number, userId: number) {
    await assertProjectMembership(projectId, userId)
    const members = await projectMemberRepo.getMembersByProject(projectId)
    return members;
}

//PATCH /api/v1/projects/:id/leader
export async function promoteToLeader(projectId: number, currentLeaderId: number, prospectiveLeaderId: number) {
    await assertProjectLeader(projectId, currentLeaderId)
    const { membership: prospectiveMembership } = await assertProjectMembership(projectId, prospectiveLeaderId)
    if (prospectiveMembership.status !== "active") {
        throw new ConflictError("Only active member can be promoted to leader")
    }
    if (currentLeaderId == prospectiveLeaderId) {
        throw new ConflictError("You are already the leader of this project")
    }
    return db.transaction(async (trx) => {
        const [newLeader] = await projectMemberRepo.updateMemberRole(projectId, prospectiveLeaderId, "leader", trx)
        await projectMemberRepo.updateMemberRole(projectId, currentLeaderId, "member", trx)
        return newLeader
    })
}

//DELETE /api/v1/projects/:id/members/:userId
export async function removeMember(projectId: number, leaderId: number, targetUserId: number) {
    await assertProjectLeader(projectId, leaderId)
    if (targetUserId == leaderId) {
        throw new ConflictError("Leader cannot remove themselves, Transfer leadership first")
    }
    const { membership } = await assertProjectMembership(projectId, targetUserId)
    if (membership.status !== "active") {
        throw new ConflictError("That member is not active on that projecr")
    }
    return db.transaction(async (trx) => {
        await projectMemberRepo.removeMember(projectId, targetUserId, trx)
        await taskRepo.unassignTask(projectId, targetUserId, trx)
    })
}
//POST /api/v1/projects/:id/leave
export async function leaveProject(projectId: number, userId: number) {
    const { membership } = await assertProjectMembership(projectId, userId)
    if (membership.status !== "active") {
        throw new ConflictError("Active member not found in this project")
    }

    // Guard tambahan biar leader gak bisa leave jika masih ada member
    if (membership.role === "leader") {
        const members = await projectMemberRepo.getMembersByProject(projectId)
        const otherActiveMembers = members.filter((member) => member.user_id !== userId)
        if (otherActiveMembers.length > 0) {
            throw new ConflictError("Transfer leadership to another member before leaving this project")
        }
    }
    return db.transaction(async (trx) => {
        await projectMemberRepo.removeMember(projectId, userId, trx)
        await taskRepo.unassignTask(projectId, userId, trx)
    })
}