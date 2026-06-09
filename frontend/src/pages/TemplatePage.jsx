import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Save, RefreshCw, Code2, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import { gerarCartelaPreview } from '../utils/bingoGenerator'

const DOC_REF = doc(db, 'config', 'template')

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:794px; height:1123px; background:#F4F7FC; font-family:Arial,sans-serif; overflow:hidden; }
  body { padding:28px 28px 22px 28px; display:flex; flex-direction:column; gap:0; }
  table { border-collapse:separate; border-spacing:5px; width:100%; }
  .card { flex:1; background:#fff; border-radius:16px; border:3px solid #0B2E5E; box-shadow:0 2px 0 #0B2E5E,inset 0 0 0 6px #fff,inset 0 0 0 8px #0B2E5E; display:flex; gap:0; overflow:hidden; margin-bottom:14px; }
  .left { flex:1; min-width:0; padding:22px 18px 22px 22px; display:flex; flex-direction:column; gap:10px; border-right:3px solid #0B2E5E; }
  .bingo-header { text-align:center; background:#0B2E5E; border-radius:10px; padding:6px 0 4px; position:relative; overflow:hidden; }
  .bingo-header-bg { position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(240,165,0,.12) 8px,rgba(240,165,0,.12) 16px); }
  .bingo-title { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:86px; font-weight:900; color:#F0A500; letter-spacing:8px; text-shadow:3px 3px 0 rgba(0,0,0,.4); line-height:1; position:relative; }
  .num-wrap { display:flex; justify-content:center; }
  .num-label { background:#0B2E5E; color:#F0A500; font-size:11px; font-weight:900; padding:4px 20px 3px; border-radius:6px 6px 0 0; letter-spacing:2.5px; text-transform:uppercase; }
  .num-val { background:#fff; border:3px solid #0B2E5E; border-top:none; border-radius:0 0 8px 8px; padding:2px 32px 4px; font-family:Impact,'Arial Black',Arial,sans-serif; font-size:48px; font-weight:900; color:#D42B2B; letter-spacing:4px; text-align:center; }
  .th { color:#fff; font-family:Impact,'Arial Black',Arial,sans-serif; font-size:38px; font-weight:900; text-align:center; padding:12px 0; border-radius:6px; width:20%; letter-spacing:2px; height:62px; }
  .th-b,.th-n,.th-o { background:#0B2E5E; }
  .th-i,.th-g { background:#F0A500; }
  .td { background:#fff; font-family:Impact,'Arial Black',Arial,sans-serif; font-size:40px; font-weight:900; text-align:center; border-radius:6px; color:#0B2E5E; height:76px; vertical-align:middle; border:2px solid #e8eef8; }
  .td-free { font-size:32px; }
  .right { width:218px; padding:22px 18px 18px; display:flex; flex-direction:column; gap:12px; background:#F8FAFF; }
  .prize-label { background:#0B2E5E; color:#F0A500; font-size:11px; font-weight:900; padding:5px 0; border-radius:6px 6px 0 0; letter-spacing:2.5px; text-align:center; }
  .prize-body { border:2px solid #0B2E5E; border-top:none; border-radius:0 0 10px 10px; padding:12px 8px 10px; background:#fff; text-align:center; }
  .prize-img { width:100%; max-height:100px; object-fit:contain; display:block; margin:0 auto 6px; }
  .prize-desc { font-size:12px; color:#333; font-weight:700; line-height:1.3; }
  .info-row { display:flex; align-items:center; gap:10px; border-bottom:1.5px solid #e0e8f4; padding-bottom:10px; }
  .info-icon { font-size:20px; flex-shrink:0; }
  .info-lbl { font-size:9px; font-weight:900; color:#F0A500; letter-spacing:1.5px; text-transform:uppercase; }
  .info-val { font-size:14px; font-weight:700; color:#0B2E5E; }
  .valor-wrap { margin-top:auto; border-radius:10px; overflow:hidden; border:2px solid #0B2E5E; }
  .valor-lbl { background:#0B2E5E; color:#fff; font-size:10px; font-weight:900; text-align:center; padding:5px; letter-spacing:2px; }
  .valor-val { background:#F0A500; font-family:Impact,'Arial Black',Arial,sans-serif; font-size:38px; font-weight:900; color:#fff; text-align:center; padding:8px 0; text-shadow:2px 2px 0 rgba(0,0,0,.25); letter-spacing:1px; }
  .scissors { display:flex; align-items:center; gap:6px; color:#999; margin-bottom:14px; flex-shrink:0; }
  .scissors hr { flex:1; border:none; border-top:2px dashed #aaa; }
  .scissors span { font-size:16px; transform:rotate(-90deg); display:inline-block; }
  .stub { background:#fff; border-radius:12px; border:2px solid #0B2E5E; display:flex; align-items:stretch; gap:0; flex-shrink:0; overflow:hidden; }
  .stub-tag { background:#0B2E5E; color:#F0A500; font-size:11px; font-weight:900; writing-mode:vertical-rl; transform:rotate(180deg); padding:14px 10px; letter-spacing:3px; flex-shrink:0; }
  .stub-fields { flex:1; padding:14px 16px; display:flex; flex-direction:column; gap:10px; justify-content:center; }
  .stub-num { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:17px; font-weight:900; color:#0B2E5E; letter-spacing:1px; }
  .stub-field { display:flex; align-items:flex-end; gap:8px; }
  .stub-field span { font-size:13px; font-weight:700; color:#555; white-space:nowrap; padding-bottom:2px; }
  .stub-field hr { flex:1; border:none; border-bottom:1.5px solid #0B2E5E; min-height:22px; }
  .stub-logo { background:#F8FAFF; border-left:2px solid #0B2E5E; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:14px 16px; gap:2px; flex-shrink:0; }
</style>
</head>
<body>

<div class="card">
  <div class="left">
    <div class="bingo-header">
      <div class="bingo-header-bg"></div>
      <span class="bingo-title">BINGO</span>
    </div>
    <div class="num-wrap">
      <div>
        <div class="num-label">Nº da Cartela</div>
        <div class="num-val">{{NUMERO}}</div>
      </div>
    </div>
    <div style="flex:1;">
      <table style="height:100%;">
        <thead>
          <tr>
            <td class="th th-b">B</td><td class="th th-i">I</td>
            <td class="th th-n">N</td><td class="th th-g">G</td>
            <td class="th th-o">O</td>
          </tr>
        </thead>
        <tbody>{{TABELA}}</tbody>
      </table>
    </div>
  </div>

  <div class="right">
    <div>
      <div class="prize-label">PRÊMIO</div>
      <div class="prize-body">
        {{IMAGEM_PREMIO}}
        <div class="prize-desc">{{PREMIO}}</div>
      </div>
    </div>
    <div class="info-row">
      <span class="info-icon">📅</span>
      <div><div class="info-lbl">Data</div><div class="info-val">{{DATA}}</div></div>
    </div>
    <div class="info-row">
      <span class="info-icon">⏰</span>
      <div><div class="info-lbl">Horário</div><div class="info-val">{{HORARIO}}</div></div>
    </div>
    <div class="info-row">
      <span class="info-icon">📍</span>
      <div style="min-width:0;flex:1;">
        <div class="info-lbl">Local</div>
        <div class="info-val" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{LOCAL}}</div>
      </div>
    </div>
    <div class="valor-wrap">
      <div class="valor-lbl">VALOR DA CARTELA</div>
      <div class="valor-val">{{VALOR}}</div>
    </div>
  </div>
</div>

<div class="scissors"><hr /><span>✂</span><hr /></div>

<div class="stub">
  <div class="stub-tag">CANHOTO</div>
  <div class="stub-fields">
    <div class="stub-num">Nº <span style="color:#D42B2B;">{{NUMERO}}</span></div>
    <div class="stub-field"><span>NOME:</span><hr /></div>
    <div class="stub-field"><span>TELEFONE:</span><hr /></div>
    <div class="stub-field"><span>ENDEREÇO:</span><hr /></div>
  </div>
  <div class="stub-logo">
    <span style="font-size:32px;line-height:1;">🎱</span>
    <span style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:#0B2E5E;letter-spacing:3px;">BINGO</span>
    <span style="font-size:12px;font-weight:700;color:#F0A500;font-style:italic;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`

function renderPreview(template, dados) {
  const { numero, rows, premio, imagePreview, data, horario, local, valor } = dados

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell =>
      `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '★' : cell.value}</td>`
    ).join('')}</tr>`
  ).join('')

  const imgHtml = imagePreview
    ? `<img class="prize-img" src="${imagePreview}" />`
    : `<div style="font-size:44px;padding:6px 0;line-height:1;">🎁</div>`

  return template
    .replace(/{{NUMERO}}/g, String(numero).padStart(4, '0'))
    .replace(/{{PREMIO}}/g, premio || 'Prêmio')
    .replace(/{{DATA}}/g, data ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR') : '__/__/____')
    .replace(/{{HORARIO}}/g, horario || '--:--')
    .replace(/{{LOCAL}}/g, local || '—')
    .replace(/{{VALOR}}/g, valor || 'R$ —')
    .replace(/{{IMAGEM_PREMIO}}/g, imgHtml)
    .replace(/{{TABELA}}/g, tabelaHTML)
}

export default function TemplatePage() {
  const iframeRef = useRef(null)
  const [html, setHtml] = useState(DEFAULT_TEMPLATE)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('editor')
  const [previewRows, setPreviewRows] = useState(() => gerarCartelaPreview())

  const previewData = {
    numero: 1,
    rows: previewRows,
    premio: 'Smart TV 55" Samsung',
    imagePreview: null,
    data: new Date().toISOString().split('T')[0],
    horario: '19:00',
    local: 'Clube Recreativo',
    valor: 'R$ 10,00',
  }

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(DOC_REF)
        if (snap.exists() && snap.data().html) setHtml(snap.data().html)
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [])

  // Fix: usa blob URL em vez de srcdoc para evitar erro de sandbox
  useEffect(() => {
    if (tab !== 'preview' || !iframeRef.current) return
    const rendered = renderPreview(html, previewData)
    const blob = new Blob([rendered], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframeRef.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [tab, html, previewRows])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(DOC_REF, { html, updatedAt: new Date() })
      setSaved(true)
      toast.success('Template salvo! Será usado na próxima geração de PDF.')
      setTimeout(() => setSaved(false), 3000)
    } catch { toast.error('Erro ao salvar template.') }
    finally { setSaving(false) }
  }

  const handleReset = () => {
    if (!confirm('Restaurar o template padrão? O conteúdo atual será perdido.')) return
    setHtml(DEFAULT_TEMPLATE)
    toast.success('Template restaurado.')
  }

  const copyVar = (v) => {
    navigator.clipboard.writeText(v).then(() => toast.success(`${v} copiado!`))
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-[#0B2E5E]" /> Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edite o HTML/CSS da cartela. Clique nas variáveis abaixo para copiar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={14} /> Restaurar padrão
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#0B2E5E] hover:bg-[#0a2550] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1 items-center">
          {[{ key: 'editor', label: '📝 Editor HTML/CSS' }, { key: 'preview', label: '👁 Preview A4' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'border-[#0B2E5E] text-[#0B2E5E]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button onClick={() => setPreviewRows(gerarCartelaPreview())}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0B2E5E] py-2 transition-colors">
              <RefreshCw size={12} /> Novos números
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Carregando template…</div>
          ) : tab === 'editor' ? (
            <textarea value={html} onChange={e => setHtml(e.target.value)} spellCheck={false}
              className="w-full h-full resize-none font-mono text-sm p-5 bg-gray-950 text-green-400 focus:outline-none"
              style={{ minHeight: 'calc(100vh - 160px)' }} />
          ) : (
            <div className="flex items-start justify-center bg-gray-300 overflow-auto p-8"
              style={{ minHeight: 'calc(100vh - 160px)' }}>
              <div className="shadow-2xl" style={{ width: 794 }}>
                <iframe ref={iframeRef} title="Preview A4"
                  style={{ width: 794, height: 1123, border: 'none', display: 'block' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Variáveis */}
        {tab === 'editor' && (
          <div className="bg-gray-900 border-t border-gray-700 px-5 py-2.5 flex gap-4 flex-wrap items-center">
            <span className="text-xs text-gray-500 shrink-0">Clique para copiar →</span>
            {['{{NUMERO}}','{{PREMIO}}','{{DATA}}','{{HORARIO}}','{{LOCAL}}','{{VALOR}}','{{IMAGEM_PREMIO}}','{{TABELA}}'].map(v => (
              <code key={v} onClick={() => copyVar(v)}
                className="text-xs text-yellow-300 font-mono cursor-pointer hover:text-white hover:bg-yellow-600 px-1.5 py-0.5 rounded transition-colors">
                {v}
              </code>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
