import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { gerarQRCode } from '../services/qrService.js'

const router = express.Router()

// QR code SVG mockado para preview sem URL real
const MOCK_QR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90" style="display:block;margin:0 auto 4px;">
  <rect width="90" height="90" fill="white"/>
  <!-- Finder pattern top-left -->
  <rect x="5" y="5" width="25" height="25" rx="2" fill="#0D1F3C"/>
  <rect x="9" y="9" width="17" height="17" rx="1" fill="white"/>
  <rect x="13" y="13" width="9" height="9" rx="1" fill="#0D1F3C"/>
  <!-- Finder pattern top-right -->
  <rect x="60" y="5" width="25" height="25" rx="2" fill="#0D1F3C"/>
  <rect x="64" y="9" width="17" height="17" rx="1" fill="white"/>
  <rect x="68" y="13" width="9" height="9" rx="1" fill="#0D1F3C"/>
  <!-- Finder pattern bottom-left -->
  <rect x="5" y="60" width="25" height="25" rx="2" fill="#0D1F3C"/>
  <rect x="9" y="64" width="17" height="17" rx="1" fill="white"/>
  <rect x="13" y="68" width="9" height="9" rx="1" fill="#0D1F3C"/>
  <!-- Data modules simulados -->
  <rect x="35" y="5" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="5" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="5" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="5" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="11" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="11" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="11" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="17" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="17" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="17" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="23" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="23" width="4" height="4" fill="#0D1F3C"/>
  <rect x="5" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="11" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="23" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="59" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="71" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="77" y="35" width="4" height="4" fill="#0D1F3C"/>
  <rect x="5" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="17" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="29" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="65" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="77" y="41" width="4" height="4" fill="#0D1F3C"/>
  <rect x="5" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="11" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="23" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="59" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="71" y="47" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="59" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="71" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="77" y="53" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="59" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="59" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="59" width="4" height="4" fill="#0D1F3C"/>
  <rect x="65" y="59" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="65" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="65" width="4" height="4" fill="#0D1F3C"/>
  <rect x="59" y="65" width="4" height="4" fill="#0D1F3C"/>
  <rect x="71" y="65" width="4" height="4" fill="#0D1F3C"/>
  <rect x="77" y="65" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="71" width="4" height="4" fill="#0D1F3C"/>
  <rect x="47" y="71" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="71" width="4" height="4" fill="#0D1F3C"/>
  <rect x="65" y="71" width="4" height="4" fill="#0D1F3C"/>
  <rect x="35" y="77" width="4" height="4" fill="#0D1F3C"/>
  <rect x="41" y="77" width="4" height="4" fill="#0D1F3C"/>
  <rect x="53" y="77" width="4" height="4" fill="#0D1F3C"/>
  <rect x="71" y="77" width="4" height="4" fill="#0D1F3C"/>
  <rect x="77" y="77" width="4" height="4" fill="#0D1F3C"/>
</svg>`

router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('config').doc('template').get()
    if (snap.exists && snap.data().html) {
      let html = snap.data().html
      // Retrocompat: substitui {{IMAGEM_PREMIO}} por {{QR_CODE}} no template salvo
      if (html.includes('{{IMAGEM_PREMIO}}')) {
        html = html.replace(/{{IMAGEM_PREMIO}}/g, '{{QR_CODE}}')
        // Salva a versão corrigida
        await db.collection('config').doc('template').update({ html })
      }
      return res.json({ html })
    }
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

router.delete('/', async (req, res) => {
  try {
    await db.collection('config').doc('template').delete()
    res.json({ ok: true })
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

  // QR real se tiver URL, senão usa o mock SVG
  let qrBlock = MOCK_QR_SVG
  if (premioQrLink) {
    const qrUrl = await gerarQRCode(premioQrLink)
    if (qrUrl) qrBlock = `<img src="${qrUrl}" style="width:90px;height:90px;display:block;margin:0 auto 4px;" />`
  }

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

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

  // Fallback: sistema padrão
  const qrUrl = premioQrLink ? await gerarQRCode(premioQrLink) : null
  const fallback = gerarHTMLCartela({
    numero: 1, rows,
    premio: premio || 'Smart TV 55" Samsung',
    premioQrUrl: qrUrl,
    data, horario, local, valorCartela,
  })
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(fallback)
})

export default router
