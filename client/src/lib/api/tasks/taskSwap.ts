import { Task, TaskStatus } from "@/types/task";
import { Project } from "@/types/project";
import { isTaskAssignee } from "./taskAssignee";

// Status task yang masih boleh ditawarkan untuk ditukar — selaras dengan
// validasi di server/src/services/task.swap.request.service.ts
// (`['todo', 'ongoing'].includes(task.status)`).
const SWAPPABLE_TASK_STATUSES: TaskStatus[] = ["todo", "ongoing"];

export type SwapEligibility = {
    canRequestSwap: boolean;
    // Alasan kenapa tombol disembunyikan — dipakai untuk debugging/analytics,
    // tidak ditampilkan ke user (tombol cukup hilang, tidak perlu penjelasan).
    reason?: "not-assignee" | "status-not-swappable" | "project-inactive" | "swap-disabled";
};

// Menentukan apakah tombol "Tukar Task" boleh ditampilkan di halaman detail.
// Aturan (lihat SWAP_REQUEST_API_NEEDS.md untuk rasionalnya):
// 1. User adalah assignee dari task ini — hanya pemilik task yang bisa
//    menawarkan tukar.
// 2. Status task masih todo/ongoing.
// 3. Project belum completed & belum diarsipkan.
// 4. project.allowFreeSwap = true — kalau false, swap butuh approval leader
//    manual di luar alur "tukar bebas antar member", jadi CTA ini disembunyikan.
export function getSwapEligibility(
    task: Task,
    project: Pick<Project, "status" | "isArchived" | "allowFreeSwap">,
    currentUserId: number | null | undefined
): SwapEligibility {
    if (!isTaskAssignee(task, currentUserId)) {
        return { canRequestSwap: false, reason: "not-assignee" };
    }
    if (!SWAPPABLE_TASK_STATUSES.includes(task.status)) {
        return { canRequestSwap: false, reason: "status-not-swappable" };
    }
    if (project.status === "completed" || project.isArchived) {
        return { canRequestSwap: false, reason: "project-inactive" };
    }
    if (!project.allowFreeSwap) {
        return { canRequestSwap: false, reason: "swap-disabled" };
    }
    return { canRequestSwap: true };
}
