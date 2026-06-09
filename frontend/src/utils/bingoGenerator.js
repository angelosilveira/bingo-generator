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

export function gerarCartelaPreview() {
  const B = pickUnique(1, 15, 5)
  const I = pickUnique(16, 30, 5)
  const N = pickUnique(31, 45, 4)
  const G = pickUnique(46, 60, 5)
  const O = pickUnique(61, 75, 5)

  N.splice(2, 0, 'FREE')
  const columns = [B, I, N, G, O]

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
