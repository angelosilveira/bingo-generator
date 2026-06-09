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
  html, body { width:794px; height:1123px; background:#F2F5FA; font-family:Arial,sans-serif; overflow:hidden; }
  body { display:flex; flex-direction:column; }
  table { border-collapse:collapse; width:100%; }
  .th { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:42px; font-weight:900; text-align:center; letter-spacing:3px; width:20%; padding:14px 0; }
  .th-dark { background:#0D1F3C; color:#fff; }
  .th-gold  { background:#E8A000; color:#fff; }
  .td { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:46px; font-weight:900; text-align:center; color:#0D1F3C; height:80px; vertical-align:middle; border:1px solid #E2E8F2; }
  .td-free  { font-size:36px; color:#E8A000; }
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#0D1F3C 0%,#162E58 50%,#0D1F3C 100%);padding:18px 32px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(-55deg,transparent,transparent 18px,rgba(232,160,0,.06) 18px,rgba(232,160,0,.06) 36px);pointer-events:none;"></div>
  <div style="position:relative;">
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:88px;line-height:1;color:#E8A000;letter-spacing:10px;text-shadow:0 4px 24px rgba(0,0,0,.5),3px 3px 0 rgba(0,0,0,.3);">BINGO</div>
    <div style="height:4px;background:linear-gradient(90deg,#E8A000,transparent);margin-top:4px;border-radius:2px;"></div>
  </div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;position:relative;">
    <div style="display:flex;align-items:center;gap:0;">
      <div style="background:#E8A000;color:#0D1F3C;font-size:10px;font-weight:900;letter-spacing:2px;padding:5px 10px;border-radius:6px 0 0 6px;text-transform:uppercase;white-space:nowrap;line-height:1;">Nº DA<br>CARTELA</div>
      <div style="background:#fff;color:#C0392B;font-family:Impact,'Arial Black',Arial,sans-serif;font-size:40px;font-weight:900;letter-spacing:4px;padding:0 18px;border-radius:0 6px 6px 0;line-height:1.15;min-width:130px;text-align:center;">{{NUMERO}}</div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(232,160,0,.4);border-radius:8px;padding:6px 12px;">
      {{IMAGEM_PREMIO}}
      <div>
        <div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:1.5px;text-transform:uppercase;">Prêmio</div>
        <div style="font-size:14px;font-weight:700;color:#fff;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{PREMIO}}</div>
      </div>
    </div>
  </div>
</div>

<!-- TABELA -->
<div style="flex:1;display:flex;flex-direction:column;background:#fff;border-left:4px solid #0D1F3C;border-right:4px solid #0D1F3C;">
  <table style="height:100%;">
    <thead>
      <tr style="height:68px;">
        <td class="th th-dark">B</td>
        <td class="th th-gold">I</td>
        <td class="th th-dark">N</td>
        <td class="th th-gold">G</td>
        <td class="th th-dark">O</td>
      </tr>
    </thead>
    <tbody>{{TABELA}}</tbody>
  </table>
</div>

<!-- FAIXA INFO -->
<div style="background:#0D1F3C;display:flex;align-items:stretch;flex-shrink:0;border-left:4px solid #0D1F3C;border-right:4px solid #0D1F3C;">
  <div style="flex:1;padding:12px 16px;border-right:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:10px;">
    <span style="font-size:22px;opacity:.9;">📅</span>
    <div><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">DATA</div><div style="font-size:15px;font-weight:700;color:#fff;">{{DATA}}</div></div>
  </div>
  <div style="flex:1;padding:12px 16px;border-right:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:10px;">
    <span style="font-size:22px;opacity:.9;">⏰</span>
    <div><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">HORÁRIO</div><div style="font-size:15px;font-weight:700;color:#fff;">{{HORARIO}}</div></div>
  </div>
  <div style="flex:1;padding:12px 16px;border-right:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:10px;min-width:0;">
    <span style="font-size:22px;opacity:.9;flex-shrink:0;">📍</span>
    <div style="min-width:0;flex:1;"><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">LOCAL</div><div style="font-size:15px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{LOCAL}}</div></div>
  </div>
  <div style="background:#E8A000;padding:10px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;min-width:160px;">
    <div style="font-size:9px;font-weight:900;color:#0D1F3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">Valor da Cartela</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:32px;font-weight:900;color:#0D1F3C;letter-spacing:1px;line-height:1;">{{VALOR}}</div>
  </div>
</div>

<!-- TESOURA -->
<div style="display:flex;align-items:center;gap:0;flex-shrink:0;padding:10px 0 8px;">
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
  <div style="display:flex;align-items:center;gap:6px;padding:0 12px;color:#8899aa;white-space:nowrap;">
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
    <span style="font-size:10px;letter-spacing:1px;">DESTAQUE AQUI</span>
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
  </div>
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
</div>

<!-- CANHOTO -->
<div style="background:#fff;border:2px solid #0D1F3C;border-radius:10px;margin:0 0 4px;display:flex;align-items:stretch;overflow:hidden;flex-shrink:0;">
  <div style="background:#0D1F3C;color:#E8A000;font-size:10px;font-weight:900;writing-mode:vertical-rl;transform:rotate(180deg);padding:14px 9px;letter-spacing:3.5px;text-transform:uppercase;flex-shrink:0;">CANHOTO</div>
  <div style="flex:1;padding:12px 20px;display:flex;flex-direction:column;justify-content:space-between;">
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:15px;color:#0D1F3C;letter-spacing:1px;margin-bottom:8px;">
      Nº <span style="color:#C0392B;font-size:18px;">{{NUMERO}}</span>
    </div>
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;"><span style="font-size:11px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:68px;">NOME:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:20px;"></div></div>
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;"><span style="font-size:11px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:68px;">TELEFONE:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:20px;"></div></div>
    <div style="display:flex;align-items:flex-end;gap:8px;"><span style="font-size:11px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:68px;">ENDEREÇO:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:20px;"></div></div>
  </div>
  <div style="background:#F2F5FA;border-left:2px solid #0D1F3C;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 18px;gap:1px;flex-shrink:0;min-width:110px;">
    <div style="font-size:28px;line-height:1;margin-bottom:2px;">🎱</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:18px;font-weight:900;color:#0D1F3C;letter-spacing:3px;">BINGO</div>
    <div style="font-size:11px;font-weight:700;color:#E8A000;font-style:italic;">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`

function renderPreview(template, dados) {
  const { numero, rows, premio, imagePreview, data, horario, local, valor } = dados

  const tabelaHTML = rows.map(row =>
    `<tr>${row.map((cell, ci) => {
      const isGold = ci === 1 || ci === 3
      return `<td class="${cell.free ? 'td td-free' : 'td'}">${cell.free ? '✦' : cell.value}</td>`
    }).join('')}</tr>`
  ).join('')

  const imgHtml = imagePreview
    ? `<img src="${imagePreview}" style="height:38px;max-width:120px;object-fit:contain;display:inline-block;vertical-align:middle;margin-right:8px;" />`
    : ''

  return template
    .replace(/{{NUMERO}}/g, String(numero).padStart(4, '0'))
    .replace(/{{PREMIO}}/g, premio || 'A definir')
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
    local: 'Clube Recreativo Central',
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
      toast.success('Template salvo!')
      setTimeout(() => setSaved(false), 3000)
    } catch { toast.error('Erro ao salvar template.') }
    finally { setSaving(false) }
  }

  const handleReset = () => {
    if (!confirm('Restaurar o template padrão?')) return
    setHtml(DEFAULT_TEMPLATE)
    toast.success('Template restaurado.')
  }

  const copyVar = (v) => navigator.clipboard.writeText(v).then(() => toast.success(`${v} copiado!`))

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-[#0D1F3C]" /> Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Edite o HTML/CSS. Clique nas variáveis para copiar.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={14} /> Restaurar padrão
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-6 flex gap-1 items-center">
          {[{ key: 'editor', label: '📝 Editor HTML/CSS' }, { key: 'preview', label: '👁 Preview A4' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-[#0D1F3C] text-[#0D1F3C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button onClick={() => setPreviewRows(gerarCartelaPreview())} className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D1F3C] py-2 transition-colors">
              <RefreshCw size={12} /> Novos números
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
            <div className="flex items-start justify-center bg-gray-300 overflow-auto p-8" style={{ minHeight: 'calc(100vh - 160px)' }}>
              <div className="shadow-2xl" style={{ width: 794 }}>
                <iframe ref={iframeRef} title="Preview A4" style={{ width: 794, height: 1123, border: 'none', display: 'block' }} />
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
