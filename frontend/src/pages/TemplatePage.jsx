import { useState, useEffect } from 'react'
import { Save, RefreshCw, Code2, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
<style>
:root {
  --blue:    #0D47C8;
  --blue2:   #1563e0;
  --green:   #0F9D58;
  --border:  #DCE5F5;
}
* { margin:0; padding:0; box-sizing:border-box; }
html, body {
  width:794px; height:1123px;
  background:#ECEFF3;
  font-family:Arial,Helvetica,sans-serif;
  overflow:hidden;
}
body { padding:14px; }

.ticket {
  width:766px; height:1095px;
  background:#fff;
  border-radius:18px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex;
  flex-direction:column;
}

/* ── HEADER LINHA 1 ── */
.header-top {
  background:var(--blue);
  color:#fff;
  padding:16px 22px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-shrink:0;
  gap:20px;
}
.header-brand h1 {
  font-size:68px;
  font-weight:900;
  line-height:.9;
  letter-spacing:4px;
}
.header-brand .premio-name {
  display:block;
  font-size:22px;
  font-weight:700;
  margin-top:8px;
  opacity:.95;
  line-height:1.2;
}
.header-right {
  display:flex;
  align-items:center;
  gap:0;
  flex-shrink:0;
  border-left:1px solid rgba(255,255,255,.25);
  padding-left:20px;
}
.header-info-block {
  display:flex;
  flex-direction:column;
  gap:4px;
  padding:0 20px;
}
.header-info-block:first-child { padding-left:0; }
.info-micro {
  font-size:9px;
  font-weight:700;
  letter-spacing:1.5px;
  color:rgba(255,255,255,.55);
  text-transform:uppercase;
}
.info-val {
  font-size:16px;
  font-weight:700;
  color:#fff;
  display:flex;
  align-items:center;
  gap:7px;
  white-space:nowrap;
}
.info-val i { opacity:.75; font-size:15px; }
.num-val {
  font-size:28px;
  font-weight:900;
  letter-spacing:3px;
  line-height:1;
}
.num-val i { font-size:22px; }
.sep-v {
  width:1px;
  height:36px;
  background:rgba(255,255,255,.25);
  flex-shrink:0;
}

/* ── HEADER LINHA 2 ── */
.header-bar {
  background:var(--blue2);
  display:flex;
  align-items:stretch;
  border-top:1px solid rgba(255,255,255,.15);
  flex-shrink:0;
}
.bar-item {
  flex:1;
  min-width:0;
  padding:10px 14px;
  border-right:1px solid rgba(255,255,255,.15);
  display:flex;
  align-items:center;
  gap:10px;
}
.bar-item:last-child { border-right:none; }
.bar-local { flex:2; }
.bar-item i {
  font-size:17px;
  color:rgba(255,255,255,.7);
  flex-shrink:0;
}
.bar-item small {
  display:block;
  font-size:8px;
  font-weight:700;
  letter-spacing:1.5px;
  color:rgba(255,255,255,.55);
  text-transform:uppercase;
  margin-bottom:3px;
}
.bar-item strong {
  display:block;
  font-size:13px;
  font-weight:700;
  color:#fff;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.bar-valor {
  background:rgba(0,0,0,.15);
}
.bar-valor i { color:#7DFFB3; }
.valor-text {
  font-size:15px !important;
  color:#7DFFB3 !important;
}

/* ── CORPO ── */
.body-section {
  display:flex;
  flex:1;
  min-height:0;
  overflow:hidden;
  border-top:1px solid var(--border);
}

/* 3 fotos empilhadas */
.prize-col {
  width:220px;
  flex-shrink:0;
  display:grid;
  grid-template-rows:1fr 1fr 1fr;
  border-right:1px solid var(--border);
  overflow:hidden;
}
.prize-img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  border-bottom:1px solid var(--border);
  min-height:0;
}
.prize-img:last-child { border-bottom:none; }
.img-placeholder {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#F5F7FB;
  color:#C0C8D8;
  border-bottom:1px solid var(--border);
  min-height:0;
}
.img-placeholder:last-child { border-bottom:none; }
.img-placeholder i { font-size:30px; }

/* Grade BINGO */
.bingo-col {
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
  overflow:hidden;
}
.bingo-header {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex-shrink:0;
}
.bingo-header div {
  background:var(--blue);
  color:#fff;
  height:52px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:34px;
  font-weight:900;
}
.bingo-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  grid-template-rows:repeat(5,1fr);
  flex:1;
  min-height:0;
  overflow:hidden;
}
.cell {
  border:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:38px;
  font-weight:900;
  color:#1a1a2e;
}
.cell.free {
  flex-direction:column;
  color:var(--blue);
  gap:3px;
}
.cell.free i { font-size:26px; }
.cell.free span { font-size:12px; font-weight:800; letter-spacing:1px; }

/* ── CANHOTO ── */
.stub {
  padding:0 16px 14px;
  flex-shrink:0;
}
.stub-title {
  text-align:center;
  color:var(--blue);
  font-size:12px;
  font-weight:800;
  letter-spacing:2px;
  border-top:2px dashed var(--blue);
  padding-top:8px;
  margin-bottom:10px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:12px;
  display:grid;
  grid-template-columns:150px 1fr 160px;
  overflow:hidden;
}
.stub-content > div, .stub-payment { padding:15px 18px; }
.stub-num { border-right:1px dashed #CBD5E1; }
.stub-num small {
  display:block;
  font-size:9px;
  font-weight:700;
  letter-spacing:2px;
  color:var(--blue);
  margin-bottom:6px;
}
.stub-num strong {
  font-size:40px;
  font-weight:900;
  color:var(--blue);
}
.stub-fields {
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:16px;
  border-right:1px dashed #CBD5E1;
}
.stub-field {
  display:flex;
  align-items:center;
  gap:7px;
  font-size:13px;
  font-weight:600;
  color:#333;
}
.stub-field i { color:var(--blue); font-size:13px; }
.stub-line {
  flex:1;
  border-bottom:1.5px solid #999;
  display:inline-block;
  margin-left:4px;
}
.stub-payment {
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:12px;
}
.stub-payment label {
  display:flex;
  align-items:center;
  gap:8px;
  font-size:11px;
  font-weight:900;
  letter-spacing:1.5px;
  color:#333;
  cursor:default;
}
.chk {
  display:inline-block;
  width:14px;
  height:14px;
  border:2px solid #1a1a2e;
  border-radius:3px;
  flex-shrink:0;
}
</style>
</head>
<body>
<div class="ticket">

  <!-- ══ HEADER LINHA 1: BINGO + nome + contato + nº ══ -->
  <header class="header-top">
    <div class="header-brand">
      <h1>BINGO</h1>
      <span class="premio-name">{{PREMIO}}</span>
    </div>
    <div class="header-right">
      <div class="header-info-block">
        <span class="info-micro">CONTATO</span>
        <div class="info-val"><i class="fa-solid fa-phone"></i> {{CONTATO}}</div>
      </div>
      <div class="sep-v"></div>
      <div class="header-info-block">
        <span class="info-micro">CARTELA Nº</span>
        <div class="info-val num-val"><i class="fa-solid fa-ticket"></i> 0001</div>
      </div>
    </div>
  </header>

  <!-- ══ HEADER LINHA 2: LOCAL · DATA · HORÁRIO · VALOR ══ -->
  <div class="header-bar">
    <div class="bar-item bar-local">
      <i class="fa-solid fa-location-dot"></i>
      <div><small>LOCAL</small><strong>{{LOCAL}}</strong></div>
    </div>
    <div class="bar-item">
      <i class="fa-solid fa-calendar"></i>
      <div><small>DATA</small><strong>__/__/____</strong></div>
    </div>
    <div class="bar-item">
      <i class="fa-solid fa-clock"></i>
      <div><small>HORÁRIO</small><strong>{{HORARIO}}</strong></div>
    </div>
    <div class="bar-item bar-valor">
      <i class="fa-solid fa-tag"></i>
      <div><small>VALOR DA CARTELA</small><strong class="valor-text">{{VALOR}}</strong></div>
    </div>
  </div>

  <!-- ══ CORPO: 3 FOTOS + GRADE ══ -->
  <section class="body-section">

    <div class="prize-col">
      {{IMAGEM_PREMIO}}
      <div class="prize-img img-placeholder"><i class="fa-solid fa-image"></i></div>
    </div>

    <div class="bingo-col">
      <div class="bingo-header">
        <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
      </div>
      <div class="bingo-grid">
        {{TABELA}}
      </div><div class="cell">16</div><div class="cell">32</div><div class="cell">48</div><div class="cell">62</div><div class="cell">4</div><div class="cell">21</div><div class="cell">34</div><div class="cell">50</div><div class="cell">72</div><div class="cell">6</div><div class="cell">23</div><div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div><div class="cell">57</div><div class="cell">73</div><div class="cell">10</div><div class="cell">24</div><div class="cell">39</div><div class="cell">58</div><div class="cell">74</div><div class="cell">12</div><div class="cell">28</div><div class="cell">43</div><div class="cell">60</div><div class="cell">75</div>
      </div>
    </div>

  </section>

  <!-- ══ CANHOTO ══ -->
  <section class="stub">
    <div class="stub-title">✂ CANHOTO</div>
    <div class="stub-content">

      <div class="stub-num">
        <small>Nº DA CARTELA</small>
        <strong>{{NUMERO}}</strong>
      </div>

      <div class="stub-fields">
        <div class="stub-field">
          <i class="fa-solid fa-user"></i>
          <span>Nome:</span>
          <span class="stub-line"></span>
        </div>
        <div class="stub-field">
          <i class="fa-solid fa-phone"></i>
          <span>Telefone:</span>
          <span class="stub-line"></span>
        </div>
      </div>

      <div class="stub-payment">
        <label><span class="chk"></span> PAGO</label>
        <label><span class="chk"></span> NÃO PAGO</label>
      </div>

    </div>
  </section>

</div>
</body>
</html>`

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
