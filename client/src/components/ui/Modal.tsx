"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

function subscribe() {
    return () => { };
}

function useIsMounted() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const isMounted = useIsMounted();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    if (!isMounted || !isOpen) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onCancel={onClose}
            className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-0 backdrop:bg-foreground/40"
        >
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
                <h2 className="font-inter text-base font-semibold text-foreground sm:text-lg">
                    {title}
                </h2>
                <button
                    type="button"
                    aria-label="Tutup"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-status-todo-bg hover:text-foreground"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="p-4 sm:p-5">{children}</div>
        </dialog>,
        document.body
    );
}