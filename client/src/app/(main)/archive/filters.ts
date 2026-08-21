import { Project } from "@/types/project";

export type ArchiveStatusFilter = "all" | "ongoing" | "completed";

export type ArchiveFilters = {
  status: ArchiveStatusFilter;
};

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFilters = {
  status: "all",
};

export const ARCHIVE_STATUS_FILTER_OPTIONS: { value: ArchiveStatusFilter; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "ongoing", label: "Berlangsung" },
  { value: "completed", label: "Selesai" },
];

export function matchesArchiveFilters(project: Project, filters: ArchiveFilters): boolean {
  if (filters.status !== "all" && project.status !== filters.status) return false;
  return true;
}

export function countActiveArchiveFilters(filters: ArchiveFilters): number {
  let count = 0;
  if (filters.status !== "all") count++;
  return count;
}
