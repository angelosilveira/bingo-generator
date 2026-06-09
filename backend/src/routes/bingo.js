import express from 'express'
import { db } from '../services/firebase.js'
import { gerarPDF } from '../services/pdfService.js'

const router = express.Router()

/**
 * POST /api/bingo/gerar
 * Gera o PDF de um bingo e salva no Firebase Storage.
 * Atualiza o documento no Firestore com a URL do PDF.
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

  // Responde imediatamente — a geração acontece em background
  res.json({ message: 'Geração iniciada.', bingoId })

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

    // Converte PDF para Base64 e salva direto no Firestore
    const pdfBase64 = pdfBuffer.toString('base64')

    // Atualiza o Firestore com o PDF em Base64
    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      pdfBase64,
      pdfGeneratedAt: new Date(),
    })

    console.log(`✅ PDF gerado com sucesso: ${filename}`)
  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err)
    await db.collection('bingos').doc(bingoId).update({
      status: 'error',
    })
  }
})

export default router
