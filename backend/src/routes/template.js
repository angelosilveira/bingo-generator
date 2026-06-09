import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { gerarQRCode } from '../services/qrService.js'

const router = express.Router()

const MOCK_QR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90" style="display:block;margin:0 auto 4px;"><rect width="90" height="90" fill="white"/><rect x="5" y="5" width="25" height="25" rx="2" fill="#0D1F3C"/><rect x="9" y="9" width="17" height="17" rx="1" fill="white"/><rect x="13" y="13" width="9" height="9" rx="1" fill="#0D1F3C"/><rect x="60" y="5" width="25" height="25" rx="2" fill="#0D1F3C"/><rect x="64" y="9" width="17" height="17" rx="1" fill="white"/><rect x="68" y="13" width="9" height="9" rx="1" fill="#0D1F3C"/><rect x="5" y="60" width="25" height="25" rx="2" fill="#0D1F3C"/><rect x="9" y="64" width="17" height="17" rx="1" fill="white"/><rect x="13" y="68" width="9" height="9" rx="1" fill="#0D1F3C"/><rect x="35" y="5" width="4" height="4" fill="#0D1F3C"/><rect x="41" y="5" width="4" height="4" fill="#0D1F3C"/><rect x="47" y="5" width="4" height="4" fill="#0D1F3C"/><rect x="35" y="11" width="4" height="4" fill="#0D1F3C"/><rect x="47" y="11" width="4" height="4" fill="#0D1F3C"/><rect x="35" y="17" width="4" height="4" fill="#0D1F3C"/><rect x="41" y="17" width="4" height="4" fill="#0D1F3C"/><rect x="53" y="17" width="4" height="4" fill="#0D1F3C"/><rect x="5" y="35" width="4" height="4" fill="#0D1F3C"/><rect x="23" y="35" width="4" height="4" fill="#0D1F3C"/><rect x="35" y="35" width="4" height="4" fill="#0D1F3C"/><rect x="53" y="35" width="4" height="4" fill="#0D1F3C"/><rect x="71" y="35" width="4" height="4" fill="#0D1F3C"/><rect x="5" y="41" width="4" height="4" fill="#0D1F3C"/><rect x="29" y="41" width="4" height="4" fill="#0D1F3C"/><rect x="47" y="41" width="4" height="4" fill="#0D1F3C"/><rect x="77" y="41" width="4" height="4" fill="#0D1F3C"/><rect x="5" y="47" width="4" height="4" fill="#0D1F3C"/><rect x="23" y="47" width="4" height="4" fill="#0D1F3C"/><rect x="53" y="47" width="4" height="4" fill="#0D1F3C"/><rect x="71" y="47" width="4" height="4" fill="#0D1F3C"/><rect x="35" y="53" width="4" height="4" fill="#0D1F3C"/><rect x="59" y="53" width="4" height="4" fill="#0D1F3C"/><rect x="77" y="53" width="4" height="4" fill="#0D1F3C"/><rect x="47" y="59" width="4" height="4" fill="#0D1F3C"/><rect x="65" y="59" width="4" height="4" fill="#0D1F3C"/><rect x="41" y="65" width="4" height="4" fill="#0D1F3C"/><rect x="71" y="65" width="4" height="4" fill="#0D1F3C"/><rect x="35" y="71" width="4" height="4" fill="#0D1F3C"/><rect x="53" y="71" width="4" height="4" fill="#0D1F3C"/><rect x="41" y="77" width="4" height="4" fill="#0D1F3C"/><rect x="71" y="77" width="4" height="4" fill="#0D1F3C"/></svg>`

// Helper com timeout para Firestore
async function getTemplateFromFirestore() {
  try {
    const snap = await Promise.race([
      db.collection('config').doc('template').get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (snap.exists && snap.data().html) return snap.data().html
  } catch {}
  return null
}

function buildQrBlock(qrUrl) {
  return qrUrl
    ? `<img src="${qrUrl}" style="width:90px;height:90px;display:block;margin:0 auto 4px;" />`
    : MOCK_QR_SVG
}

function fmtValor(v) {
  if (!v) return ''
  if (typeof v === 'string' && v.includes('R$')) return v
  const n = parseFloat(String(v).replace(',', '.'))
  if (isNaN(n)) return v
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function substitute(tmpl, { premio, dataFormatada, horario, local, valorCartela, qrBlock, tabelaHTML }) {
  return tmpl
    .replace(/{{NUMERO}}/g, '0001')
    .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '19:00')
    .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || 'R$ 10,00')
    .replace(/{{QR_CODE}}/g, qrBlock)
    .replace(/{{IMAGEM_PREMIO}}/g, qrBlock)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

// ── GET /api/template ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const snap = await Promise.race([
      db.collection('config').doc('template').get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ])
    if (snap.exists && snap.data().html) {
      let html = snap.data().html
      if (html.includes('{{IMAGEM_PREMIO}}')) {
        html = html.replace(/{{IMAGEM_PREMIO}}/g, '{{QR_CODE}}')
        db.collection('config').doc('template').update({ html }).catch(() => {})
      }
      return res.json({ html })
    }
    res.json({ html: null })
  } catch {
    res.json({ html: null })
  }
})

// ── POST /api/template ─────────────────────────────
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

// ── DELETE /api/template ───────────────────────────
router.delete('/', async (req, res) => {
  try {
    await db.collection('config').doc('template').delete()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── POST /api/template/preview ─────────────────────
router.post('/preview', async (req, res) => {
  try {
    const { html, premio, data, horario, local, valorCartela, premioQrLink } = req.body

    const rows = gerarCartela()
    const dataFormatada = data
      ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR')

    // QR: real se URL válida, senão mock SVG — nunca crasha
    let qrBlock = MOCK_QR_SVG
    if (premioQrLink && premioQrLink.startsWith('http')) {
      try {
        const qrUrl = await Promise.race([
          gerarQRCode(premioQrLink),
          new Promise(resolve => setTimeout(() => resolve(null), 4000)),
        ])
        if (qrUrl) qrBlock = buildQrBlock(qrUrl)
      } catch {}
    }

    const tabelaHTML = rows.map(row =>
      `<tr>${row.map(cell =>
        `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
      ).join('')}</tr>`
    ).join('')

    const params = { premio, dataFormatada, horario, local, valorCartela, qrBlock, tabelaHTML }

    // Prioridade: body html → Firestore → fallback padrão
    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(substitute(html, params))
    }

    const savedHtml = await getTemplateFromFirestore()
    if (savedHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(substitute(savedHtml, params))
    }

    // Fallback: template padrão do sistema
    const premioQrUrl = qrBlock !== MOCK_QR_SVG ? null : null
    const fallback = gerarHTMLCartela({
      numero: 1, rows,
      premio: premio || 'Smart TV 55" Samsung',
      premioQrUrl: null,
      data, horario, local, valorCartela,
    })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(fallback)

  } catch (err) {
    console.error('❌ Preview error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
