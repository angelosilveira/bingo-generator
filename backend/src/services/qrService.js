import QRCode from 'qrcode'

/**
 * Gera um QR code a partir de uma URL e retorna como string base64 (data URI PNG)
 */
export async function gerarQRCode(url) {
  if (!url) return null
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0D1F3C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
    return dataUrl
  } catch (err) {
    console.error('Erro ao gerar QR code:', err.message)
    return null
  }
}
