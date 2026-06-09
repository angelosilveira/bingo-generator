import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

const BATCH_SIZE = 20 // menor lote = menos memória por vez

async function gerarLote({ browser, cartelas, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const page = await browser.newPage()

  try {
    const pagesHTML = cartelas.map(({ numero, rows }) => {
      const html = gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela })
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      return bodyMatch ? bodyMatch[1] : html
    })

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @page { margin: 0; size: A4 portrait; }
  body { margin: 0; padding: 0; }
  .page-wrap {
    width: 794px;
    min-height: 1123px;
    page-break-after: always;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e8f0fe;
  }
  .page-wrap:last-child { page-break-after: avoid; }
</style>
</head>
<body>
${pagesHTML.map(c => `<div class="page-wrap">${c}</div>`).join('\n')}
</body>
</html>`

    await page.setContent(fullHTML, { waitUntil: 'domcontentloaded', timeout: 120000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      timeout: 120000,
    })

    return pdfBuffer
  } finally {
    await page.close()
  }
}

export async function gerarPDF({ quantidadeCartelas, premio, premioImageBase64, data, horario, local, valorCartela }) {
  // Remove o base64 da imagem do HTML se for muito grande — usa URL de dados inline
  // Puppeteer lida bem com data URIs, então mantemos mas garantimos tamanho razoável

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--no-first-run',
      // SEM --single-process e SEM --no-zygote: causam crashes
    ],
    timeout: 30000,
  })

  try {
    // Gera dados de todas as cartelas (só números, leve)
    const todasCartelas = Array.from({ length: quantidadeCartelas }, (_, i) => ({
      numero: i + 1,
      rows: gerarCartela(),
    }))

    // Divide em lotes
    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE) {
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))
    }

    console.log(`📦 ${quantidadeCartelas} cartelas → ${lotes.length} lotes de ${BATCH_SIZE}`)

    // Gera PDF de cada lote sequencialmente
    const pdfBuffers = []
    for (let i = 0; i < lotes.length; i++) {
      console.log(`  → Lote ${i + 1}/${lotes.length}`)
      const buffer = await gerarLote({
        browser,
        cartelas: lotes[i],
        premio,
        premioImageBase64,
        data,
        horario,
        local,
        valorCartela,
      })
      pdfBuffers.push(buffer)
    }

    // Merge com pdf-lib
    const { PDFDocument } = await import('pdf-lib')
    const mergedDoc = await PDFDocument.create()

    for (const buffer of pdfBuffers) {
      const doc = await PDFDocument.load(buffer)
      const pages = await mergedDoc.copyPages(doc, doc.getPageIndices())
      pages.forEach(p => mergedDoc.addPage(p))
    }

    const finalPdf = await mergedDoc.save()
    console.log(`✅ PDF final: ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB — ${quantidadeCartelas} cartelas`)

    return Buffer.from(finalPdf)
  } finally {
    await browser.close()
  }
}
