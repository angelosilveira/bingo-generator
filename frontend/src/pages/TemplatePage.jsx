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
  html, body { width:794px; height:1123px; background:#e8f0fe; font-family:'Arial Black',Arial,sans-serif; overflow:hidden; }
  body { padding:24px 24px 20px 24px; display:flex; flex-direction:column; gap:12px; }
  table { border-collapse:separate; border-spacing:5px; width:100%; }
  .card { background:#dde8fb; border-radius:22px; border:2px solid #b8ccee; padding:22px 20px; display:flex; gap:18px; flex:1; }
  .left { flex:1; min-width:0; display:flex; flex-direction:column; gap:10px; }
  .bingo-title { text-align:center; font-size:80px; font-weight:900; color:#1a3a6b; text-shadow:3px 3px 0 #fff,-2px -2px 0 #0a1f45; letter-spacing:3px; line-height:1; }
  .num-wrap { display:flex; justify-content:center; }
  .num-label { background:#1a3a6b; color:#fff; font-size:13px; font-weight:900; padding:3px 16px; border-radius:8px 8px 0 0; text-align:center; letter-spacing:1.5px; font-family:Arial,sans-serif; }
  .num-val { background:#fff; border:2px solid #1a3a6b; border-radius:0 0 10px 10px; padding:4px 28px; font-size:42px; font-weight:900; color:#e03030; letter-spacing:3px; text-align:center; }
  .th { color:#fff; font-size:34px; font-weight:900; text-align:center; padding:14px 0; border-radius:10px; height:60px; }
  .th-b,.th-n,.th-o { background:#1a3a6b; } .th-i,.th-g { background:#f5a623; }
  .td { background:#fff; font-size:34px; font-weight:900; text-align:center; border-radius:10px; height:72px; vertical-align:middle; }
  .right { width:210px; display:flex; flex-direction:column; gap:10px; }
  .prize-box { border:2px dashed #1a3a6b; border-radius:14px; padding:10px; background:#fff; text-align:center; }
  .prize-label { background:#1a3a6b; color:#fff; font-size:13px; font-weight:900; border-radius:8px; padding:4px 0; margin-bottom:8px; letter-spacing:1.5px; font-family:Arial,sans-serif; }
  .prize-img { width:100%; max-height:110px; object-fit:contain; border-radius:8px; }
  .prize-desc { font-size:13px; color:#444; margin-top:6px; font-weight:700; font-family:Arial,sans-serif; }
  .info-row { display:flex; align-items:center; gap:8px; background:#fff; border-radius:24px; padding:7px 10px; border:2px solid #1a3a6b; }
  .info-icon { background:#1a3a6b; color:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .info-lbl { font-family:Arial,sans-serif; font-size:10px; font-weight:900; color:#f5a623; letter-spacing:1px; }
  .info-val { font-family:Arial,sans-serif; font-size:14px; font-weight:700; color:#1a3a6b; }
  .valor-box { background:#1a3a6b; border-radius:14px; padding:10px; text-align:center; margin-top:auto; }
  .valor-lbl { font-family:Arial,sans-serif; color:#fff; font-size:11px; font-weight:900; letter-spacing:1.5px; }
  .valor-val { background:#f5a623; color:#fff; font-size:32px; font-weight:900; border-radius:10px; padding:4px 0; margin-top:6px; text-shadow:1px 1px 0 rgba(0,0,0,.2); }
  .scissors { display:flex; align-items:center; gap:8px; color:#aaa; flex-shrink:0; }
  .scissors hr { flex:1; border:none; border-top:2px dashed #ccc; }
  .stub { background:#fff; border-radius:16px; border:2px solid #dde8fb; display:flex; align-items:stretch; gap:16px; padding:16px; flex-shrink:0; }
  .stub-tag { background:#1a3a6b; color:#fff; font-family:Arial,sans-serif; font-size:12px; font-weight:900; writing-mode:vertical-rl; transform:rotate(180deg); padding:12px 8px; border-radius:10px; letter-spacing:3px; flex-shrink:0; }
  .stub-fields { flex:1; display:flex; flex-direction:column; justify-content:space-between; gap:10px; padding:4px 0; }
  .stub-num { font-size:16px; font-weight:900; color:#1a3a6b; }
  .stub-field { display:flex; gap:8px; align-items:flex-end; }
  .stub-field span { font-family:Arial,sans-serif; font-size:14px; font-weight:700; color:#333; white-space:nowrap; }
  .stub-field hr { flex:1; border:none; border-bottom:1.5px solid #aaa; min-height:24px; }
  .stub-logo { display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; gap:2px; }
</style>
</head>
<body>

<div class="card">
  <div class="left">
    <div class="bingo-title">BINGO</div>
    <div class="num-wrap">
      <div>
        <div class="num-label">Nº DA CARTELA</div>
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
    <div class="prize-box">
      <div class="prize-label">PRÊMIO</div>
      {{IMAGEM_PREMIO}}
      <div class="prize-desc">{{PREMIO}}</div>
    </div>
    <div class="info-row">
      <div class="info-icon">📅</div>
      <div><div class="info-lbl">DATA</div><div class="info-val">{{DATA}}</div></div>
    </div>
    <div class="info-row">
      <div class="info-icon">🕐</div>
      <div><div class="info-lbl">HORÁRIO</div><div class="info-val">{{HORARIO}}</div></div>
    </div>
    <div class="info-row">
      <div class="info-icon">📍</div>
      <div style="min-width:0;">
        <div class="info-lbl">LOCAL</div>
        <div class="info-val" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:148px;">{{LOCAL}}</div>
      </div>
    </div>
    <div class="valor-box">
      <div class="valor-lbl">VALOR DA CARTELA</div>
      <div class="valor-val">{{VALOR}}</div>
    </div>
  </div>
</div>

<div class="scissors"><hr />✂<hr /></div>

<div class="stub">
  <div class="stub-tag">CANHOTO</div>
  <div class="stub-fields">
    <div class="stub-num">Nº DA CARTELA: <span style="color:#e03030;">{{NUMERO}}</span></div>
    <div class="stub-field"><span>NOME:</span><hr /></div>
    <div class="stub-field"><span>TELEFONE:</span><hr /></div>
    <div class="stub-field"><span>ENDEREÇO:</span><hr /></div>
  </div>
  <div class="stub-logo">
    <span style="font-size:36px;">🎱</span>
    <span style="font-size:22px;font-weight:900;color:#1a3a6b;">BINGO</span>
    <span style="font-size:14px;font-weight:700;color:#f5a623;font-style:italic;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`

function renderPreview(template, dados) {
  const { numero, rows, premio, imagePreview, data, horario, local, valor } = dados

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell => `<td class="td">${cell.free ? '🎁' : cell.value}</td>`).join('')}</tr>`
  ).join('')

  const imgHtml = imagePreview
    ? `<img class="prize-img" src="${imagePreview}" />`
    : `<div style="font-size:48px;padding:10px 0;">🎁</div>`

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

  useEffect(() => {
    if (tab !== 'preview' || !iframeRef.current) return
    iframeRef.current.srcdoc = renderPreview(html, previewData)
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

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-[#1a3a6b]" /> Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edite o HTML/CSS da cartela. Use as variáveis{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{NUMERO}}'}</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">{'{{TABELA}}'}</code>, etc.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={14} /> Restaurar padrão
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#1a3a6b] hover:bg-[#0f2347] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          {[{ key: 'editor', label: '📝 Editor HTML/CSS' }, { key: 'preview', label: '👁 Preview A4' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? 'border-[#1a3a6b] text-[#1a3a6b]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button onClick={() => setPreviewRows(gerarCartelaPreview())}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a3a6b] py-2 transition-colors">
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
                  style={{ width: 794, height: 1123, border: 'none', display: 'block', background: '#e8f0fe' }}
                  sandbox="allow-same-origin" />
              </div>
            </div>
          )}
        </div>

        {/* Variáveis */}
        {tab === 'editor' && (
          <div className="bg-gray-900 border-t border-gray-700 px-5 py-2.5 flex gap-4 flex-wrap items-center">
            <span className="text-xs text-gray-500">Variáveis:</span>
            {['{{NUMERO}}','{{PREMIO}}','{{DATA}}','{{HORARIO}}','{{LOCAL}}','{{VALOR}}','{{IMAGEM_PREMIO}}','{{TABELA}}'].map(v => (
              <code key={v} className="text-xs text-yellow-300 font-mono cursor-pointer hover:text-yellow-100"
                onClick={() => { navigator.clipboard.writeText(v); toast.success(`${v} copiado!`) }}>
                {v}
              </code>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
