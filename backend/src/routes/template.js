import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

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

// POST /api/template/preview
// Aceita { html } (template customizado) OU dados do form para usar template salvo/padrão
router.post('/preview', async (req, res) => {
  const { html, premio, data, horario, local, valorCartela, premioImageBase64 } = req.body

  const rows = gerarCartela()
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const imgHtml = premioImageBase64
    ? `<img src="${premioImageBase64}" style="height:52px;max-width:100%;object-fit:contain;display:block;margin:0 auto 4px;" />`
    : `<div style="font-size:42px;text-align:center;line-height:1;margin-bottom:4px;">🎁</div>`

  // Se veio HTML customizado no body, usa ele
  if (html) {
    const rendered = html
      .replace(/{{NUMERO}}/g, '0001')
      .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
      .replace(/{{DATA}}/g, dataFormatada)
      .replace(/{{HORARIO}}/g, horario || '19:00')
      .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
      .replace(/{{VALOR}}/g, valorCartela || 'R$ 10,00')
      .replace(/{{IMAGEM_PREMIO}}/g, imgHtml)
      .replace(/{{TABELA}}/g, tabelaHTML)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(rendered)
  }

  // Tenta buscar template salvo no Firestore
  let savedHtml = null
  try {
    const snap = await db.collection('config').doc('template').get()
    if (snap.exists && snap.data().html) savedHtml = snap.data().html
  } catch {}

  if (savedHtml) {
    const rendered = savedHtml
      .replace(/{{NUMERO}}/g, '0001')
      .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
      .replace(/{{DATA}}/g, dataFormatada)
      .replace(/{{HORARIO}}/g, horario || '19:00')
      .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
      .replace(/{{VALOR}}/g, valorCartela || 'R$ 10,00')
      .replace(/{{IMAGEM_PREMIO}}/g, imgHtml)
      .replace(/{{TABELA}}/g, tabelaHTML)

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(rendered)
  }

  // Fallback: template padrão do sistema
  const fallbackHtml = gerarHTMLCartela({
    numero: 1,
    rows,
    premio: premio || 'Smart TV 55" Samsung',
    premioImageBase64: premioImageBase64 || null,
    data: data || new Date().toISOString().split('T')[0],
    horario: horario || '19:00',
    local: local || 'Clube Recreativo Central',
    valorCartela: valorCartela || 'R$ 10,00',
  })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(fallbackHtml)
})

export default router
