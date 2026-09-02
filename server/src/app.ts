import express from "express";
import { initRedis } from "./config/redis";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import projectLinkRoutes from "./routes/project.link.routes"
import taskRoutes from "./routes/task.route";
import userRoutes from "./routes/user.routes";
import invitationRoutes from "./routes/invitations.route"
import commentTaskRoutes from "./routes/comment.task.route"
import submissionRoutes from "./routes/submission.route"
import healthRoutes from "./routes/health.route"
import notificationRoutes from "./routes/notification.route"
import taskSwapRequestRoutes from "./routes/task.swap.request.routes"
import { swaggerSpec } from "./docs/swagger";

initRedis()
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));


app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/v1/health", healthRoutes)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/links", projectLinkRoutes)
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/invitations", invitationRoutes)
app.use("/api/v1/comments", commentTaskRoutes)
app.use("/api/v1/swap-requests", taskSwapRequestRoutes)
app.use("/api/v1/submissions", submissionRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
