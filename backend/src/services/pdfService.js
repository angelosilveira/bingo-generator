import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

const BATCH_SIZE = 50 // cartelas por lote

async function gerarLote({ browser, cartelas, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const page = await browser.newPage()

  try {
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
${cartelas.map(({ numero, rows }) => {
  const html = gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela })
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  const bodyContent = bodyMatch ? bodyMatch[1] : html
  return `<div class="page-wrap">${bodyContent}</div>`
}).join('\n')}
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

function mergePDFs(buffers) {
  // Concatenação simples de PDFs via marcadores de página
  // Usa o módulo pdf-lib para merge correto
  return buffers
}

export async function gerarPDF({ quantidadeCartelas, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions',
    ],
  })

  try {
    // Gera todos os dados das cartelas primeiro (leve, só números)
    const todasCartelas = []
    for (let i = 1; i <= quantidadeCartelas; i++) {
      todasCartelas.push({ numero: i, rows: gerarCartela() })
    }

    // Divide em lotes de BATCH_SIZE
    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE) {
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))
    }

    console.log(`📦 Gerando ${lotes.length} lotes de até ${BATCH_SIZE} cartelas…`)

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

    // Merge todos os PDFs num único arquivo
    const { PDFDocument } = await import('pdf-lib')
    const mergedDoc = await PDFDocument.create()

    for (const buffer of pdfBuffers) {
      const doc = await PDFDocument.load(buffer)
      const pages = await mergedDoc.copyPages(doc, doc.getPageIndices())
      pages.forEach(p => mergedDoc.addPage(p))
    }

    const finalPdf = await mergedDoc.save()
    console.log(`✅ PDF final: ${finalPdf.byteLength} bytes, ${quantidadeCartelas} cartelas`)

    return Buffer.from(finalPdf)
  } finally {
    await browser.close()
  }
}
