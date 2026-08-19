"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { SendHorizontal } from "lucide-react";
import { createTaskCommentAction, CommentActionState } from "@/app/(main)/projects/[projectId]/task-board/actions";

type TaskCommentFormProps = {
    projectId: string;
    taskId: number;
};

const INITIAL_STATE: CommentActionState = { success: false, error: null };

function SendButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-label="Kirim komentar"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:size-10"
        >
            <SendHorizontal className="size-4" />
        </button>
    );
}

export default function TaskCommentForm({ projectId, taskId }: TaskCommentFormProps) {
    const action = createTaskCommentAction.bind(null, projectId, taskId);
    const [state, formAction] = useActionState(action, INITIAL_STATE);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="flex flex-col gap-1.5">
            <div className="flex items-end gap-2">
                <textarea
                    name="comment"
                    rows={1}
                    required
                    maxLength={1000}
                    placeholder="Tulis komentar..."
                    className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-inter text-foreground outline-none transition-colors focus:border-primary"
                />
                <SendButton />
            </div>
            {state.error && <p className="text-xs font-inter text-status-blocked-text">{state.error}</p>}
        </form>
    );
}
