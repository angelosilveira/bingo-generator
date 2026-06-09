import express from 'express'
import { db } from '../services/firebase.js'
import { gerarPDF } from '../services/pdfService.js'

const router = express.Router()

/**
 * POST /api/bingo/gerar
 * Gera o PDF e retorna direto como download (application/pdf).
 * Também atualiza o status no Firestore.
 */
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

    // Atualiza status no Firestore
    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      pdfGeneratedAt: new Date(),
    })

    console.log(`✅ PDF gerado: ${pdfBuffer.length} bytes`)

    // Retorna o PDF diretamente como download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="bingo-${bingoId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    })
    res.send(pdfBuffer)

  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err)
    await db.collection('bingos').doc(bingoId).update({ status: 'error' }).catch(() => {})
    res.status(500).json({ error: 'Erro ao gerar PDF.' })
  }
})

export default router
