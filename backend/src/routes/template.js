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
    if (!snap.exists || !snap.data().html) return null
    const html = snap.data().html
    const required = ['{{PREMIO}}','{{LOCAL}}','{{DATA}}','{{HORARIO}}','{{CONTATO}}','{{NUMERO}}','{{TABELA}}','{{VALOR}}']
    if (required.some(p => !html.includes(p))) {
      console.log('⚠️ Template desatualizado — deletando')
      db.collection('config').doc('template').delete().catch(() => {})
      return null
    }
    return html
  } catch {}
  return null
}

function buildGrid(rows) {
  return rows.flat().map(cell =>
    cell.free
      ? `<div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div>`
      : `<div class="cell">${cell.value}</div>`
  ).join('')
}

function substitute(tmpl, { numero, premio, dataFormatada, horario, local, valorCartela, contato, premioImg, gridHTML }) {
  return tmpl
    .replace(/{{NUMERO}}/g, numero || '0001')
    .replace(/{{PREMIO}}/g, premio || 'Smart TV 55" Samsung')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '19:00')
    .replace(/{{LOCAL}}/g, local || 'Clube Recreativo Central')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || 'R$ 10,00')
    .replace(/{{CONTATO}}/g, contato || '—')
    .replace(/{{IMAGEM_PREMIO}}/g, premioImg)
    .replace(/{{TABELA}}/g, gridHTML)
}

router.get('/', async (req, res) => {
  try {
    res.json({ html: await getTemplateFromFirestore() || null })
  } catch { res.json({ html: null }) }
})

router.post('/', async (req, res) => {
  const { html } = req.body
  if (!html || typeof html !== 'string') return res.status(400).json({ error: 'html obrigatório' })
  try {
    await db.collection('config').doc('template').set({ html, updatedAt: new Date() })
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/', async (req, res) => {
  try {
    await db.collection('config').doc('template').delete()
    res.json({ ok: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/template/preview
// Modo "form": sem html no body → usa gerarHTMLCartela direto (ignora Firestore)
// Modo "editor": com html no body → substitui placeholders no HTML enviado
router.post('/preview', async (req, res) => {
  try {
    const { html, premio, data, horario, local, valorCartela, contato, premioImageBase64, premioImagens } = req.body

    const rows = gerarCartela()
    const dataFormatada = data
      ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR')

    const imgs = Array.from({ length: 3 }, (_, i) => {
      const src = (premioImagens && premioImagens[i]) || (i === 0 ? premioImageBase64 : null)
      return src
        ? `<img src="${src}" alt="Premio ${i+1}" class="prize-img" />`
        : `<div class="prize-img img-placeholder"><i class="fa-solid fa-image"></i></div>`
    })
    const premioImg = imgs.join('')
    const gridHTML = buildGrid(rows)

    // Modo editor: tem html no body → substitui e devolve
    if (html) {
      console.log('🖼 Preview: editor')
      const params = { premio, dataFormatada, horario, local, valorCartela, contato, premioImg, gridHTML }
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(substitute(html, params))
    }

    // Modo formulário: SEM html → gera direto do sistema com os dados do form
    // NUNCA usa o template do Firestore aqui para evitar valores hardcoded
    console.log('🖼 Preview: formulário → gerarHTMLCartela direto')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(gerarHTMLCartela({
      numero: 1,
      rows,
      premio:           premio        || 'A DEFINIR',
      premioImageBase64: imagemPrincipal(premioImagens, premioImageBase64),
      premioImagens:    premioImagens || [],
      data,
      horario:          horario       || '',
      local:            local         || '',
      valorCartela:     valorCartela  || '',
      contato:          contato       || '',
    }))
  } catch (err) {
    console.error('❌ Preview:', err.message)
    res.status(500).json({ error: err.message })
  }
})

function imagemPrincipal(premioImagens, premioImageBase64) {
  if (premioImagens && premioImagens[0]) return premioImagens[0]
  return premioImageBase64 || null
}

export default router
