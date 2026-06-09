import { useState } from 'react'

const COLS = {
  B: { range: [1, 15],  bg: '#0D1F3C', text: '#fff' },
  I: { range: [16, 30], bg: '#E8A000', text: '#fff' },
  N: { range: [31, 45], bg: '#0D1F3C', text: '#fff' },
  G: { range: [46, 60], bg: '#E8A000', text: '#fff' },
  O: { range: [61, 75], bg: '#0D1F3C', text: '#fff' },
}

function getColuna(n) {
  for (const [col, { range: [min, max] }] of Object.entries(COLS)) {
    if (n >= min && n <= max) return col
  }
  return 'B'
}

export default function ConferenciaPage() {
  const [sorteados, setSorteados] = useState([]) // ordem cronológica
  const [animando, setAnimando] = useState(null)

  const totalFaltam = 75 - sorteados.length
  const sorteadosReverso = [...sorteados].reverse()

  const toggleNumero = (n) => {
    if (sorteados.includes(n)) {
      if (!window.confirm(`Desmarcar o número ${n}?`)) return
      setSorteados(prev => prev.filter(x => x !== n))
    } else {
      setSorteados(prev => [...prev, n])
      setAnimando(n)
      setTimeout(() => setAnimando(null), 600)
    }
  }

  const resetar = () => {
    if (sorteados.length === 0) return
    if (!window.confirm('Zerar todos os números sorteados?')) return
    setSorteados([])
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F2F5FA', display: 'flex', flexDirection: 'column' }}>

      {/* ── HEADER ── */}
      <header style={{
        background: 'linear-gradient(135deg,#0D1F3C 0%,#182E50 60%,#0D1F3C 100%)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎱</span>
          <div>
            <div style={{
              fontFamily: "Impact,'Arial Black',Arial,sans-serif",
              fontSize: 'clamp(20px,5vw,30px)',
              color: '#E8A000',
              letterSpacing: 4,
              lineHeight: 1,
            }}>BINGO</div>
            <div style={{ color: '#93c5fd', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
              Tabela de Conferência
            </div>
          </div>
        </div>

        {/* Contadores */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            background: '#E8A000', borderRadius: 10, padding: '6px 14px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", fontSize: 'clamp(20px,5vw,28px)', color: '#0D1F3C', lineHeight: 1 }}>
              {sorteados.length}
            </div>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#0D1F3C', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Sorteados
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,.12)', borderRadius: 10, padding: '6px 14px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,.2)',
          }}>
            <div style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", fontSize: 'clamp(20px,5vw,28px)', color: '#fff', lineHeight: 1 }}>
              {totalFaltam}
            </div>
            <div style={{ fontSize: 9, fontWeight: 900, color: '#93c5fd', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Faltam
            </div>
          </div>
          {sorteados.length > 0 && (
            <button onClick={resetar} style={{
              background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
              color: '#fff', borderRadius: 10, padding: '6px 12px',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ↺ Zerar
            </button>
          )}
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '12px 8px',
        maxWidth: 900,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>

        {/* ── GRADE DE NÚMEROS ── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '12px 10px',
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          border: '1px solid #e5eaf2',
        }}>
          {/* Cabeçalho B I N G O */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, marginBottom: 4 }}>
            {Object.entries(COLS).map(([col, { bg }]) => (
              <div key={col} style={{
                background: bg,
                borderRadius: 8,
                textAlign: 'center',
                padding: '8px 0',
                fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                fontSize: 'clamp(18px,4vw,28px)',
                color: '#fff',
                letterSpacing: 2,
              }}>{col}</div>
            ))}
          </div>

          {/* Números 15 linhas × 5 colunas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>
            {Array.from({ length: 15 }, (_, row) =>
              Object.entries(COLS).map(([col, { bg, range: [min] }]) => {
                const n = min + row
                const isSorteado = sorteados.includes(n)
                const isAnim = animando === n
                const ordem = isSorteado ? sorteados.indexOf(n) + 1 : null

                return (
                  <div key={n} onClick={() => toggleNumero(n)}
                    style={{
                      aspectRatio: '1/1',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      position: 'relative',
                      transition: 'all .2s',
                      background: isSorteado ? bg : '#F8FAFF',
                      border: isSorteado ? 'none' : '2px solid #E2E8F2',
                      transform: isAnim ? 'scale(1.18)' : 'scale(1)',
                      boxShadow: isAnim ? `0 0 0 3px ${bg}55` : isSorteado ? '0 2px 6px rgba(0,0,0,.15)' : 'none',
                    }}>
                    <span style={{
                      fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                      fontSize: 'clamp(13px,3.2vw,22px)',
                      fontWeight: 900,
                      color: isSorteado ? '#fff' : '#0D1F3C',
                      lineHeight: 1,
                    }}>{n}</span>
                    {isSorteado && ordem && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 3,
                        fontSize: 'clamp(6px,1.2vw,9px)',
                        color: 'rgba(255,255,255,.75)',
                        fontWeight: 700,
                        lineHeight: 1,
                      }}>{ordem}º</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── HISTÓRICO ── */}
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '12px 10px',
          boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          border: '1px solid #e5eaf2',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 900, color: '#888',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Ordem de sorteio
            <span style={{
              background: '#f0f4fa', color: '#666', fontSize: 9,
              fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              letterSpacing: 1, textTransform: 'none',
            }}>último → primeiro</span>
          </div>

          {sorteadosReverso.length === 0 ? (
            <div style={{
              textAlign: 'center', color: '#ccc', fontSize: 13,
              padding: '24px 0', fontWeight: 500,
            }}>
              Clique nos números acima para sorteá-los
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}>
              {sorteadosReverso.map((n, i) => {
                const col = getColuna(n)
                const { bg } = COLS[col]
                const isUltimo = i === 0
                const ordemReal = sorteados.length - i

                return (
                  <div key={n} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    background: isUltimo ? bg : '#F8FAFF',
                    border: isUltimo ? 'none' : '1.5px solid #E2E8F2',
                    borderRadius: 10,
                    padding: '5px 10px 5px 7px',
                    boxShadow: isUltimo ? '0 2px 8px rgba(0,0,0,.2)' : 'none',
                    transform: isUltimo ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    {/* Posição */}
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: isUltimo ? 'rgba(255,255,255,.65)' : '#bbb',
                      minWidth: 16, textAlign: 'right',
                    }}>{ordemReal}º</span>

                    {/* Letra da coluna */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 5,
                      background: isUltimo ? 'rgba(255,255,255,.25)' : bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                        fontSize: 11, color: '#fff', fontWeight: 900,
                      }}>{col}</span>
                    </div>

                    {/* Número */}
                    <span style={{
                      fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                      fontSize: 20, fontWeight: 900,
                      color: isUltimo ? '#fff' : '#0D1F3C',
                      lineHeight: 1,
                      minWidth: 24, textAlign: 'center',
                    }}>{n}</span>

                    {isUltimo && (
                      <span style={{
                        fontSize: 8, fontWeight: 900,
                        color: 'rgba(255,255,255,.8)',
                        background: 'rgba(255,255,255,.15)',
                        padding: '1px 5px', borderRadius: 6,
                        textTransform: 'uppercase', letterSpacing: 1,
                      }}>ÚLTIMO</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
