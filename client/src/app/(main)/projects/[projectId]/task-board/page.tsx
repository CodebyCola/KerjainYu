type TaskBoardPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function TaskBoardPage({ params }: TaskBoardPageProps) {
    const { projectId } = await params;

    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Task Board</h2>
            <p className="text-sm font-inter text-muted">Proyek #{projectId} — halaman ini belum diimplementasikan.</p>
        </div>
    );
}
