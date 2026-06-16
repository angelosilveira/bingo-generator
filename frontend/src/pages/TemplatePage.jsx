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
  --primary: #0D47C8;
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
  margin:auto;
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex;
  flex-direction:column;
}

/* ── HEADER ── */
.header {
  background:var(--primary);
  color:#fff;
  height:140px;
  flex-shrink:0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:24px 30px;
}
.header-left h1 {
  font-size:76px;
  line-height:.9;
  font-weight:900;
}
.header-left span {
  display:block;
  margin-top:8px;
  font-size:22px;
  font-weight:700;
  opacity:.92;
}
.header-right {
  display:flex;
  align-items:center;
  gap:16px;
  border-left:1px solid rgba(255,255,255,.35);
  padding-left:24px;
}
.header-right i { font-size:44px; }
.header-right small { display:block; font-size:13px; font-weight:600; opacity:.8; }
.header-right strong { display:block; font-size:54px; font-weight:900; line-height:1; }

/* ── FOTO + SIDEBAR ── */
.prize-section {
  display:grid;
  grid-template-columns:1fr 220px;
  gap:14px;
  padding:14px;
  flex-shrink:0;
  height:320px;
}
.prize-image {
  border-radius:14px;
  overflow:hidden;
  border:1px solid var(--border);
  height:100%;
}
.prize-image img { width:100%; height:100%; object-fit:cover; }
.img-placeholder {
  width:100%; height:100%;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:10px; background:#F5F7FB; color:#A0AABB;
}
.img-placeholder i { font-size:36px; }
.img-placeholder span { font-size:10px; font-weight:700; letter-spacing:2px; }

.prize-card {
  border:1px solid var(--border);
  border-radius:14px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.card-block { padding:14px 16px; flex:1; }
.card-block h3 {
  display:flex; align-items:center; gap:8px;
  color:var(--primary);
  font-size:11px; font-weight:900;
  letter-spacing:1.5px; text-transform:uppercase;
  margin-bottom:6px;
}
.card-block h3 i { font-size:14px; }
.contact { font-size:16px; font-weight:700; color:#1a1a2e; line-height:1.3; }
.sub-info { font-size:14px; font-weight:600; color:#555; margin-top:3px; }
.price { font-size:26px; font-weight:900; color:var(--green); }
.divider { height:1px; background:var(--border); flex-shrink:0; }

/* ── BINGO ── */
.bingo-section {
  padding:0 14px 10px;
  flex:1;
  display:flex;
  flex-direction:column;
  min-height:0;
}
.bingo-header {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex-shrink:0;
}
.bingo-header div {
  background:var(--primary); color:#fff;
  height:52px;
  display:flex; align-items:center; justify-content:center;
  font-size:36px; font-weight:900;
}
.bingo-header div:first-child { border-radius:12px 0 0 0; }
.bingo-header div:last-child  { border-radius:0 12px 0 0; }

.bingo-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex:1;
}
.cell {
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:38px; font-weight:900; color:#1a1a2e;
}
.cell.free {
  flex-direction:column;
  color:var(--primary);
  gap:3px;
}
.cell.free i { font-size:26px; }
.cell.free span { font-size:12px; font-weight:800; letter-spacing:1px; }

/* ── CANHOTO ── */
.stub { padding:0 14px 14px; flex-shrink:0; }
.stub-title {
  text-align:center;
  color:var(--primary);
  font-size:13px; font-weight:800;
  letter-spacing:2px;
  border-top:2px dashed var(--primary);
  padding-top:8px;
  margin-bottom:10px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:14px;
  display:grid;
  grid-template-columns:150px 1fr 180px;
}
.stub-content > div { padding:16px 18px; }
.stub-content > div:not(:last-child) { border-right:1px dashed #CBD5E1; }

.stub-number small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--primary); margin-bottom:6px; }
.stub-number strong { font-size:42px; font-weight:900; color:var(--primary); }

.stub-form {
  display:flex; flex-direction:column;
  justify-content:center; gap:14px;
  font-size:12px; font-weight:600; color:#333;
}
.stub-form i { color:var(--primary); margin-right:5px; }
.line {
  display:inline-block;
  border-bottom:1.5px solid #999;
  width:52%; margin-left:5px;
  vertical-align:bottom;
}

.stub-price {
  display:flex; flex-direction:column;
  justify-content:space-between;
}
.stub-payment {
  display:flex; flex-direction:column; gap:8px;
  padding-bottom:8px;
  border-bottom:1px solid var(--border);
  margin-bottom:8px;
}
.stub-payment label {
  display:flex; align-items:center; gap:7px;
  font-size:10px; font-weight:900;
  letter-spacing:1.5px; color:#333; cursor:default;
}
.chk {
  display:inline-block;
  width:13px; height:13px;
  border:2px solid #1a1a2e;
  border-radius:3px; flex-shrink:0;
}
.stub-price small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--primary); margin-bottom:4px; }
.stub-price strong { font-size:20px; font-weight:900; color:var(--green); }

</style>
</head>
<body>
<div class="ticket">

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <h1>BINGO</h1>
      <span>{{PREMIO}}</span>
    </div>
    <div class="header-right">
      <i class="fa-solid fa-ticket"></i>
      <div>
        <small>CARTELA Nº</small>
        <strong>{{NUMERO}}</strong>
      </div>
    </div>
  </header>

  <!-- FOTO + SIDEBAR -->
  <section class="prize-section">

    <div class="prize-image">
      {{IMAGEM_PREMIO}}
    </div>

    <div class="prize-card">

      <div class="card-block">
        <h3><i class="fa-solid fa-location-dot"></i> LOCAL</h3>
        <div class="contact">{{LOCAL}}</div>
      </div>

      <div class="divider"></div>

      <div class="card-block">
        <h3><i class="fa-solid fa-calendar"></i> DATA E HORÁRIO</h3>
        <div class="contact">__/__/____</div>
        <div class="sub-info">às {{HORARIO}}</div>
      </div>

      <div class="divider"></div>

      <div class="card-block">
        <h3><i class="fa-solid fa-tag"></i> VALOR DA CARTELA</h3>
        <div class="price">{{VALOR}}</div>
      </div>

    </div>
  </section>

  <!-- BINGO -->
  <section class="bingo-section">
    <div class="bingo-header">
      <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
    </div>
    <div class="bingo-grid">
      {{TABELA}}
    </div><div class="cell">16</div><div class="cell">34</div><div class="cell">46</div><div class="cell">61</div><div class="cell">5</div><div class="cell">22</div><div class="cell">39</div><div class="cell">47</div><div class="cell">64</div><div class="cell">6</div><div class="cell">23</div><div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div><div class="cell">50</div><div class="cell">65</div><div class="cell">12</div><div class="cell">25</div><div class="cell">42</div><div class="cell">51</div><div class="cell">72</div><div class="cell">15</div><div class="cell">30</div><div class="cell">43</div><div class="cell">53</div><div class="cell">75</div>
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
        <div><i class="fa-solid fa-house"></i> Endereço: <span class="line"></span></div>
      </div>

      <div class="stub-price">
        <div class="stub-payment">
          <label><span class="chk"></span> PAGO</label>
          <label><span class="chk"></span> NÃO PAGO</label>
        </div>
        <small>VALOR DA CARTELA</small>
        <strong>{{VALOR}}</strong>
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
