// src/index.ts — sekarang cuma urusan STARTUP
import 'dotenv/config'
import app from './app'
import { db } from './database/db'

db.raw('SELECT 1')
    .then(() => console.log('Database connected'))
    .catch((err) => console.error('Database connection failed:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`))