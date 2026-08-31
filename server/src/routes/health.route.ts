import { Router } from "express";
import { healthController } from "../controllers/health.controller";

const router = Router();

// Endpoint publik untuk Liveness/Readiness Probe (Docker/Kubernetes/Uptime Robot)
router.get("/", healthController.getHealth);

export default router;