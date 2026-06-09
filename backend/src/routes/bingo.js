import express from 'express'
import { db } from '../services/firebase.js'
import { gerarPDF } from '../services/pdfService.js'

const router = express.Router()

router.post('/gerar', async (req, res) => {
  const {
    bingoId,
    quantidadeCartelas,
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

  try {
    console.log(`🎱 Gerando ${quantidadeCartelas} cartelas para bingo ${bingoId}…`)

    const pdfBuffer = await gerarPDF({
      quantidadeCartelas: Number(quantidadeCartelas),
      premio,
      premioImageBase64,
      data,
      horario,
      local,
      valorCartela,
    })

    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      pdfGeneratedAt: new Date(),
    })

    console.log(`✅ PDF gerado: ${pdfBuffer.length} bytes`)

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
