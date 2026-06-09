import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'

const router = express.Router()

// GET /api/template — busca o template salvo
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('config').doc('template').get()
    if (snap.exists && snap.data().html) {
      return res.json({ html: snap.data().html })
    }
    res.json({ html: null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/template — salva o template
router.post('/', async (req, res) => {
  const { html } = req.body
  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'Campo html é obrigatório.' })
  }
  try {
    await db.collection('config').doc('template').set({ html, updatedAt: new Date() })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/template/preview — renderiza uma cartela de exemplo como HTML
router.post('/preview', async (req, res) => {
  const { html } = req.body
  if (!html) return res.status(400).json({ error: 'html obrigatório' })

  const rows = gerarCartela()
  const numero = 1
  const numFormatado = '0001'
  const dataFormatada = new Date().toLocaleDateString('pt-BR')

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const rendered = html
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, '19:00')
    .replace(/{{LOCAL}}/g, 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, 'R$ 10,00')
    .replace(/{{IMAGEM_PREMIO}}/g, '<div style="font-size:42px;text-align:center;line-height:1;margin-bottom:4px;">🎁</div>')
    .replace(/{{TABELA}}/g, tabelaHTML)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(rendered)
})

export default router
# force redeploy Tue Jun  9 14:09:28 UTC 2026
