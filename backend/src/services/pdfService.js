import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { fmtValor } from '../utils/format.js'

const BATCH_SIZE = 20

function buildGrid(rows) {
  return rows.flat().map(cell =>
    cell.free
      ? `<div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div>`
      : `<div class="cell">${cell.value}</div>`
  ).join('')
}

function renderTemplate(template, { numero, rows, premio, premioImageBase64, premioImagens, contato, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR') : '__/__/____'

  const imgs = Array.from({ length: 3 }, (_, i) => {
    const src = (premioImagens && premioImagens[i]) || (i === 0 ? premioImageBase64 : null)
    return src ? `<img src="${src}" alt="Premio ${i+1}" class="prize-img" />`
               : `<div class="prize-img img-placeholder"><i class="fa-solid fa-image"></i></div>`
  }).join('')

  return template
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, premio || 'A DEFINIR')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || '')
    .replace(/{{CONTATO}}/g, contato || '—')
    .replace(/{{IMAGEM_PREMIO}}/g, imgs)
    .replace(/{{TABELA}}/g, buildGrid(rows))
}

export async function gerarPDF({
  quantidadeCartelas, cartelajInicio = 1,
  premio, premioImageBase64, premioImagens, contato,
  data, horario, local, valorCartela, customTemplate,
}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage',
      '--disable-gpu','--disable-extensions','--disable-background-networking',
      '--disable-default-apps','--disable-sync','--no-first-run'],
    timeout: 30000,
  })

  const { PDFDocument } = await import('pdf-lib')
  const mergedDoc = await PDFDocument.create()

  try {
    const todasCartelas = Array.from({ length: quantidadeCartelas }, (_, i) => ({
      numero: cartelajInicio + i, rows: gerarCartela(),
    }))
    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE)
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))

    console.log(`📦 ${cartelajInicio}–${cartelajInicio + quantidadeCartelas - 1} → ${lotes.length} lotes`)

    for (let li = 0; li < lotes.length; li++) {
      console.log(`  → Lote ${li + 1}/${lotes.length}`)
      for (const { numero, rows } of lotes[li]) {
        const page = await browser.newPage()
        try {
          const html = customTemplate
            ? renderTemplate(customTemplate, { numero, rows, premio, premioImageBase64, premioImagens, contato, data, horario, local, valorCartela })
            : gerarHTMLCartela({ numero, rows, premio, premioImageBase64, premioImagens, contato, data, horario, local, valorCartela })
          await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 })
          const pdfBuf = await page.pdf({ format: 'A4', printBackground: true, timeout: 60000 })
          const doc = await PDFDocument.load(pdfBuf)
          const [pg] = await mergedDoc.copyPages(doc, [0])
          mergedDoc.addPage(pg)
        } finally { await page.close() }
      }
    }
    const finalPdf = await mergedDoc.save()
    console.log(`✅ ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB`)
    return Buffer.from(finalPdf)
  } finally { await browser.close() }
}
