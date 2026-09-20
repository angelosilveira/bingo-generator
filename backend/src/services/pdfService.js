import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'
import { fmtValor } from '../utils/format.js'

const BATCH_SIZE = 10

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

// Junta vários HTMLs de cartela em um só documento, uma cartela por página.
// Imagens data: são extraídas e reinseridas como UMA blob URL compartilhada, senão o
// Chromium embute uma cópia por <img> no PDF.
function combinarHTMLs(htmls) {
  const imagens = []
  htmls = htmls.map(h => h.replace(/src="(data:[^"]+)"/g, (_, uri) => {
    let i = imagens.indexOf(uri)
    if (i < 0) i = imagens.push(uri) - 1
    return `data-img="${i}"`
  }))
  const head = htmls[0].match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
  const pages = htmls.map(h => {
    const body = h.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? h
    return `<div class="pg">${body}</div>`
  }).join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head>${head}<style>
@page { size: 794px 1123px; margin: 0 }
html, body { width:794px !important; height:auto !important; overflow:visible !important; padding:0 !important; margin:0 !important }
.pg { width:794px; height:1123px; padding:14px; overflow:hidden; background:#ECEFF3; break-after:page; page-break-after:always; box-sizing:border-box }
.pg:last-child { break-after:auto; page-break-after:auto }
</style></head><body>${pages}</body></html>`
  return { html, imagens }
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
      const htmls = lotes[li].map(({ numero, rows }) => customTemplate
        ? renderTemplate(customTemplate, { numero, rows, premio, premioImageBase64, premioImagens, contato, data, horario, local, valorCartela })
        : gerarHTMLCartela({ numero, rows, premio, premioImageBase64, premioImagens, contato, data, horario, local, valorCartela }))

      // Um único PDF por lote: o Chromium deduplica imagens/fontes dentro do mesmo
      // documento. Um PDF por cartela embutia a foto do prêmio 100x (~200 MB).
      const page = await browser.newPage()
      try {
        const { html, imagens } = combinarHTMLs(htmls)
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 120000 })
        if (imagens.length) await page.evaluate(async (uris) => {
          // reduz p/ o tamanho exibido (220x~365px, 2x) — fotos de celular têm vários MB
          const reduzir = async u => {
            const bmp = await createImageBitmap(await (await fetch(u)).blob())
            const W = 440, H = 730, k = Math.max(W / bmp.width, H / bmp.height)
            const c = Object.assign(document.createElement('canvas'), { width: W, height: H })
            const g = c.getContext('2d')
            g.drawImage(bmp, (W - bmp.width * k) / 2, (H - bmp.height * k) / 2, bmp.width * k, bmp.height * k)
            return URL.createObjectURL(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85)))
          }
          const urls = await Promise.all(uris.map(reduzir))
          await Promise.all([...document.querySelectorAll('img[data-img]')].map(img => new Promise(res => {
            img.onload = img.onerror = res
            img.src = urls[img.dataset.img]
          })))
        }, imagens)
        const pdfBuf = await page.pdf({ width: '794px', height: '1123px', printBackground: true, timeout: 120000 })
        const doc = await PDFDocument.load(pdfBuf)
        const pgs = await mergedDoc.copyPages(doc, doc.getPageIndices())
        pgs.forEach(p => mergedDoc.addPage(p))
      } finally { await page.close() }
    }
    const finalPdf = await mergedDoc.save()
    console.log(`✅ ${(finalPdf.byteLength / 1024 / 1024).toFixed(1)} MB`)
    return Buffer.from(finalPdf)
  } finally { await browser.close() }
}
