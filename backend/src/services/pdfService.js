import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

const BATCH_SIZE = 20

function renderTemplate(template, { numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const imgHtml = premioImageBase64
    ? `<img src="${premioImageBase64}" style="height:52px;max-width:100%;object-fit:contain;display:block;margin:0 auto 4px;" />`
    : `<div style="font-size:42px;text-align:center;line-height:1;margin-bottom:4px;">🎁</div>`

  return template
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, premio || 'A DEFINIR')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '')
    .replace(/{{VALOR}}/g, valorCartela || '')
    .replace(/{{IMAGEM_PREMIO}}/g, imgHtml)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

export async function gerarPDF({
  quantidadeCartelas,
  cartelajInicio = 1,   // começa do 1 por padrão
  premio,
  premioImageBase64,
  data,
  horario,
  local,
  valorCartela,
  customTemplate,
}) {
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
    // Gera cartelas com numeração correta a partir de cartelajInicio
    const todasCartelas = Array.from({ length: quantidadeCartelas }, (_, i) => ({
      numero: cartelajInicio + i,   // ex: 501, 502, 503...
      rows: gerarCartela(),
    }))

    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE) {
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))
    }

    const fim = cartelajInicio + quantidadeCartelas - 1
    console.log(`📦 Cartelas ${cartelajInicio}–${fim} → ${lotes.length} lotes de ${BATCH_SIZE}`)

    for (let li = 0; li < lotes.length; li++) {
      const lote = lotes[li]
      console.log(`  → Lote ${li + 1}/${lotes.length}`)

      for (const { numero, rows } of lote) {
        const page = await browser.newPage()
        try {
          const html = customTemplate
            ? renderTemplate(customTemplate, { numero, rows, premio, premioImageBase64, data, horario, local, valorCartela })
            : gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela })

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
    console.log(`✅ PDF final: ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB`)
    return Buffer.from(finalPdf)

  } finally {
    await browser.close()
  }
}
