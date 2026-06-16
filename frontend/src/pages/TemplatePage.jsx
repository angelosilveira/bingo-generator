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
  --blue:   #0D47C8;
  --green:  #0F9D58;
  --border: #DCE5F5;
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
  border-radius:20px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex; flex-direction:column;
}

/* ── HEADER ── */
.header {
  background:var(--blue);
  color:#fff;
  padding:20px 28px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-shrink:0;
}
.header-left h1 {
  font-size:76px; font-weight:900; line-height:.9;
}
.header-left .premio-sub {
  display:block;
  font-size:22px; font-weight:700;
  margin-top:10px; opacity:.92;
}
.header-right {
  display:flex; align-items:center; gap:20px;
  border-left:1px solid rgba(255,255,255,.3);
  padding-left:22px;
}
.info-col {
  display:flex; flex-direction:column; gap:10px;
}
.info-row {
  display:flex; align-items:center; gap:12px;
}
.info-row i { font-size:18px; opacity:.85; flex-shrink:0; width:20px; text-align:center; }
.info-row small {
  display:block; font-size:9px; font-weight:700;
  letter-spacing:1.5px; opacity:.75; text-transform:uppercase;
}
.info-row strong {
  display:block; font-size:17px; font-weight:800; line-height:1.1;
}
.info-row strong.valor-header {
  font-size:22px; color:#7DFFB3;
}
.num-block {
  display:flex; align-items:center; gap:14px;
  border-left:1px solid rgba(255,255,255,.3);
  padding-left:20px; flex-shrink:0;
}
.num-block i { font-size:32px; opacity:.85; }
.num-block small {
  display:block; font-size:10px; font-weight:700;
  letter-spacing:1.5px; opacity:.75;
}
.num-block strong {
  display:block; font-size:42px; font-weight:900; line-height:1;
}

/* ── MAIN ── */
.main-section {
  display:flex; gap:14px;
  padding:14px 16px;
  flex:1; min-height:0;
}

/* 3 fotos empilhadas */
.prize-col {
  width:230px; flex-shrink:0;
  display:flex; flex-direction:column; gap:8px;
}
.prize-img {
  flex:1;
  width:100%;
  border-radius:10px;
  border:1px solid var(--border);
  object-fit:cover;
  min-height:0;
  display:block;
}
.img-placeholder {
  display:flex; align-items:center; justify-content:center;
  background:#F5F7FB; color:#C0C8D8;
}
.img-placeholder i { font-size:32px; }

/* ── BINGO ── */
.bingo-section {
  flex:1; display:flex; flex-direction:column; min-width:0;
}
.bingo-header {
  display:grid; grid-template-columns:repeat(5,1fr);
  flex-shrink:0;
}
.bingo-header div {
  background:var(--blue); color:#fff;
  height:56px;
  display:flex; align-items:center; justify-content:center;
  font-size:38px; font-weight:900;
}
.bingo-header div:first-child { border-radius:10px 0 0 0; }
.bingo-header div:last-child  { border-radius:0 10px 0 0; }

.bingo-grid {
  display:grid; grid-template-columns:repeat(5,1fr);
  flex:1;
}
.cell {
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:44px; font-weight:900; color:#1a1a2e;
}
.cell.free {
  flex-direction:column; color:var(--blue); gap:4px;
}
.cell.free i { font-size:30px; }
.cell.free span { font-size:13px; font-weight:800; letter-spacing:1px; }

/* ── CANHOTO ── */
.stub { padding:0 16px 14px; flex-shrink:0; }
.stub-title {
  text-align:center; color:var(--blue);
  font-size:13px; font-weight:800; letter-spacing:2px;
  border-top:2px dashed var(--blue);
  padding-top:8px; margin-bottom:10px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:14px;
  display:grid;
  grid-template-columns:150px 1fr 160px;
}
.stub-content > div { padding:16px 20px; }
.stub-content > div:not(:last-child) { border-right:1px dashed #CBD5E1; }

.stub-number small {
  display:block; font-size:9px; font-weight:700;
  letter-spacing:2px; color:var(--blue); margin-bottom:6px;
}
.stub-number strong {
  font-size:44px; font-weight:900; color:var(--blue);
}
.stub-form {
  display:flex; flex-direction:column;
  justify-content:center; gap:20px;
  font-size:14px; font-weight:600; color:#333;
}
.stub-form i { color:var(--blue); margin-right:7px; }
.line {
  display:inline-block;
  border-bottom:1.5px solid #999;
  width:58%; margin-left:6px;
  vertical-align:bottom;
}
.stub-right {
  display:flex; flex-direction:column;
  justify-content:center; gap:10px;
}
.stub-payment {
  display:flex; flex-direction:column; gap:12px;
}
.stub-payment label {
  display:flex; align-items:center; gap:8px;
  font-size:12px; font-weight:900;
  letter-spacing:1.5px; color:#333; cursor:default;
}
.chk {
  display:inline-block; width:15px; height:15px;
  border:2px solid #1a1a2e; border-radius:3px; flex-shrink:0;
}
</style>
</head>
<body>
<div class="ticket">

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <h1>BINGO</h1>
      <span class="premio-sub">{{PREMIO}}</span>
    </div>
    <div class="header-right">
      <div class="info-col">
        <div class="info-row">
          <i class="fa-solid fa-location-dot"></i>
          <div><small>LOCAL</small><strong>{{LOCAL}}</strong></div>
        </div>
        <div class="info-row">
          <i class="fa-solid fa-calendar"></i>
          <div><small>DATA</small><strong>__/__/____</strong></div>
        </div>
        <div class="info-row">
          <i class="fa-solid fa-clock"></i>
          <div><small>HORÁRIO</small><strong>{{HORARIO}}</strong></div>
        </div>
        <div class="info-row">
          <i class="fa-solid fa-tag"></i>
          <div><small>VALOR DA CARTELA</small><strong class="valor-header">{{VALOR}}</strong></div>
        </div>
      </div>
      <div class="num-block">
        <i class="fa-solid fa-ticket"></i>
        <div>
          <small>CARTELA Nº</small>
          <strong>{{NUMERO}}</strong>
        </div>
      </div>
    </div>
  </header>

  <!-- IMAGENS + TABELA -->
  <section class="main-section">

    <!-- 3 fotos do prêmio empilhadas -->
    <div class="prize-col">
      {{IMAGEM_PREMIO}}</div>

    <!-- Grade BINGO -->
    <div class="bingo-section">
      <div class="bingo-header">
        <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
      </div>
      <div class="bingo-grid">
        {{TABELA}}
      </div><div class="cell">16</div><div class="cell">36</div><div class="cell">46</div><div class="cell">65</div><div class="cell">3</div><div class="cell">19</div><div class="cell">37</div><div class="cell">49</div><div class="cell">69</div><div class="cell">10</div><div class="cell">20</div><div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div><div class="cell">52</div><div class="cell">70</div><div class="cell">11</div><div class="cell">26</div><div class="cell">41</div><div class="cell">54</div><div class="cell">73</div><div class="cell">12</div><div class="cell">29</div><div class="cell">44</div><div class="cell">57</div><div class="cell">75</div>
      </div>
    </div>

  </section>

  <!-- CANHOTO -->
  <section class="stub">
    <div class="stub-title">✂ CANHOTO</div>
    <div class="stub-content">

      <div class="stub-number">
        <small>Nº DA CARTELA</small>
        <strong>{{NUMERO}}</strong>
      </div>

      <div class="stub-form">
        <div><i class="fa-solid fa-user"></i> Nome: <span class="line"></span></div>
        <div><i class="fa-solid fa-phone"></i> Telefone: <span class="line"></span></div>
      </div>

      <div class="stub-right">
        <div class="stub-payment">
          <label><span class="chk"></span> PAGO</label>
          <label><span class="chk"></span> NÃO PAGO</label>
        </div>
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
