import { Palette, Code2, FileText, Link2, LucideIcon } from "lucide-react";
import { ProjectLinkCategory } from "@/types/project";

type CategoryMeta = {
    label: string;
    icon: LucideIcon;
    bgClass: string;
    textClass: string;
};

// Warna dipetakan ke token role-* yang sudah ada di globals.css, supaya
// tetap konsisten dengan palet lain (bukan warna baru khusus kategori).
const CATEGORY_META: Record<ProjectLinkCategory, CategoryMeta> = {
    design: {
        label: "Desain",
        icon: Palette,
        bgClass: "bg-role-lead-bg",
        textClass: "text-role-lead-text",
    },
    development: {
        label: "Pengembangan",
        icon: Code2,
        bgClass: "bg-status-done-bg",
        textClass: "text-status-done-text",
    },
    docs: {
        label: "Dokumen",
        icon: FileText,
        bgClass: "bg-status-progress-bg",
        textClass: "text-status-progress-text",
    },
    other: {
        label: "Lainnya",
        icon: Link2,
        bgClass: "bg-role-member-bg",
        textClass: "text-role-member-text",
    },
};

export function getCategoryMeta(category: ProjectLinkCategory): CategoryMeta {
    return CATEGORY_META[category];
}

export const CATEGORY_OPTIONS: { value: ProjectLinkCategory; label: string }[] = (
    Object.entries(CATEGORY_META) as [ProjectLinkCategory, CategoryMeta][]
).map(([value, meta]) => ({ value, label: meta.label }));

export function getUrlHost(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}