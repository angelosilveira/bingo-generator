import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogIn } from 'lucide-react'

const TOTAL_NUMEROS = 75

function gerarTodos() {
  return Array.from({ length: TOTAL_NUMEROS }, (_, i) => i + 1)
}

const COLS = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
}

function getColuna(n) {
  for (const [col, [min, max]] of Object.entries(COLS)) {
    if (n >= min && n <= max) return col
  }
  return ''
}

function getCorColuna(col) {
  return col === 'I' || col === 'G' ? '#E8A000' : '#0D1F3C'
}

export default function ConferenciaPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sorteados, setSorteados] = useState([])       // ordem cronológica
  const [inputVal, setInputVal] = useState('')
  const [erro, setErro] = useState('')
  const [animando, setAnimando] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Foco automático no input
    inputRef.current?.focus()
  }, [])

  const sortear = (val) => {
    const n = parseInt(val, 10)
    if (!n || n < 1 || n > 75) {
      setErro('Número deve ser entre 1 e 75')
      return
    }
    if (sorteados.includes(n)) {
      setErro(`Número ${n} já foi sorteado!`)
      return
    }
    setErro('')
    setSorteados(prev => [...prev, n])
    setAnimando(n)
    setTimeout(() => setAnimando(null), 800)
    setInputVal('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sortear(inputVal)
  }

  const removerUltimo = () => {
    setSorteados(prev => prev.slice(0, -1))
    setErro('')
    inputRef.current?.focus()
  }

  const resetar = () => {
    if (sorteados.length > 0 && !confirm('Zerar todos os números sorteados?')) return
    setSorteados([])
    setErro('')
    inputRef.current?.focus()
  }

  const faltam = TOTAL_NUMEROS - sorteados.length

  // Ordem reversa para exibição (último sorteado primeiro)
  const sorteadosReverso = [...sorteados].reverse()

  return (
    <div className="min-h-screen bg-[#F2F5FA] flex flex-col">

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg,#0D1F3C 0%,#182E50 60%,#0D1F3C 100%)' }}
        className="px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎱</span>
          <div>
            <h1 style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", letterSpacing: 4, color: '#E8A000', fontSize: 28, lineHeight: 1 }}>
              BINGO
            </h1>
            <p className="text-blue-300 text-xs mt-0.5 font-semibold tracking-wide uppercase">
              Tabela de Conferência
            </p>
          </div>
        </div>
        <button onClick={() => navigate(user ? '/admin' : '/login')}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-white/20">
          <LogIn size={15} />
          {user ? 'Admin' : 'Entrar'}
        </button>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">

        {/* Painel de controle */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-wrap items-end gap-4">

            {/* Input de número */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Número sorteado
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="number" min="1" max="75"
                  value={inputVal}
                  onChange={e => { setInputVal(e.target.value); setErro('') }}
                  onKeyDown={handleKey}
                  placeholder="Ex: 42"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-2xl font-black text-center focus:outline-none focus:border-[#0D1F3C] transition-colors"
                  style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", color: '#0D1F3C' }}
                />
                <button onClick={() => sortear(inputVal)}
                  className="px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors"
                  style={{ background: '#E8A000' }}>
                  SORTEAR
                </button>
              </div>
              {erro && <p className="text-red-500 text-xs mt-1.5 font-medium">{erro}</p>}
            </div>

            {/* Contadores */}
            <div className="flex gap-3">
              <div className="text-center bg-[#0D1F3C] rounded-xl px-5 py-3 min-w-24">
                <div style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", fontSize: 36, color: '#E8A000', lineHeight: 1 }}>
                  {sorteados.length}
                </div>
                <div className="text-blue-300 text-xs font-semibold tracking-wide mt-1">SORTEADOS</div>
              </div>
              <div className="text-center bg-gray-100 rounded-xl px-5 py-3 min-w-24">
                <div style={{ fontFamily: "Impact,'Arial Black',Arial,sans-serif", fontSize: 36, color: '#0D1F3C', lineHeight: 1 }}>
                  {faltam}
                </div>
                <div className="text-gray-500 text-xs font-semibold tracking-wide mt-1">FALTAM</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <button onClick={removerUltimo} disabled={sorteados.length === 0}
                className="px-4 py-3 border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30">
                ↩ Desfazer
              </button>
              <button onClick={resetar}
                className="px-4 py-3 border-2 border-gray-200 text-gray-600 hover:border-gray-400 rounded-xl text-sm font-semibold transition-colors">
                Zerar
              </button>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Grade 75 números */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              Todos os números
            </h2>

            {/* Cabeçalho BINGO */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {Object.entries(COLS).map(([col, _]) => (
                <div key={col} className="text-center py-2 rounded-lg font-black text-white text-xl"
                  style={{ background: getCorColuna(col), fontFamily: "Impact,'Arial Black',Arial,sans-serif", letterSpacing: 3 }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Grade 15 linhas × 5 colunas */}
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 15 }, (_, row) =>
                Object.entries(COLS).map(([col, [min]]) => {
                  const n = min + row
                  const isSorteado = sorteados.includes(n)
                  const isAnimando = animando === n
                  const ordem = isSorteado ? sorteados.indexOf(n) + 1 : null

                  return (
                    <div key={n}
                      onClick={() => {
                        if (isSorteado) {
                          if (confirm(`Remover o número ${n}?`)) {
                            setSorteados(prev => prev.filter(x => x !== n))
                          }
                        } else {
                          sortear(String(n))
                        }
                      }}
                      className="relative aspect-square flex items-center justify-center rounded-lg cursor-pointer select-none transition-all duration-300"
                      style={{
                        background: isSorteado ? getCorColuna(col) : '#F8FAFF',
                        border: isSorteado ? 'none' : '2px solid #E2E8F2',
                        transform: isAnimando ? 'scale(1.2)' : 'scale(1)',
                        boxShadow: isAnimando ? '0 0 0 4px rgba(232,160,0,.4)' : 'none',
                      }}>
                      <span style={{
                        fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                        fontSize: 18,
                        fontWeight: 900,
                        color: isSorteado ? '#fff' : '#0D1F3C',
                        lineHeight: 1,
                      }}>{n}</span>
                      {isSorteado && (
                        <span style={{
                          position: 'absolute', bottom: 2, right: 4,
                          fontSize: 8, color: 'rgba(255,255,255,.7)',
                          fontWeight: 700, lineHeight: 1,
                        }}>{ordem}º</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Histórico de sorteio */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
              Ordem de sorteio
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold normal-case">
                último → primeiro
              </span>
            </h2>

            {sorteadosReverso.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm text-center">
                Nenhum número sorteado ainda.<br />Digite um número e pressione Enter.
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 520 }}>
                {sorteadosReverso.map((n, i) => {
                  const col = getColuna(n)
                  const ordemReal = sorteados.length - i
                  const isUltimo = i === 0

                  return (
                    <div key={n}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: isUltimo ? getCorColuna(col) : '#F8FAFF',
                        border: isUltimo ? 'none' : '1.5px solid #E2E8F2',
                      }}>

                      {/* Posição */}
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: isUltimo ? 'rgba(255,255,255,.7)' : '#aaa',
                        minWidth: 24, textAlign: 'right',
                      }}>{ordemReal}º</span>

                      {/* Coluna badge */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isUltimo ? 'rgba(255,255,255,.25)' : getCorColuna(col),
                        }}>
                        <span style={{
                          fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                          fontSize: 13, fontWeight: 900,
                          color: '#fff',
                        }}>{col}</span>
                      </div>

                      {/* Número */}
                      <span style={{
                        fontFamily: "Impact,'Arial Black',Arial,sans-serif",
                        fontSize: 24, fontWeight: 900,
                        color: isUltimo ? '#fff' : '#0D1F3C',
                        flex: 1,
                      }}>{n}</span>

                      {isUltimo && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                          ÚLTIMO
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
