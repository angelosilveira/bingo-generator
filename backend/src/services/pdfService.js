import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

export async function gerarPDF({
  quantidadeCartelas,
  premio,
  premioImageBase64,
  data,
  horario,
  local,
  valorCartela,
}) {
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
    const page = await browser.newPage()

    // Aumenta o timeout para 1000 cartelas (5 minutos)
    page.setDefaultNavigationTimeout(300000)
    page.setDefaultTimeout(300000)

    const allCartelasHTML = []

    for (let i = 1; i <= quantidadeCartelas; i++) {
      const rows = gerarCartela()
      const html = gerarHTMLCartela({
        numero: i,
        rows,
        premio,
        premioImageBase64,
        data,
        horario,
        local,
        valorCartela,
      })
      allCartelasHTML.push(html)
    }

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
${allCartelasHTML
  .map((html) => {
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html
    return `<div class="page-wrap">${bodyContent}</div>`
  })
  .join('\n')}
</body>
</html>`

    await page.setContent(fullHTML, {
      waitUntil: 'domcontentloaded',
      timeout: 300000,
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      timeout: 300000,
    })

    return pdfBuffer
  } finally {
    await browser.close()
  }
}
