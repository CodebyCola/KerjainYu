import { Task } from "@/types/task";
import { ProjectMember } from "@/types/project";

// GET /tasks/:id balikin `assignee` ter-join; endpoint lain (list, dsb)
// mungkin cuma balikin `assigneeId` mentah. Fungsi di bawah pakai mana yang
// tersedia, dan selalu bandingkan ID sebagai string karena kolom bigint dari
// backend bisa datang sebagai string di JSON walau tipe TS-nya `number`.
export function resolveTaskAssigneeId(task: Task): string | null {
    if (task.assignee?.id != null) return String(task.assignee.id);
    if (task.assigneeId != null) return String(task.assigneeId);
    return null;
}

export function isTaskAssignee(task: Task, userId: number | null | undefined): boolean {
    if (userId == null) return false;
    const assigneeId = resolveTaskAssigneeId(task);
    return assigneeId !== null && assigneeId === String(userId);
}

export function findTaskAssignee(task: Task, members: ProjectMember[]): ProjectMember | undefined {
    const assigneeId = resolveTaskAssigneeId(task);
    if (assigneeId === null) return undefined;
    return members.find((member) => String(member.userId) === assigneeId);
}