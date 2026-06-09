/**
 * Gera números únicos para uma cartela de bingo.
 * Regras oficiais:
 *   B: 1–15   (5 números)
 *   I: 16–30  (5 números)
 *   N: 31–45  (4 números + FREE no centro)
 *   G: 46–60  (5 números)
 *   O: 61–75  (5 números)
 */
function pickUnique(min, max, count) {
  const pool = []
  for (let i = min; i <= max; i++) pool.push(i)
  const picked = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked.sort((a, b) => a - b)
}

/**
 * Retorna uma matriz 5x5 onde cada elemento é { value, free }
 * A posição central [2][2] é marcada como FREE (coluna N)
 */
export function gerarCartela() {
  const B = pickUnique(1, 15, 5)
  const I = pickUnique(16, 30, 5)
  const N = pickUnique(31, 45, 4) // 4 números + 1 FREE
  const G = pickUnique(46, 60, 5)
  const O = pickUnique(61, 75, 5)

  // Insere o FREE na posição central da coluna N (índice 2)
  N.splice(2, 0, 'FREE')

  const columns = [B, I, N, G, O]

  // Transpõe para linhas (5 linhas × 5 colunas)
  const rows = []
  for (let row = 0; row < 5; row++) {
    rows.push(
      columns.map((col, colIdx) => ({
        value: col[row],
        free: colIdx === 2 && row === 2,
      }))
    )
  }
  return rows
}
