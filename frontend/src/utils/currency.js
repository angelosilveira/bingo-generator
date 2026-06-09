/**
 * Formata um valor digitado como moeda brasileira: R$ 10,00
 * Aceita entrada livre e retorna sempre formatado.
 */
export function formatCurrency(raw) {
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  // Trata como centavos
  const cents = parseInt(digits, 10)
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Handler para input: transforma enquanto digita
 */
export function handleCurrencyInput(e, setter) {
  const formatted = formatCurrency(e.target.value)
  setter(prev => ({ ...prev, valorCartela: formatted }))
}

/**
 * Garante exibição formatada — se já vier "R$ 10,00" mantém,
 * se vier "100" ou "10.5" converte.
 */
export function displayCurrency(val) {
  if (!val) return ''
  if (typeof val === 'string' && val.includes('R$')) return val
  const num = parseFloat(String(val).replace(',', '.'))
  if (isNaN(num)) return val
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
