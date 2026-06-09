import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

const BATCH_SIZE = 20

export async function gerarPDF({ quantidadeCartelas, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--no-first-run',
    ],
    timeout: 30000,
  })

  const { PDFDocument } = await import('pdf-lib')
  const mergedDoc = await PDFDocument.create()

  try {
    const todasCartelas = Array.from({ length: quantidadeCartelas }, (_, i) => ({
      numero: i + 1,
      rows: gerarCartela(),
    }))

    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE) {
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))
    }

    console.log(`📦 ${quantidadeCartelas} cartelas → ${lotes.length} lotes de ${BATCH_SIZE}`)

    for (let li = 0; li < lotes.length; li++) {
      const lote = lotes[li]
      console.log(`  → Lote ${li + 1}/${lotes.length}`)

      // Cada cartela vira uma página individualmente dentro do lote
      for (const { numero, rows } of lote) {
        const page = await browser.newPage()
        try {
          const html = gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela })
          await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 })
          const pdfBuf = await page.pdf({ format: 'A4', printBackground: true, timeout: 60000 })

          const doc = await PDFDocument.load(pdfBuf)
          const [pg] = await mergedDoc.copyPages(doc, [0])
          mergedDoc.addPage(pg)
        } finally {
          await page.close()
        }
      }
    }

    const finalPdf = await mergedDoc.save()
    console.log(`✅ PDF final: ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB — ${quantidadeCartelas} cartelas`)
    return Buffer.from(finalPdf)

  } finally {
    await browser.close()
  }
}
