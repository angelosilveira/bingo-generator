import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

const BATCH_SIZE = 20

// Substitui variáveis do template customizado
function renderTemplate(template, { numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="td">${cell.free ? '🎁' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const imgHtml = premioImageBase64
    ? `<img class="prize-img" src="${premioImageBase64}" />`
    : `<div style="font-size:36px;padding:8px 0;text-align:center;">🎁</div>`

  return template
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, premio || '')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '')
    .replace(/{{VALOR}}/g, valorCartela || '')
    .replace(/{{IMAGEM_PREMIO}}/g, imgHtml)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

export async function gerarPDF({ quantidadeCartelas, premio, premioImageBase64, data, horario, local, valorCartela, customTemplate }) {
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

      for (const { numero, rows } of lote) {
        const page = await browser.newPage()
        try {
          // Usa template customizado (com variáveis) ou o padrão (com função)
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
