import express from 'express'
import cors from 'cors'
import path from 'path'
import uploadRoutes from './routes/uploadRoutes'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))
app.use('/api/upload', uploadRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`)
})

export default app
