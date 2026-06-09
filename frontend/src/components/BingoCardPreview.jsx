import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { gerarCartelaPreview } from '../utils/bingoGenerator'

const COLS = ['B', 'I', 'N', 'G', 'O']
const COL_COLORS = ['#1a3a6b', '#f5a623', '#1a3a6b', '#f5a623', '#1a3a6b']

export default function BingoCardPreview({ form, imagePreview }) {
  const [rows, setRows] = useState(() => gerarCartelaPreview())

  const refresh = useCallback(() => setRows(gerarCartelaPreview()), [])

  const dataFormatada = form.data
    ? new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Título do preview */}
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          Preview da cartela
        </span>
        <button
          type="button"
          onClick={refresh}
          title="Gerar nova amostra de números"
          className="flex items-center gap-1.5 text-xs text-[#1a3a6b] hover:text-[#f5a623] font-semibold transition-colors"
        >
          <RefreshCw size={13} />
          Novo exemplo
        </button>
      </div>

      {/* Cartela */}
      <div
        className="w-full rounded-2xl p-4 flex gap-3 shadow-lg"
        style={{ background: '#dde8fb', border: '2px solid #b8ccee' }}
      >
        {/* ── Coluna esquerda ── */}
        <div className="flex-1 min-w-0">
          {/* Título BINGO */}
          <div className="text-center mb-2 leading-none">
            <span
              className="font-black tracking-wide"
              style={{
                fontSize: 'clamp(28px, 8vw, 48px)',
                color: '#1a3a6b',
                textShadow: '2px 2px 0 #fff, -1px -1px 0 #0a1f45',
              }}
            >
              BINGO
            </span>
          </div>

          {/* Nº cartela */}
          <div className="flex justify-center mb-2">
            <div className="text-center">
              <div
                className="text-white font-black text-xs px-3 py-0.5 rounded-t-md tracking-widest"
                style={{ background: '#1a3a6b', fontSize: 9 }}
              >
                Nº DA CARTELA
              </div>
              <div
                className="font-black border-2 rounded-b-md px-4 bg-white"
                style={{ color: '#e03030', fontSize: 'clamp(16px, 5vw, 28px)', borderColor: '#1a3a6b' }}
              >
                0001
              </div>
            </div>
          </div>

          {/* Tabela */}
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
            <thead>
              <tr>
                {COLS.map((col, i) => (
                  <th
                    key={col}
                    className="text-white font-black text-center rounded-lg"
                    style={{
                      background: COL_COLORS[i],
                      fontSize: 'clamp(13px, 4vw, 22px)',
                      padding: '5px 0',
                      width: '20%',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="text-center font-black rounded-lg bg-white"
                      style={{
                        fontSize: cell.free ? 'clamp(13px, 4vw, 20px)' : 'clamp(13px, 4vw, 22px)',
                        padding: '5px 0',
                        height: 40,
                        color: '#111',
                      }}
                    >
                      {cell.free ? '🎁' : cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Coluna direita ── */}
        <div className="flex flex-col gap-2" style={{ width: 130 }}>
          {/* Prêmio */}
          <div
            className="rounded-xl p-2 text-center bg-white"
            style={{ border: '2px dashed #1a3a6b' }}
          >
            <div
              className="text-white font-black text-xs rounded-lg mb-1.5 py-0.5 tracking-widest"
              style={{ background: '#1a3a6b', fontSize: 9 }}
            >
              PRÊMIO
            </div>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="prêmio"
                className="w-full rounded-lg object-contain"
                style={{ maxHeight: 72 }}
              />
            ) : (
              <div className="text-3xl py-1">🎁</div>
            )}
            {form.premio && (
              <p className="text-xs font-bold text-gray-600 mt-1 leading-tight line-clamp-2">
                {form.premio}
              </p>
            )}
          </div>

          {/* Data */}
          <InfoRow icon="📅" label="DATA" value={dataFormatada} />

          {/* Horário */}
          <InfoRow icon="🕐" label="HORÁRIO" value={form.horario || '--:--'} />

          {/* Local */}
          <InfoRow icon="📍" label="LOCAL" value={form.local || '—'} truncate />

          {/* Valor */}
          <div
            className="rounded-xl p-2 text-center mt-auto"
            style={{ background: '#1a3a6b' }}
          >
            <div className="text-white font-black tracking-widest" style={{ fontSize: 9 }}>
              VALOR DA CARTELA
            </div>
            <div
              className="font-black text-white rounded-lg mt-1 py-0.5"
              style={{ background: '#f5a623', fontSize: 'clamp(14px, 4vw, 20px)' }}
            >
              {form.valorCartela || 'R$ —'}
            </div>
          </div>
        </div>
      </div>

      {/* Linha canhoto */}
      <div className="w-full flex items-center gap-2 text-gray-400 -my-1">
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        <span className="text-sm">✂</span>
        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
      </div>

      {/* Canhoto */}
      <div
        className="w-full bg-white rounded-2xl flex items-center gap-3 p-3"
        style={{ border: '2px solid #dde8fb' }}
      >
        <div
          className="text-white font-black text-xs rounded-lg px-2 py-3 tracking-widest shrink-0"
          style={{ background: '#1a3a6b', writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 9 }}
        >
          CANHOTO
        </div>
        <div className="flex-1 space-y-1.5 text-xs text-gray-600">
          <div className="font-black text-sm" style={{ color: '#1a3a6b' }}>
            Nº DA CARTELA: <span style={{ color: '#e03030' }}>0001</span>
          </div>
          {['NOME', 'TELEFONE', 'ENDEREÇO'].map(f => (
            <div key={f} className="flex gap-2 items-end">
              <span className="font-bold whitespace-nowrap">{f}:</span>
              <span className="flex-1 border-b border-gray-400" />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center shrink-0">
          <span className="text-2xl">🎱</span>
          <span className="font-black text-sm" style={{ color: '#1a3a6b' }}>BINGO</span>
          <span className="font-bold italic text-xs" style={{ color: '#f5a623' }}>Boa sorte! ♡</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Os números são gerados aleatoriamente — este é apenas um exemplo visual.
      </p>
    </div>
  )
}

function InfoRow({ icon, label, value, truncate }) {
  return (
    <div
      className="flex items-center gap-1.5 bg-white rounded-full px-2 py-1"
      style={{ border: '2px solid #1a3a6b' }}
    >
      <div
        className="rounded-full flex items-center justify-center shrink-0 text-xs"
        style={{ background: '#1a3a6b', width: 22, height: 22 }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black" style={{ color: '#f5a623', fontSize: 8, letterSpacing: 1 }}>
          {label}
        </div>
        <div
          className={`font-bold text-xs ${truncate ? 'truncate' : ''}`}
          style={{ color: '#1a3a6b' }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
