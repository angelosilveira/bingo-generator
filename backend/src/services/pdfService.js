import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { fmtValor } from '../utils/format.js'

const BATCH_SIZE = 20

// Para templates customizados salvos pelo usuário (editor de template)
function renderTemplate(template, { numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const GIFT_ICON = `<svg viewBox="0 0 24 24" fill="none" class="gift-icon"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18v3H3V9Z" fill="currentColor" opacity=".25"/><path d="M12 9v11" stroke="currentColor" stroke-width="1.8"/><path d="M12 9C12 9 9 9 8 7.5C7.2 6.3 8 5 9.3 5C11 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9C12 9 15 9 16 7.5C16.8 6.3 16 5 14.7 5C13 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="cell${cell.free ? ' cell-free' : ''}">${cell.free ? GIFT_ICON : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const GIFT_ICON_LG = `<svg viewBox="0 0 24 24" fill="none" class="gift-icon-lg"><rect x="3" y="9" width="18" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18v3H3V9Z" fill="currentColor" opacity=".2"/><path d="M12 9v11" stroke="currentColor" stroke-width="1.5"/><path d="M12 9C12 9 9 9 8 7.5C7.2 6.3 8 5 9.3 5C11 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 9C12 9 15 9 16 7.5C16.8 6.3 16 5 14.7 5C13 5 12 7 12 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" class="prize-photo" />`
    : `<div class="prize-photo prize-photo-empty">${GIFT_ICON_LG}</div>`

  return template
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, premio || 'A DEFINIR')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || '')
    .replace(/{{IMAGEM_PREMIO}}/g, premioImg)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

export async function gerarPDF({
  quantidadeCartelas,
  cartelajInicio = 1,
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
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', '--disable-gpu',
      '--disable-extensions', '--disable-background-networking',
      '--disable-default-apps', '--disable-sync', '--no-first-run',
    ],
    timeout: 30000,
  })

  const { PDFDocument } = await import('pdf-lib')
  const mergedDoc = await PDFDocument.create()

  try {
    const todasCartelas = Array.from({ length: quantidadeCartelas }, (_, i) => ({
      numero: cartelajInicio + i,
      rows: gerarCartela(),
    }))

    const lotes = []
    for (let i = 0; i < todasCartelas.length; i += BATCH_SIZE) {
      lotes.push(todasCartelas.slice(i, i + BATCH_SIZE))
    }

    const fim = cartelajInicio + quantidadeCartelas - 1
    console.log(`📦 Cartelas ${cartelajInicio}–${fim} → ${lotes.length} lotes de ${BATCH_SIZE}`)

    for (let li = 0; li < lotes.length; li++) {
      console.log(`  → Lote ${li + 1}/${lotes.length}`)
      for (const { numero, rows } of lotes[li]) {
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
    console.log(`✅ PDF: ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB`)
    return Buffer.from(finalPdf)
  } finally {
    await browser.close()
  }
}
