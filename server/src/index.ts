import 'dotenv/config'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import { db } from './database/db'
import cookieParser from 'cookie-parser'
import authRoutes from "./routes/auth.route"
import projectRoutes from "./routes/project.route"
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    }),
);

app.get('/health', (req, res) => {
    res.json({ success: true, message: "Server is running" })
})
// Other Routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/projects", projectRoutes)

app.use(errorHandler)
const PORT = process.env.PORT || 5000

db.raw('SELECT 1')
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err))
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))
