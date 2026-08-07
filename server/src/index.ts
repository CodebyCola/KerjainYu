import 'dotenv/config'
import express from 'express'
import { errorHandler } from './middlewares/errorHandler'
import { db } from './config/db'
const app = express();
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ success: true, message: "Server is running" })

})

// Other Routes

app.use(errorHandler)
db.raw('SELECT 1')
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err))
const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))