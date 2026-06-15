import { useState, useEffect } from 'react'
import { Save, RefreshCw, Code2, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>

  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:794px; height:1123px; background:#0a0a0a; font-family:'Arial',sans-serif; overflow:hidden; }
  body { padding:18px; }

  .card {
    width:100%; height:100%;
    background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
    border: 1.5px solid #C9A227;
    border-radius: 16px;
    display:flex; flex-direction:column;
    overflow:hidden;
    position:relative;
  }

  .icon { width:18px; height:18px; color:#C9A227; flex-shrink:0; }
  .stub-icon { width:15px; height:15px; color:#C9A227; flex-shrink:0; }
  .gift-icon { width:26px; height:26px; color:#0d0d0d; }
  .gift-icon-lg { width:48px; height:48px; color:#C9A227; opacity:.5; }

  /* ══ MAIN ══ */
  .main { flex:1; display:flex; gap:18px; padding:22px 22px 14px; min-height:0; }

  .left {
    width: 300px; flex-shrink:0;
    display:flex; flex-direction:column; gap:10px;
  }

  .num-tag {
    display:flex; align-items:center; gap:10px;
    background: rgba(201,162,39,.08);
    border:1px solid rgba(201,162,39,.35);
    border-radius:10px; padding:10px 14px;
  }
  .num-label { font-size:9px; font-weight:900; color:#C9A227; letter-spacing:2px; }
  .num-value { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:26px; color:#fff; letter-spacing:2px; line-height:1.1; }

  .prize-label {
    display:inline-block;
    background: linear-gradient(90deg,#C9A227,#E8C158);
    color:#0d0d0d;
    font-size:10px; font-weight:900; letter-spacing:3px;
    padding:5px 14px; border-radius:6px;
    width:fit-content;
    margin-top:4px;
  }
  .prize-name {
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:21px; color:#fff; line-height:1.2;
    word-break:break-word;
  }

  .prize-photo {
    width:100%; height:175px; object-fit:cover;
    border-radius:10px; border:1.5px solid rgba(201,162,39,.4);
    margin-top:2px;
  }
  .prize-photo-empty {
    display:flex; align-items:center; justify-content:center;
    background:rgba(255,255,255,.03);
    border:1.5px dashed rgba(201,162,39,.3);
  }

  .prize-value {
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:34px;
    background: linear-gradient(90deg,#E8C158,#C9A227);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    letter-spacing:1px; line-height:1; margin-top:auto;
  }
  .prize-value-sub {
    font-size:9px; font-weight:900; color:#888; letter-spacing:3px; margin-top:2px;
  }

  /* ══ RIGHT / BINGO TABLE ══ */
  .right { flex:1; display:flex; flex-direction:column; min-width:0; }

  .bingo-title {
    display:flex; align-items:center; justify-content:center; gap:18px;
    margin-bottom:14px;
  }
  .bingo-text {
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:54px; letter-spacing:14px;
    background: linear-gradient(180deg,#F5DA8C,#C9A227);
    -webkit-background-clip:text; background-clip:text; color:transparent;
  }
  .dot { width:8px; height:8px; border-radius:50%; background:#C9A227; flex-shrink:0; }

  .grid { flex:1; width:100%; border-collapse:collapse; }
  .grid tr { height:20%; }
  .cell {
    border:1px solid rgba(201,162,39,.45);
    text-align:center; vertical-align:middle;
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:32px; color:#1a1a1a;
    background: #FAF6EC;
  }
  .cell-free {
    background: #F0E4C0;
    position:relative;
  }
  .cell-free .gift-icon { color:#0d0d0d; }

  /* ══ INFO BAR ══ */
  .infobar {
    display:flex; gap:0;
    border-top:1px solid rgba(201,162,39,.25);
    padding:12px 22px;
  }
  .info-item {
    flex:1; display:flex; align-items:center; gap:10px;
    padding-right:16px;
  }
  .info-label { font-size:9px; font-weight:900; color:#C9A227; letter-spacing:2px; margin-bottom:2px; }
  .info-value { font-size:13px; font-weight:700; color:#fff; line-height:1.3; }

  /* ══ SCISSORS ══ */
  .scissors-line {
    display:flex; align-items:center; gap:10px;
    padding:0 22px; margin:4px 0;
  }
  .scissors { width:18px; height:18px; color:#C9A227; flex-shrink:0; transform:rotate(90deg); }
  .dash-line { flex:1; border-top:1.5px dashed rgba(201,162,39,.35); }

  /* ══ STUB / CANHOTO ══ */
  .stub {
    display:flex; align-items:stretch;
    border:1px solid rgba(201,162,39,.35);
    border-radius:10px;
    margin:6px 22px 18px;
    overflow:hidden;
    background: rgba(255,255,255,.015);
  }
  .stub-tag {
    background: linear-gradient(180deg,#E8C158,#C9A227);
    color:#0d0d0d;
    font-size:10px; font-weight:900; letter-spacing:3px;
    writing-mode:vertical-rl; transform:rotate(180deg);
    display:flex; align-items:center; justify-content:center;
    padding:10px 8px; flex-shrink:0;
  }
  .stub-content {
    flex:1; display:flex; align-items:center; gap:18px;
    padding:12px 18px;
  }
  .stub-num { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .stub-num-label { font-size:8px; font-weight:900; color:#C9A227; letter-spacing:2px; }
  .stub-num-value { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:18px; color:#fff; }

  .stub-fields { flex:1.4; display:flex; flex-direction:column; gap:7px; }
  .stub-field { display:flex; align-items:center; gap:6px; }
  .stub-field-label { font-size:9px; font-weight:900; color:#999; letter-spacing:1.5px; flex-shrink:0; width:62px; }
  .stub-field-line { flex:1; border-bottom:1px solid rgba(201,162,39,.4); height:1px; }

  .stub-payment { display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
  .payment-box { display:flex; align-items:center; gap:6px; }
  .checkbox { width:13px; height:13px; border:1.5px solid #C9A227; border-radius:3px; flex-shrink:0; }
  .payment-box span { font-size:9px; font-weight:900; color:#ccc; letter-spacing:1.5px; }

  .stub-meta { flex-shrink:0; text-align:right; min-width:90px; }
  .stub-meta div:first-child { font-size:10px; color:#999; font-weight:700; max-width:90px; word-break:break-word; line-height:1.2; }
  .stub-meta-value {
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:18px;
    background: linear-gradient(90deg,#E8C158,#C9A227);
    -webkit-background-clip:text; background-clip:text; color:transparent;
    margin-top:2px;
  }

</style>
</head>
<body>
<div class="card">

  <!-- ══ PARTE PRINCIPAL ══ -->
  <div class="main">

    <!-- Coluna esquerda -->
    <div class="left">
      <div class="num-tag">
        <svg viewBox="0 0 24 24" fill="none" class="icon"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 7v10" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2 2"/></svg>
        <div>
          <div class="num-label">CARTELA Nº</div>
          <div class="num-value">{{NUMERO}}</div>
        </div>
      </div>

      <div class="prize-label">PRÊMIO</div>
      <div class="prize-name">{{PREMIO}}</div>

      {{IMAGEM_PREMIO}}

      <div class="prize-value">{{VALOR}}</div>
      <div class="prize-value-sub">VALOR DA CARTELA</div>
    </div>

    <!-- Coluna direita -->
    <div class="right">
      <div class="bingo-title">
        <span class="dot"></span>
        <span class="bingo-text">B I N G O</span>
        <span class="dot"></span>
      </div>

      <table class="grid">
        <tbody>{{TABELA}}</tbody>
      </table>
    </div>
  </div>

  <!-- ══ FAIXA INFO ══ -->
  <div class="infobar">
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" class="icon"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
      <div>
        <div class="info-label">LOCAL</div>
        <div class="info-value">{{LOCAL}}</div>
      </div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" class="icon"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <div>
        <div class="info-label">DATA</div>
        <div class="info-value">{{DATA}}</div>
      </div>
    </div>
    <div class="info-item">
      <svg viewBox="0 0 24 24" fill="none" class="icon"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div>
        <div class="info-label">HORÁRIO</div>
        <div class="info-value">{{HORARIO}}</div>
      </div>
    </div>
  </div>

  <!-- ══ TESOURA ══ -->
  <div class="scissors-line">
    <svg viewBox="0 0 24 24" fill="none" class="scissors"><circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8.5 19 19M8.5 15.5 19 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    <div class="dash-line"></div>
  </div>

  <!-- ══ CANHOTO ══ -->
  <div class="stub">
    <div class="stub-tag">CANHOTO</div>

    <div class="stub-content">
      <div class="stub-num">
        <svg viewBox="0 0 24 24" fill="none" class="icon"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 7v10" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2 2"/></svg>
        <div>
          <div class="stub-num-label">Nº</div>
          <div class="stub-num-value">{{NUMERO}}</div>
        </div>
      </div>

      <div class="stub-fields">
        <div class="stub-field">
          <svg viewBox="0 0 24 24" fill="none" class="stub-icon"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <span class="stub-field-label">NOME</span>
          <div class="stub-field-line"></div>
        </div>
        <div class="stub-field">
          <svg viewBox="0 0 24 24" fill="none" class="stub-icon"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          <span class="stub-field-label">TELEFONE</span>
          <div class="stub-field-line"></div>
        </div>
        <div class="stub-field">
          <svg viewBox="0 0 24 24" fill="none" class="stub-icon"><path d="M3 11 12 3l9 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          <span class="stub-field-label">ENDEREÇO</span>
          <div class="stub-field-line"></div>
        </div>
      </div>

      <div class="stub-payment">
        <div class="payment-box">
          <div class="checkbox"></div>
          <span>PAGO</span>
        </div>
        <div class="payment-box">
          <div class="checkbox"></div>
          <span>NÃO PAGO</span>
        </div>
      </div>

      <div class="stub-meta">
        <div>{{PREMIO}}</div>
        <div class="stub-meta-value">{{VALOR}}</div>
      </div>
    </div>
  </div>

</div>
</body>
</html>
`

export default function TemplatePage() {
  const [html, setHtml] = useState(DEFAULT_TEMPLATE)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewing, setPreviewing] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const [tab, setTab] = useState('editor')

  useEffect(() => {
    fetch(`${API_URL}/api/template`)
      .then(r => r.json())
      .then(d => { if (d.html) setHtml(d.html) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadPreview = async (templateHtml) => {
    setPreviewing(true)
    setPreviewHtml('')
    try {
      const res = await fetch(`${API_URL}/api/template/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: templateHtml }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setPreviewHtml(await res.text())
    } catch {
      toast.error('Erro ao gerar preview.')
    } finally {
      setPreviewing(false)
    }
  }

  useEffect(() => {
    if (tab === 'preview') loadPreview(html)
  }, [tab])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      toast.success('Template salvo!')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Erro ao salvar. Verifique se o backend está online.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Restaurar o template padrão? O template salvo será apagado.')) return
    try {
      await fetch(`${API_URL}/api/template`, { method: 'DELETE' })
    } catch {}
    setHtml(DEFAULT_TEMPLATE)
    toast.success('Template restaurado.')
    if (tab === 'preview') loadPreview(DEFAULT_TEMPLATE)
  }

  const copyVar = (v) =>
    navigator.clipboard.writeText(v).then(() => toast.success(`${v} copiado!`))

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">

        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-[#0D1F3C]" /> Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edite o HTML/CSS. Use <code className="bg-gray-100 px-1 rounded text-xs">{'{{IMAGEM_PREMIO}}'}</code> para a foto do prêmio.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Restaurar padrão
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6 flex gap-1 items-center">
          {[
            { key: 'editor', label: '📝 Editor HTML/CSS' },
            { key: 'preview', label: '👁 Preview A4' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'border-[#0D1F3C] text-[#0D1F3C]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button onClick={() => loadPreview(html)} disabled={previewing}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D1F3C] py-2 transition-colors disabled:opacity-50">
              <RefreshCw size={12} className={previewing ? 'animate-spin' : ''} />
              {previewing ? 'Carregando…' : 'Novos números'}
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Carregando…</div>
          ) : tab === 'editor' ? (
            <textarea value={html} onChange={e => setHtml(e.target.value)} spellCheck={false}
              className="w-full h-full resize-none font-mono text-sm p-5 bg-gray-950 text-green-400 focus:outline-none"
              style={{ minHeight: 'calc(100vh - 160px)' }} />
          ) : (
            <div className="flex items-start justify-center bg-gray-300 overflow-auto p-8"
              style={{ minHeight: 'calc(100vh - 160px)' }}>
              <div className="shadow-2xl relative" style={{ width: 794 }}>
                {previewing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded">
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw size={18} className="animate-spin" />
                      <span className="text-sm font-medium">Gerando preview…</span>
                    </div>
                  </div>
                )}
                {previewHtml && (
                  <iframe
                    key={previewHtml.length}
                    srcDoc={previewHtml}
                    title="Preview A4"
                    sandbox="allow-same-origin"
                    style={{ width: 794, height: 1123, border: 'none', display: 'block', background: '#0a0a0a' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {tab === 'editor' && (
          <div className="bg-gray-900 border-t border-gray-700 px-5 py-2.5 flex gap-3 flex-wrap items-center">
            <span className="text-xs text-gray-500 shrink-0">Variáveis:</span>
            {['{{NUMERO}}','{{PREMIO}}','{{DATA}}','{{HORARIO}}','{{LOCAL}}','{{VALOR}}','{{IMAGEM_PREMIO}}','{{TABELA}}'].map(v => (
              <code key={v} onClick={() => copyVar(v)}
                className="text-xs text-yellow-300 font-mono cursor-pointer hover:text-white hover:bg-yellow-700 px-1.5 py-0.5 rounded transition-colors select-none">
                {v}
              </code>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
