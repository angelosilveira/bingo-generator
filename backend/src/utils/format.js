export function fmtValor(v) {
  if (!v) return ''
  if (typeof v === 'string' && v.includes('R$')) return v
  const n = parseFloat(String(v).replace(',', '.'))
  if (isNaN(n)) return v
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
