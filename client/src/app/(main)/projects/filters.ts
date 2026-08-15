import { Project } from "@/types/project";

export type StatusFilter = "all" | "ongoing" | "completed";
export type DeadlineFilter = "all" | "upcoming" | "overdue";

export type ProjectFilters = {
  status: StatusFilter;
  deadline: DeadlineFilter;
};

export const DEFAULT_PROJECT_FILTERS: ProjectFilters = {
  status: "all",
  deadline: "all",
};

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "completed", label: "Selesai" },
];

export const DEADLINE_FILTER_OPTIONS: { value: DeadlineFilter; label: string }[] = [
  { value: "all", label: "Semua tenggat" },
  { value: "upcoming", label: "Mendekati tenggat" },
  { value: "overdue", label: "Lewat tenggat" },
];

const UPCOMING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

function isOverdue(project: Project): boolean {
  return project.status === "ongoing" && new Date(project.deadline).getTime() < Date.now();
}

function isUpcoming(project: Project): boolean {
  if (project.status !== "ongoing") return false;
  const diff = new Date(project.deadline).getTime() - Date.now();
  return diff >= 0 && diff <= UPCOMING_WINDOW_MS;
}

export function matchesFilters(project: Project, filters: ProjectFilters): boolean {
  if (filters.status !== "all" && project.status !== filters.status) return false;

  if (filters.deadline === "upcoming" && !isUpcoming(project)) return false;
  if (filters.deadline === "overdue" && !isOverdue(project)) return false;

  return true;
}

export function countActiveFilters(filters: ProjectFilters): number {
  let count = 0;
  if (filters.status !== "all") count++;
  if (filters.deadline !== "all") count++;
  return count;
}