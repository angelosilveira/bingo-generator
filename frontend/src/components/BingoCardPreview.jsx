import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

export default function BingoCardPreview({ form, imagePreviews = [null, null, null] }) {
  const [srcdoc, setSrcdoc]   = useState('')
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const [scale, setScale]     = useState(1)
  const abortRef = useRef(null)

  // Escala responsiva
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      setScale(entries[0].contentRect.width / 794)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Debounced fetch — dispara 500ms após o usuário parar de digitar
  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      // Cancela request anterior se ainda estiver em andamento
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      fetch(`${API_URL}/api/template/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          premio:          form.premio      || '',
          data:            form.data        || '',
          horario:         form.horario     || '',
          local:           form.local       || '',
          valorCartela:    form.valorCartela|| '',
          contato:         form.contato     || '',
          premioImagens:   imagePreviews,
          premioImageBase64: imagePreviews[0] || null,
        }),
      })
        .then(r => r.text())
        .then(html => { setSrcdoc(html) })
        .catch(err => { if (err.name !== 'AbortError') console.error('Preview error:', err) })
        .finally(() => { setLoading(false) })
    }, 500)

    return () => clearTimeout(timer)
  }, [
    form.premio,
    form.data,
    form.horario,
    form.local,
    form.valorCartela,
    form.contato,
    imagePreviews[0],
    imagePreviews[1],
    imagePreviews[2],
  ])

  const handleRefresh = () => {
    // Força novo fetch com números novos
    setSrcdoc(s => s.trim() + ' ')
    setLoading(true)
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetch(`${API_URL}/api/template/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        premio:          form.premio      || '',
        data:            form.data        || '',
        horario:         form.horario     || '',
        local:           form.local       || '',
        valorCartela:    form.valorCartela|| '',
        contato:         form.contato     || '',
        premioImagens:   imagePreviews,
        premioImageBase64: imagePreviews[0] || null,
      }),
    })
      .then(r => r.text())
      .then(html => setSrcdoc(html))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          Preview da cartela
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#0D1F3C] hover:text-[#E8A000] font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Atualizando…' : 'Novo exemplo'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100"
        style={{ height: scale ? Math.round(1123 * scale) : 500 }}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <RefreshCw size={16} className="animate-spin" />
              <span>Carregando preview…</span>
            </div>
          </div>
        )}
        {srcdoc && (
          <iframe
            key={srcdoc.slice(100, 200)}
            srcDoc={srcdoc}
            title="Preview da cartela"
            sandbox="allow-same-origin"
            style={{
              width: 794, height: 1123, border: 'none', display: 'block',
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          />
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Números gerados aleatoriamente — apenas um exemplo visual.
      </p>
    </div>
  )
}
