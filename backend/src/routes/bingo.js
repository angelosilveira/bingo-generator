import express from 'express'
import { db } from '../services/firebase.js'
import { gerarPDF } from '../services/pdfService.js'

const router = express.Router()

router.post('/gerar', async (req, res) => {
  const { bingoId, quantidadeCartelas, premio, premioImageBase64, data, horario, local, valorCartela } = req.body

  if (!bingoId || !quantidadeCartelas) {
    return res.status(400).json({ error: 'bingoId e quantidadeCartelas são obrigatórios.' })
  }

  try {
    console.log(`🎱 Gerando ${quantidadeCartelas} cartelas para bingo ${bingoId}…`)

    // Busca template customizado do Firestore (se existir)
    let customTemplate = null
    try {
      const tmplSnap = await db.collection('config').doc('template').get()
      if (tmplSnap.exists && tmplSnap.data().html) {
        customTemplate = tmplSnap.data().html
        console.log('📄 Usando template customizado do Firestore')
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível carregar template customizado:', e.message)
    }

    const pdfBuffer = await gerarPDF({
      quantidadeCartelas: Number(quantidadeCartelas),
      premio,
      premioImageBase64,
      data,
      horario,
      local,
      valorCartela,
      customTemplate,
    })

    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      pdfGeneratedAt: new Date(),
    })

    console.log(`✅ PDF gerado: ${(pdfBuffer.length / 1024 / 1024).toFixed(1)} MB`)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bingo-${bingoId}.pdf"`,
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
