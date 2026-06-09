import { useState, useEffect } from 'react'
import { Save, RefreshCw, Code2, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:794px; height:1123px; background:#F2F5FA; font-family:Arial,sans-serif; overflow:hidden; }
  body { display:flex; flex-direction:column; padding:20px; gap:0; }
  table { border-collapse:collapse; width:100%; }
  .th { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:40px; font-weight:900; text-align:center; letter-spacing:3px; width:20%; padding:13px 0; }
  .th-d { background:#0D1F3C; color:#fff; }
  .th-g { background:#E8A000; color:#fff; }
  .td { font-family:Impact,'Arial Black',Arial,sans-serif; font-size:44px; font-weight:900; text-align:center; color:#0D1F3C; height:74px; vertical-align:middle; border:1px solid #E2E8F2; background:#fff; }
  .td-free { font-size:34px; color:#E8A000; }
  .prize-img { height:52px; max-width:100%; object-fit:contain; display:block; margin:0 auto 4px; }
</style>
</head>
<body>

<!-- HEADER: BINGO + Nº + PRÊMIO -->
<div style="display:flex;gap:12px;margin-bottom:12px;flex-shrink:0;align-items:stretch;">
  <div style="background:linear-gradient(135deg,#0D1F3C 0%,#182E50 60%,#0D1F3C 100%);border-radius:12px;padding:14px 24px 12px;flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(-55deg,transparent,transparent 16px,rgba(232,160,0,.07) 16px,rgba(232,160,0,.07) 32px);pointer-events:none;"></div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:82px;line-height:.95;color:#E8A000;letter-spacing:8px;text-shadow:0 4px 20px rgba(0,0,0,.5),3px 3px 0 rgba(0,0,0,.35);position:relative;">BINGO</div>
    <div style="height:3px;background:linear-gradient(90deg,#E8A000 40%,transparent);margin-top:6px;border-radius:2px;"></div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
    <div style="display:flex;align-items:center;background:#fff;border:2px solid #0D1F3C;border-radius:8px;overflow:hidden;height:44px;">
      <div style="background:#0D1F3C;color:#E8A000;font-size:10px;font-weight:900;letter-spacing:1.5px;padding:0 12px;height:100%;display:flex;align-items:center;white-space:nowrap;text-transform:uppercase;">Nº DA CARTELA</div>
      <div style="flex:1;font-family:Impact,'Arial Black',Arial,sans-serif;font-size:26px;font-weight:900;color:#C0392B;letter-spacing:3px;text-align:center;padding:0 12px;">{{NUMERO}}</div>
    </div>
    <div style="flex:1;background:#fff;border:2px solid #0D1F3C;border-radius:10px;overflow:hidden;display:flex;align-items:stretch;">
      <div style="background:#E8A000;color:#0D1F3C;font-size:10px;font-weight:900;writing-mode:vertical-rl;transform:rotate(180deg);padding:10px 7px;letter-spacing:3px;text-transform:uppercase;flex-shrink:0;display:flex;align-items:center;justify-content:center;">PRÊMIO</div>
      <div style="flex:1;display:flex;align-items:center;padding:8px 14px;gap:14px;min-width:0;">
        <div style="flex-shrink:0;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">{{QR_CODE}}</div>
        <div style="min-width:0;">
          <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:22px;font-weight:900;color:#0D1F3C;line-height:1.1;word-break:break-word;">{{PREMIO}}</div>
          <div style="font-size:11px;color:#888;font-weight:600;margin-top:3px;font-style:italic;">Prêmio principal do evento</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TABELA FULL WIDTH -->
<div style="flex:1;border-radius:12px;overflow:hidden;border:3px solid #0D1F3C;margin-bottom:12px;display:flex;flex-direction:column;">
  <table style="height:100%;">
    <thead>
      <tr style="height:62px;">
        <td class="th th-d">B</td><td class="th th-g">I</td>
        <td class="th th-d">N</td><td class="th th-g">G</td>
        <td class="th th-d">O</td>
      </tr>
    </thead>
    <tbody>{{TABELA}}</tbody>
  </table>
</div>

<!-- FAIXA INFO -->
<div style="background:#0D1F3C;border-radius:10px;display:flex;align-items:stretch;margin-bottom:14px;flex-shrink:0;overflow:hidden;">
  <div style="flex:1;padding:13px 18px;border-right:1px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:12px;">
    <span style="font-size:22px;flex-shrink:0;">📅</span>
    <div><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">DATA</div><div style="font-size:15px;font-weight:700;color:#fff;white-space:nowrap;">{{DATA}}</div></div>
  </div>
  <div style="flex:1;padding:13px 18px;border-right:1px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:12px;">
    <span style="font-size:22px;flex-shrink:0;">⏰</span>
    <div><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">HORÁRIO</div><div style="font-size:15px;font-weight:700;color:#fff;white-space:nowrap;">{{HORARIO}}</div></div>
  </div>
  <div style="flex:2;padding:13px 18px;border-right:1px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:12px;min-width:0;">
    <span style="font-size:22px;flex-shrink:0;">📍</span>
    <div style="min-width:0;flex:1;"><div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">LOCAL</div><div style="font-size:15px;font-weight:700;color:#fff;white-space:normal;line-height:1.3;">{{LOCAL}}</div></div>
  </div>
  <div style="background:#E8A000;padding:12px 22px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;min-width:170px;">
    <div style="font-size:9px;font-weight:900;color:#0D1F3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">Valor da Cartela</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:34px;font-weight:900;color:#0D1F3C;letter-spacing:1px;line-height:1;">{{VALOR}}</div>
  </div>
</div>

<!-- TESOURA -->
<div style="display:flex;align-items:center;flex-shrink:0;padding:4px 0 12px;">
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
  <div style="display:flex;align-items:center;gap:6px;padding:0 14px;color:#aab;white-space:nowrap;">
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
    <span style="font-size:9px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">Destaque aqui</span>
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
  </div>
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
</div>

<!-- CANHOTO -->
<div style="background:#fff;border:2px solid #0D1F3C;border-radius:10px;display:flex;align-items:stretch;overflow:hidden;flex-shrink:0;">
  <div style="background:#0D1F3C;color:#E8A000;font-size:10px;font-weight:900;writing-mode:vertical-rl;transform:rotate(180deg);padding:14px 9px;letter-spacing:3px;text-transform:uppercase;flex-shrink:0;display:flex;align-items:center;justify-content:center;">CANHOTO</div>
  <div style="flex:1;padding:14px 20px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:15px;color:#0D1F3C;letter-spacing:1px;">Nº <span style="color:#C0392B;font-size:18px;">{{NUMERO}}</span></div>
    <div style="display:flex;align-items:flex-end;gap:8px;"><span style="font-size:12px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:72px;">NOME:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:22px;"></div></div>
    <div style="display:flex;align-items:flex-end;gap:8px;"><span style="font-size:12px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:72px;">TELEFONE:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:22px;"></div></div>
    <div style="display:flex;align-items:flex-end;gap:8px;"><span style="font-size:12px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:72px;">ENDEREÇO:</span><div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:22px;"></div></div>
  </div>
  <div style="background:#F2F5FA;border-left:2px solid #0D1F3C;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 18px;gap:2px;flex-shrink:0;min-width:110px;">
    <div style="font-size:28px;line-height:1;margin-bottom:3px;">🎱</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:18px;font-weight:900;color:#0D1F3C;letter-spacing:3px;">BINGO</div>
    <div style="font-size:11px;font-weight:700;color:#E8A000;font-style:italic;">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`

export default function TemplatePage() {
  const [html, setHtml] = useState(DEFAULT_TEMPLATE)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewing, setPreviewing] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')  // HTML renderizado pelo backend
  const [tab, setTab] = useState('editor')

  // Carrega template salvo via API do backend
  useEffect(() => {
    fetch(`${API_URL}/api/template`)
      .then(r => r.json())
      .then(d => { if (d.html) setHtml(d.html) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Quando entra no preview, busca HTML renderizado do backend
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
      const text = await res.text()
      setPreviewHtml(text)  // seta como srcdoc via React state — sem postMessage
    } catch {
      toast.error('Erro ao gerar preview. Verifique se o backend está online.')
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

  const handleReset = () => {
    if (!confirm('Restaurar o template padrão?')) return
    setHtml(DEFAULT_TEMPLATE)
    toast.success('Template restaurado.')
  }

  const handleRefreshPreview = () => loadPreview(html)

  const copyVar = (v) =>
    navigator.clipboard.writeText(v).then(() => toast.success(`${v} copiado!`))

  return (
    <Layout>
      <div className="flex-1 flex flex-col min-h-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Code2 size={20} className="text-[#0D1F3C]" /> Editor de Template
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edite o HTML/CSS. Clique nas variáveis para copiar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={14} /> Restaurar padrão
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
              {saved ? <CheckCircle size={15} /> : <Save size={15} />}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar template'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-1 items-center">
          {[
            { key: 'editor', label: '📝 Editor HTML/CSS' },
            { key: 'preview', label: '👁 Preview A4' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-[#0D1F3C] text-[#0D1F3C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
          {tab === 'preview' && (
            <button onClick={handleRefreshPreview} disabled={previewing}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0D1F3C] py-2 transition-colors disabled:opacity-50">
              <RefreshCw size={12} className={previewing ? 'animate-spin' : ''} />
              {previewing ? 'Carregando…' : 'Novos números'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Carregando template…
            </div>
          ) : tab === 'editor' ? (
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              spellCheck={false}
              className="w-full h-full resize-none font-mono text-sm p-5 bg-gray-950 text-green-400 focus:outline-none"
              style={{ minHeight: 'calc(100vh - 160px)' }}
            />
          ) : (
            <div
              className="flex items-start justify-center bg-gray-300 overflow-auto p-8"
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
                {/* srcdoc setado via React state — sem Blob URL, sem postMessage, sem interferência de extensão */}
                {previewHtml && (
                  <iframe
                    key={previewHtml.slice(-20)} /* recria quando muda */
                    srcDoc={previewHtml}
                    title="Preview A4"
                    sandbox="allow-same-origin"
                    style={{ width: 794, height: 1123, border: 'none', display: 'block', background: '#F2F5FA' }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Variáveis */}
        {tab === 'editor' && (
          <div className="bg-gray-900 border-t border-gray-700 px-5 py-2.5 flex gap-3 flex-wrap items-center">
            <span className="text-xs text-gray-500 shrink-0">Variáveis:</span>
            {['{{NUMERO}}','{{PREMIO}}','{{DATA}}','{{HORARIO}}','{{LOCAL}}','{{VALOR}}','{{QR_CODE}}','{{TABELA}}'].map(v => (
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
