import express from 'express'
import { db } from '../services/firebase.js'
import { gerarPDF } from '../services/pdfService.js'

const router = express.Router()

router.post('/gerar', async (req, res) => {
  const {
    bingoId,
    quantidadeCartelas,
    cartelajInicio = 1,   // número da primeira cartela (padrão: 1)
    premio,
    premioImageBase64,
    data,
    horario,
    local,
    valorCartela,
  } = req.body

  if (!bingoId || !quantidadeCartelas) {
    return res.status(400).json({ error: 'bingoId e quantidadeCartelas são obrigatórios.' })
  }

  const inicio = Number(cartelajInicio)
  const quantidade = Number(quantidadeCartelas)
  const fim = inicio + quantidade - 1

  try {
    console.log(`🎱 Gerando cartelas ${inicio}–${fim} (${quantidade} total) para bingo ${bingoId}…`)

    // Busca template customizado do Firestore
    let customTemplate = null
    try {
      const tmplSnap = await db.collection('config').doc('template').get()
      if (tmplSnap.exists && tmplSnap.data().html) {
        customTemplate = tmplSnap.data().html
        console.log('📄 Usando template customizado')
      }
    } catch (e) {
      console.warn('⚠️ Template customizado não encontrado, usando padrão:', e.message)
    }

    const pdfBuffer = await gerarPDF({
      quantidadeCartelas: quantidade,
      cartelajInicio: inicio,
      premio,
      premioImageBase64,
      data,
      horario,
      local,
      valorCartela,
      customTemplate,
    })

    // Atualiza status e total de cartelas geradas
    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      totalCartelas: fim,
      pdfGeneratedAt: new Date(),
    })

    console.log(`✅ PDF gerado: ${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB (cartelas ${inicio}–${fim})`)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bingo-${bingoId}-${inicio}-${fim}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })
    res.send(pdfBuffer)

  } catch (err) {
    console.error('❌ Erro detalhado:', err.message)
    console.error('❌ Stack:', err.stack)
    await db.collection('bingos').doc(bingoId).update({ status: 'error' }).catch(() => {})
    res.status(500).json({ error: 'Erro ao gerar PDF.', detail: err.message })
  }
})

export default router
