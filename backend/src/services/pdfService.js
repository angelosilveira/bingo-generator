import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { gerarQRCode } from './qrService.js'
import { fmtValor } from '../utils/format.js'

const BATCH_SIZE = 20

function renderTemplate(template, { numero, rows, premio, premioQrUrl, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const qrBlock = premioQrUrl
    ? `<img src="${premioQrUrl}" style="width:90px;height:90px;display:block;margin:0 auto 6px;" />`
    : `<div style="width:90px;height:90px;margin:0 auto 6px;background:#f0f0f0;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;border-radius:6px;"><div style="font-size:10px;color:#999;text-align:center;line-height:1.3;padding:4px;">QR CODE</div></div>`


  return template
    .replace(/{{NUMERO}}/g, numFormatado)
    .replace(/{{PREMIO}}/g, premio || 'A DEFINIR')
    .replace(/{{DATA}}/g, dataFormatada)
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '')
    .replace(/{{VALOR}}/g, fmtValor(valorCartela) || '')
    .replace(/{{QR_CODE}}/g, qrBlock)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

export async function gerarPDF({
  quantidadeCartelas,
  cartelajInicio = 1,
  premio,
  premioQrLink,
  data,
  horario,
  local,
  valorCartela,
  customTemplate,
}) {
  // Gera QR code uma vez só (mesmo URL para todas as cartelas do bingo)
  const premioQrUrl = await gerarQRCode(premioQrLink)
  console.log(`🔗 QR code ${premioQrUrl ? 'gerado' : 'não gerado (sem URL)'}`)

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
            ? renderTemplate(customTemplate, { numero, rows, premio, premioQrUrl, data, horario, local, valorCartela })
            : gerarHTMLCartela({ numero, rows, premio, premioQrUrl, data, horario, local, valorCartela })

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
