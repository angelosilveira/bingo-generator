import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bingoRouter from './routes/bingo.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/api/bingo', bingoRouter)

app.listen(PORT, () => {
  console.log(`🎱 Bingo backend rodando em http://localhost:${PORT}`)
})
