import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { gerarQRCode } from '../services/qrService.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('config').doc('template').get()
    if (snap.exists && snap.data().html) return res.json({ html: snap.data().html })
    res.json({ html: null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { html } = req.body
  if (!html || typeof html !== 'string') return res.status(400).json({ error: 'html obrigatório' })
  try {
    await db.collection('config').doc('template').set({ html, updatedAt: new Date() })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/template — apaga o template salvo, voltando ao padrão do sistema
router.delete('/', async (req, res) => {
  try {
    await db.collection('config').doc('template').delete()
    res.json({ ok: true, message: 'Template resetado para o padrão.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/preview', async (req, res) => {
  const { html, premio, data, horario, local, valorCartela, premioQrLink } = req.body

  const rows = gerarCartela()
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')

  const premioQrUrl = await gerarQRCode(premioQrLink || 'https://exemplo.com/premio')

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const qrBlock = premioQrUrl
    ? `<img src="${premioQrUrl}" style="width:90px;height:90px;display:block;margin:0 auto 4px;" />`
    : `<div style="width:90px;height:90px;margin:0 auto;background:#f0f0f0;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;border-radius:6px;"><div style="font-size:9px;color:#999;text-align:center;line-height:1.4;">QR CODE<br>do prêmio</div></div>`

  const substitute = (tmpl) => tmpl
    .replace(/{{NUMERO}}/g, '0001')
    .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '19:00')
    .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, valorCartela || 'R$ 10,00')
    .replace(/{{QR_CODE}}/g, qrBlock)
    .replace(/{{IMAGEM_PREMIO}}/g, qrBlock) // retrocompat
    .replace(/{{TABELA}}/g, tabelaHTML)

  if (html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(substitute(html))
  }

  let savedHtml = null
  try {
    const snap = await db.collection('config').doc('template').get()
    if (snap.exists && snap.data().html) savedHtml = snap.data().html
  } catch {}

  if (savedHtml) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(substitute(savedHtml))
  }

  const fallback = gerarHTMLCartela({
    numero: 1, rows,
    premio: premio || 'Smart TV 55" Samsung',
    premioQrUrl,
    data, horario, local, valorCartela,
  })
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(fallback)
})

export default router
