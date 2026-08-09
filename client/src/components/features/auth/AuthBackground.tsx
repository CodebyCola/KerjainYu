export default function AuthBackground() {
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
            {/* Base gradient wash */}
            <div className="absolute inset-0 bg-linear-to-br from-background via-background to-status-progress-bg/40" />

            {/* Soft blobs */}
            <div className="absolute -top-32 -left-24 size-104 rounded-full bg-status-progress-bg/70 blur-3xl" />
            <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 size-112 rounded-full bg-status-done-bg/60 blur-3xl" />

            {/* Subtle dot grid texture */}
            <div
                className="absolute inset-0 opacity-[0.35]"
                style={{
                    backgroundImage: "radial-gradient(var(--border) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)",
                }}
            />
        </div>
    );
}