import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { fmtValor } from '../utils/format.js'

const router = express.Router()

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

function buildTabelaHTML(rows) {
  return rows.map(row =>
    `<div style="display:contents">${row.map(cell =>
      `<div class="cell${cell.free ? ' free' : ''}">${
        cell.free
          ? `<i class="fa-solid fa-star"></i><span>LIVRE</span>`
          : cell.value
      }</div>`
    ).join('')}</div>`
  ).join('')
}

function buildPremioImg(premioImageBase64) {
  return premioImageBase64
    ? `<img src="${premioImageBase64}" alt="Prêmio" />`
    : `<div class="img-placeholder"><i class="fa-solid fa-image"></i><span>FOTO DO PRÊMIO</span></div>`
}

function substitute(tmpl, { premio, dataFormatada, horario, local, valorCartela, premioImg, tabelaHTML }) {
  return tmpl
    .replace(/{{NUMERO}}/g, '0001')
    .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '19:00')
    .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || 'R$ 10,00')
    .replace(/{{IMAGEM_PREMIO}}/g, premioImg)
    .replace(/{{QR_CODE}}/g, premioImg)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

router.get('/', async (req, res) => {
  try {
    const savedHtml = await getTemplateFromFirestore()
    res.json({ html: savedHtml || null })
  } catch {
    res.json({ html: null })
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
  try {
    const { html, premio, data, horario, local, valorCartela, premioImageBase64 } = req.body

    const rows = gerarCartela()
    const dataFormatada = data
      ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR')

    const premioImg = buildPremioImg(premioImageBase64)
    const tabelaHTML = buildTabelaHTML(rows)
    const params = { premio, dataFormatada, horario, local, valorCartela, premioImg, tabelaHTML }

    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(substitute(html, params))
    }

    const savedHtml = await getTemplateFromFirestore()
    if (savedHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(substitute(savedHtml, params))
    }

    const fallback = gerarHTMLCartela({
      numero: 1, rows,
      premio: premio || 'Smart TV 55" Samsung',
      premioImageBase64,
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
