import * as taskSwapRequestService from "../services/task.swap.request.service"
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middlewares";


//POST /api/v1/tasks/:id/swap-requests
export async function createRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const taskId = Number(req.params.id)
        const targetUserId = Number(req.body.requestedTo)
        const request = await taskSwapRequestService.createSwapTask(taskId, req.user!.id, targetUserId, req.body?.targetTaskId || null)
        res.status(200).json({ success: true, data: request })
    } catch (error) {
        next(error);
    }
}

//PATCH /api/v1/swap-requests/:id/respons
export async function respondSwapRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const swapId = Number(req.params.id)

        await taskSwapRequestService.respondSwapRequest(
            swapId,
            req.user!.id,
            req.body.status
        )

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}
//PATCH /api/v1/swap-requests/:id/cancel
export async function cancelSwapRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const swapId = Number(req.params.id)

        await taskSwapRequestService.cancelSwapRequest(
            swapId,
            req.user!.id
        )

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}