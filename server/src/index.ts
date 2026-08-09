import "dotenv/config";
import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { db } from "./database/db";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route";
import projectRoutes from "./routes/project.route";
import cors from "cors";
<<<<<<< HEAD
=======
// index.ts — sama seperti sebelumnya
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
>>>>>>> 40855683455179fd5e65086ca313d6a6f45af342

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
<<<<<<< HEAD
  res.json({ success: true, message: "Server is running" });
=======
    res.json({ success: true, message: "Server is running" });
>>>>>>> 40855683455179fd5e65086ca313d6a6f45af342
});
// Other Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

db.raw("SELECT 1")
<<<<<<< HEAD
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection failed:", err));
=======
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection failed:", err));
>>>>>>> 40855683455179fd5e65086ca313d6a6f45af342
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
