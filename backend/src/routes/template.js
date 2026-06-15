import express from 'express'
import { db } from '../services/firebase.js'
import { gerarCartela } from '../services/bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { fmtValor } from '../utils/format.js'

const router = express.Router()

const GIFT_ICON = `<svg viewBox="0 0 24 24" fill="none" class="gift-icon"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18v3H3V9Z" fill="currentColor" opacity=".25"/><path d="M12 9v11" stroke="currentColor" stroke-width="1.8"/><path d="M12 9C12 9 9 9 8 7.5C7.2 6.3 8 5 9.3 5C11 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9C12 9 15 9 16 7.5C16.8 6.3 16 5 14.7 5C13 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`

const GIFT_ICON_LG = `<svg viewBox="0 0 24 24" fill="none" class="gift-icon-lg"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18v3H3V9Z" fill="currentColor" opacity=".2"/><path d="M12 9v11" stroke="currentColor" stroke-width="1.5"/><path d="M12 9C12 9 9 9 8 7.5C7.2 6.3 8 5 9.3 5C11 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9C12 9 15 9 16 7.5C16.8 6.3 16 5 14.7 5C13 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`

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

function substitute(tmpl, { premio, dataFormatada, horario, local, valorCartela, premioImg, tabelaHTML }) {
  return tmpl
    .replace(/{{NUMERO}}/g, '0001')
    .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '19:00')
    .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || 'R$ 10,00')
    .replace(/{{IMAGEM_PREMIO}}/g, premioImg)
    .replace(/{{QR_CODE}}/g, premioImg) // retrocompat
    .replace(/{{TABELA}}/g, tabelaHTML)
}

router.get('/', async (req, res) => {
  try {
    const savedHtml = await getTemplateFromFirestore()
    res.json({ html: savedHtml })
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

    const premioImg = premioImageBase64
      ? `<img src="${premioImageBase64}" class="prize-photo" />`
      : `<div class="prize-photo prize-photo-empty">${GIFT_ICON_LG}</div>`

    const tabelaHTML = rows.map(row =>
      `<tr>${row.map(cell =>
        `<td class="cell${cell.free ? ' cell-free' : ''}">${cell.free ? GIFT_ICON : cell.value}</td>`
      ).join('')}</tr>`
    ).join('')

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
