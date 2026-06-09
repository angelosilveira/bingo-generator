import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bingoRouter from './routes/bingo.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'https://bingo-generator-nine.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))
app.use(express.json())

app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/api/bingo', bingoRouter)

app.listen(PORT, () => {
  console.log(`🎱 Bingo backend rodando em http://localhost:${PORT}`)
})
