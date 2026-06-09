import puppeteer from 'puppeteer'
import { gerarCartela } from './bingoGenerator.js'
import { gerarHTMLCartela } from '../templates/cartela.js'

/**
 * Gera um PDF com N cartelas de bingo usando Puppeteer.
 * Cada cartela ocupa uma página A4.
 * Retorna um Buffer com o PDF pronto.
 */
export async function gerarPDF({
  quantidadeCartelas,
  premio,
  premioImageUrl,
  data,
  horario,
  local,
  valorCartela,
}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Monta o HTML de todas as cartelas em um único documento,
    // cada uma em sua própria "página" via page-break-after.
    const allCartelasHTML = []

    for (let i = 1; i <= quantidadeCartelas; i++) {
      const rows = gerarCartela()
      const html = gerarHTMLCartela({
        numero: i,
        rows,
        premio,
        premioImageUrl,
        data,
        horario,
        local,
        valorCartela,
      })
      allCartelasHTML.push(html)
    }

    // Envolve tudo em um documento com page-break entre cartelas
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
    // Extrai somente o <body> de cada cartela para embutir no documento único
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    const bodyContent = bodyMatch ? bodyMatch[1] : html
    return `<div class="page-wrap">${bodyContent}</div>`
  })
  .join('\n')}
</body>
</html>`

    await page.setContent(fullHTML, { waitUntil: 'networkidle0' })

    // Aguarda imagens carregarem (se houver URL de prêmio)
    if (premioImageUrl) {
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = resolve
                  img.onerror = resolve
                })
            )
        )
      })
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    return pdfBuffer
  } finally {
    await browser.close()
  }
}
