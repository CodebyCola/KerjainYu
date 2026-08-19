import { MessageCircle } from "lucide-react";
import { TaskComment } from "@/types/task";
import TaskCommentItem from "@/components/features/task-detail/TaskCommentItem";
import TaskCommentForm from "@/components/features/task-detail/TaskCommentForm";

type TaskCommentsProps = {
    comments: TaskComment[];
    projectId: string;
    taskId: number;
};

export default function TaskComments({ comments, projectId, taskId }: TaskCommentsProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-1.5 font-inter text-sm font-semibold text-foreground">
                <MessageCircle className="size-4" />
                Komentar
                {comments.length > 0 && <span className="text-muted">({comments.length})</span>}
            </h3>

            <TaskCommentForm projectId={projectId} taskId={taskId} />

            {comments.length === 0 ? (
                <p className="py-4 text-center text-sm font-inter text-muted">Belum ada komentar.</p>
            ) : (
                <div className="flex flex-col gap-4 border-t border-border pt-4">
                    {comments.map((comment) => (
                        <TaskCommentItem key={comment.id} comment={comment} projectId={projectId} taskId={taskId} />
                    ))}
                </div>
            )}
        </div>
    );
}
