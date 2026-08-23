import { z } from "../lib/zod-extended";
import { attachmentIdParams } from "./submission.schema";


export const idParams = z.object({
    id: z.coerce.number().int().positive()
})
export const submissionAttachmentParams = idParams.merge(attachmentIdParams);