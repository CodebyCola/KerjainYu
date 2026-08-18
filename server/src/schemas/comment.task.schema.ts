import { z } from "../lib/zod-extended";


export const createCommentSchema = z.object({
    comment: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment is too long").openapi({ example: "The task is really easy though, give me the hard one pls" }),
}).strict().openapi('CreateCommentSchema');


export const commentIdParams = z.object({
    id: z.coerce.number().int().positive()
})

export type CommentIdParams = z.infer<typeof commentIdParams>;