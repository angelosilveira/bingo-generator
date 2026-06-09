import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Save, RefreshCw, Eye, Code2, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import { gerarCartelaPreview } from '../utils/bingoGenerator'

const DOC_REF = doc(db, 'config', 'template')

const DEFAULT_TEMPLATE = `<!-- Variáveis disponíveis (substitua manualmente para preview ou use o sistema): -->
<!-- {{NUMERO}} {{PREMIO}} {{DATA}} {{HORARIO}} {{LOCAL}} {{VALOR}} {{IMAGEM_URL}} -->
<!-- Cada linha da tabela: {{LINHA_1_COL_1}} até {{LINHA_5_COL_5}} (ou FREE) -->

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width: 794px;
    min-height: 1050px;
    background: #e8f0fe;
    font-family: 'Arial Black', Arial, sans-serif;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .card {
    background: #dde8fb;
    border-radius: 20px;
    border: 2px solid #b8ccee;
    padding: 18px;
    display: flex;
    gap: 16px;
  }
  .left { flex: 1; }
  .title {
    text-align: center;
    font-size: 64px;
    font-weight: 900;
    color: #1a3a6b;
    text-shadow: 3px 3px 0 #fff, -1px -1px 0 #0a1f45;
    line-height: 1;
    margin-bottom: 8px;
  }
  .num-badge { display:flex; justify-content:center; margin-bottom:10px; }
  .num-label {
    background:#1a3a6b; color:#fff; font-size:10px; font-weight:900;
    padding:2px 12px; border-radius:6px 6px 0 0; text-align:center;
  }
  .num-value {
    background:#fff; border:2px solid #1a3a6b; border-radius:0 0 8px 8px;
    font-size:32px; font-weight:900; color:#e03030;
    padding:2px 20px; text-align:center;
  }
  table { border-collapse:separate; border-spacing:4px; width:100%; }
  .th { color:#fff; font-size:24px; font-weight:900; text-align:center;
        padding:9px 0; border-radius:8px; }
  .th-b, .th-n, .th-o { background:#1a3a6b; }
  .th-i, .th-g { background:#f5a623; }
  .td { background:#fff; font-size:24px; font-weight:900; text-align:center;
        padding:9px 0; border-radius:8px; height:50px; }
  .right { width:190px; display:flex; flex-direction:column; gap:8px; }
  .prize-box { border:2px dashed #1a3a6b; border-radius:12px; padding:8px;
               background:#fff; text-align:center; }
  .prize-label { background:#1a3a6b; color:#fff; font-size:10px; font-weight:900;
                 border-radius:6px; padding:3px 0; margin-bottom:6px; }
  .prize-img { width:100%; max-height:90px; object-fit:contain; border-radius:8px; }
  .info-row { display:flex; align-items:center; gap:6px; background:#fff;
              border-radius:20px; padding:5px 8px; border:2px solid #1a3a6b; }
  .info-icon { background:#1a3a6b; color:#fff; border-radius:50%; width:26px; height:26px;
               display:flex; align-items:center; justify-content:center; font-size:13px; }
  .info-lbl { font-size:8px; font-weight:900; color:#f5a623; letter-spacing:1px; }
  .info-val { font-size:11px; font-weight:700; color:#1a3a6b; }
  .valor-box { background:#1a3a6b; border-radius:12px; padding:8px; text-align:center; margin-top:auto; }
  .valor-lbl { color:#fff; font-size:9px; font-weight:900; }
  .valor-val { background:#f5a623; color:#fff; font-size:24px; font-weight:900;
               border-radius:8px; padding:2px 0; margin-top:4px; }
  .scissors { display:flex; align-items:center; gap:8px; color:#999; margin:2px 0; }
  .scissors hr { flex:1; border:none; border-top:2px dashed #bbb; }
  .stub { background:#fff; border-radius:14px; border:2px solid #dde8fb;
          display:flex; align-items:center; gap:14px; padding:10px 14px; }
  .stub-tag { background:#1a3a6b; color:#fff; font-size:10px; font-weight:900;
              writing-mode:vertical-rl; transform:rotate(180deg);
              padding:10px 6px; border-radius:8px; }
  .stub-field { display:flex; gap:6px; align-items:flex-end; margin-bottom:4px;
                font-size:11px; font-family:Arial,sans-serif; }
  .stub-field hr { flex:1; border:none; border-bottom:1px solid #999; }
  .stub-logo { display:flex; flex-direction:column; align-items:center; }
</style>
</head>
<body>

<div class="card">
  <div class="left">
    <div class="title">BINGO</div>
    <div class="num-badge">
      <div>
        <div class="num-label">Nº DA CARTELA</div>
        <div class="num-value">{{NUMERO}}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <td class="th th-b">B</td>
          <td class="th th-i">I</td>
          <td class="th th-n">N</td>
          <td class="th th-g">G</td>
          <td class="th th-o">O</td>
        </tr>
      </thead>
      <tbody>
        {{TABELA}}
      </tbody>
    </table>
  </div>

  <div class="right">
    <div class="prize-box">
      <div class="prize-label">PRÊMIO</div>
      {{IMAGEM_PREMIO}}
      <div style="font-size:10px;color:#555;margin-top:4px;font-weight:700;font-family:Arial;">{{PREMIO}}</div>
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
        <div class="info-val" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">{{LOCAL}}</div>
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
  <div style="flex:1;">
    <div style="font-size:13px;font-weight:900;color:#1a3a6b;margin-bottom:5px;">
      Nº DA CARTELA: <span style="color:#e03030;">{{NUMERO}}</span>
    </div>
    <div class="stub-field"><span style="font-weight:700;">NOME:</span><hr /></div>
    <div class="stub-field"><span style="font-weight:700;">TELEFONE:</span><hr /></div>
    <div class="stub-field"><span style="font-weight:700;">ENDEREÇO:</span><hr /></div>
  </div>
  <div class="stub-logo">
    <span style="font-size:28px;">🎱</span>
    <span style="font-size:18px;font-weight:900;color:#1a3a6b;">BINGO</span>
    <span style="font-size:12px;font-weight:700;color:#f5a623;font-style:italic;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`

// Substitui variáveis do template com dados reais de preview
function renderPreview(template, dados) {
  const { numero, rows, premio, imagePreview, data, horario, local, valor } = dados

  const COLS = ['B', 'I', 'N', 'G', 'O']
  const tabelaHTML = rows.map(row =>
    `<tr>${row.map(cell => `<td class="td">${cell.free ? '🎁' : cell.value}</td>`).join('')}</tr>`
  ).join('')

  const imgHtml = imagePreview
    ? `<img class="prize-img" src="${imagePreview}" />`
    : `<div style="font-size:36px;padding:8px 0;">🎁</div>`

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
  const [tab, setTab] = useState('editor') // 'editor' | 'preview'
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

  // Carrega template salvo do Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(DOC_REF)
        if (snap.exists() && snap.data().html) {
          setHtml(snap.data().html)
        }
      } catch {
        // usa o default
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Atualiza iframe do preview
  useEffect(() => {
    if (tab !== 'preview' || !iframeRef.current) return
    const rendered = renderPreview(html, previewData)
    const iframe = iframeRef.current
    iframe.srcdoc = rendered
  }, [tab, html, previewRows])

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(DOC_REF, { html, updatedAt: new Date() })
      setSaved(true)
      toast.success('Template salvo! Será usado na próxima geração de PDF.')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error('Erro ao salvar template.')
    } finally {
      setSaving(false)
    }
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
              <Code2 size={20} className="text-[#1a3a6b]" />
              Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edite o HTML/CSS da cartela. Use as variáveis <code className="bg-gray-100 px-1 rounded">{'{{NUMERO}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{PREMIO}}'}</code>, etc.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={14} /> Restaurar padrão
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#1a3a6b] hover:bg-[#0f2347] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1">
          {[
            { key: 'editor', label: '📝 Editor HTML/CSS' },
            { key: 'preview', label: '👁 Preview' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#1a3a6b] text-[#1a3a6b]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button
              onClick={() => setPreviewRows(gerarCartelaPreview())}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a3a6b] py-2 transition-colors"
            >
              <RefreshCw size={12} /> Novos números
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">Carregando template…</div>
          ) : tab === 'editor' ? (
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              spellCheck={false}
              className="w-full h-full resize-none font-mono text-sm p-5 bg-gray-950 text-green-400 focus:outline-none"
              style={{ minHeight: 'calc(100vh - 180px)' }}
            />
          ) : (
            <div className="flex items-start justify-center bg-gray-200 overflow-auto p-6"
              style={{ minHeight: 'calc(100vh - 180px)' }}>
              <div className="shadow-2xl rounded-lg overflow-hidden" style={{ width: 794 }}>
                <iframe
                  ref={iframeRef}
                  title="Preview cartela"
                  style={{ width: 794, height: 1100, border: 'none', display: 'block' }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}
        </div>

        {/* Variáveis cheat sheet */}
        {tab === 'editor' && (
          <div className="bg-gray-900 border-t border-gray-700 px-5 py-2.5 flex gap-4 flex-wrap">
            {[
              '{{NUMERO}}', '{{PREMIO}}', '{{DATA}}', '{{HORARIO}}',
              '{{LOCAL}}', '{{VALOR}}', '{{IMAGEM_PREMIO}}', '{{TABELA}}'
            ].map(v => (
              <code key={v} className="text-xs text-yellow-300 font-mono">{v}</code>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
