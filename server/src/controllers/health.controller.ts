import { Request, Response } from "express";
import { checkSystemHealth } from "../services/health.service";

export const healthController = {
    getHealth: async (req: Request, res: Response) => {
        const health = await checkSystemHealth();

        // Jika Database utama down, kembalikan HTTP 503
        const httpStatus = health.services.database.status === "down" ? 503 : 200;

        res.status(httpStatus).json({
            success: health.status !== "down",
            data: health,
        });
    },
};