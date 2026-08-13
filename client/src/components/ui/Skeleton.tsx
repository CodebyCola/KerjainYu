import { cn } from "@/utils/cn";

type SkeletonProps = {
    className?: string;
};

// Blok dasar skeleton — dipakai sebagai building block untuk skeleton
// yang lebih kompleks (card, list, dsb). Warna & animasi shimmer
// didefinisikan lewat token di globals.css (.animate-shimmer).
export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn("animate-shimmer rounded-md bg-secondary", className)}
        />
    );
}
