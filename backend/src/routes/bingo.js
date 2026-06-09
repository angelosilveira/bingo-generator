import express from 'express'
import { db, bucket } from '../services/firebase.js'
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
    premioImageUrl,
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
      premioImageUrl,
      data,
      horario,
      local,
      valorCartela,
    })

    // Upload do PDF no Firebase Storage
    const filename = `pdfs/bingo-${bingoId}.pdf`
    const file = bucket.file(filename)

    await file.save(pdfBuffer, {
      metadata: { contentType: 'application/pdf' },
    })

    // Gera URL pública assinada (válida por 7 dias)
    const [pdfUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })

    // Atualiza o Firestore
    await db.collection('bingos').doc(bingoId).update({
      status: 'done',
      pdfUrl,
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
