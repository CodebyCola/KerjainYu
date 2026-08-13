type TeamPageProps = {
    params: Promise<{ projectId: string }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
    const { projectId } = await params;

    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">Team</h2>
            <p className="text-sm font-inter text-muted">Proyek #{projectId} — halaman ini belum diimplementasikan.</p>
        </div>
    );
}
