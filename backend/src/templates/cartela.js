export function gerarHTMLCartela({ numero, rows, premio, premioQrUrl, data, horario, local, valorCartela }) {
  // Garante formato R$ X,XX independente do que vier
  function fmtValor(v) {
    if (!v) return ''
    if (typeof v === 'string' && v.includes('R$')) return v
    const n = parseFloat(String(v).replace(',', '.'))
    if (isNaN(n)) return v
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  const valorFormatado = fmtValor(valorCartela)
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const COL_COLORS = [
    { bg: '#0D1F3C', text: '#fff' },
    { bg: '#E8A000', text: '#fff' },
    { bg: '#0D1F3C', text: '#fff' },
    { bg: '#E8A000', text: '#fff' },
    { bg: '#0D1F3C', text: '#fff' },
  ]
  const COLS = ['B', 'I', 'N', 'G', 'O']

  const thCells = COLS.map((c, i) => `<td style="
    background:${COL_COLORS[i].bg};color:${COL_COLORS[i].text};
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:40px;font-weight:900;text-align:center;
    letter-spacing:3px;width:20%;padding:13px 0;
  ">${c}</td>`).join('')

  const bodyRows = rows.map(row =>
    `<tr>${row.map(cell => `<td style="
      background:#fff;
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:${cell.free ? '34px' : '44px'};font-weight:900;
      text-align:center;color:${cell.free ? '#E8A000' : '#0D1F3C'};
      height:74px;vertical-align:middle;border:1px solid #E2E8F2;padding:0;
    ">${cell.free ? '✦' : cell.value}</td>`).join('')}</tr>`
  ).join('')

  // QR code: usa a imagem base64 gerada pelo backend, ou placeholder
  const qrBlock = premioQrUrl
    ? `<img src="${premioQrUrl}" style="width:90px;height:90px;display:block;margin:0 auto 6px;" />`
    : `<div style="width:90px;height:90px;margin:0 auto 6px;background:#f0f0f0;border:2px dashed #ccc;display:flex;align-items:center;justify-content:center;border-radius:6px;">
         <div style="font-size:10px;color:#999;text-align:center;line-height:1.3;padding:4px;">QR CODE<br>do prêmio</div>
       </div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:794px; height:1123px; background:#F2F5FA; font-family:Arial,sans-serif; overflow:hidden; }
  body { display:flex; flex-direction:column; padding:20px; gap:0; }
  table { border-collapse:collapse; width:100%; }
</style>
</head>
<body>

<!-- ══ HEADER ══ -->
<div style="display:flex;gap:12px;margin-bottom:12px;flex-shrink:0;align-items:stretch;">

  <!-- BINGO title -->
  <div style="background:linear-gradient(135deg,#0D1F3C 0%,#182E50 60%,#0D1F3C 100%);
    border-radius:12px;padding:14px 22px 12px;flex:0 0 auto;
    display:flex;flex-direction:column;justify-content:center;
    position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(
      -55deg,transparent,transparent 16px,rgba(232,160,0,.07) 16px,rgba(232,160,0,.07) 32px);
      pointer-events:none;"></div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:80px;
      line-height:.95;color:#E8A000;letter-spacing:8px;
      text-shadow:0 4px 20px rgba(0,0,0,.5),3px 3px 0 rgba(0,0,0,.35);position:relative;">BINGO</div>
    <div style="height:3px;background:linear-gradient(90deg,#E8A000 40%,transparent);margin-top:6px;border-radius:2px;"></div>
  </div>

  <!-- Nº + Prêmio + QR -->
  <div style="flex:1;display:flex;flex-direction:column;gap:8px;">

    <!-- Nº cartela — compacto -->
    <div style="display:flex;align-items:center;background:#fff;border:2px solid #0D1F3C;
      border-radius:8px;overflow:hidden;height:36px;">
      <div style="background:#0D1F3C;color:#E8A000;font-size:9px;font-weight:900;
        letter-spacing:1.5px;padding:0 10px;height:100%;display:flex;align-items:center;
        white-space:nowrap;text-transform:uppercase;font-family:Arial,sans-serif;">Nº DA CARTELA</div>
      <div style="flex:1;font-family:Impact,'Arial Black',Arial,sans-serif;
        font-size:22px;font-weight:900;color:#C0392B;letter-spacing:3px;
        text-align:center;padding:0 10px;">${numFormatado}</div>
    </div>

    <!-- Prêmio + QR code lado a lado -->
    <div style="flex:1;background:#fff;border:2px solid #0D1F3C;border-radius:10px;
      overflow:hidden;display:flex;align-items:stretch;">

      <!-- Label PRÊMIO vertical -->
      <div style="background:#E8A000;color:#0D1F3C;font-size:10px;font-weight:900;
        writing-mode:vertical-rl;transform:rotate(180deg);padding:10px 7px;
        letter-spacing:3px;text-transform:uppercase;flex-shrink:0;
        display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;">PRÊMIO</div>

      <!-- Nome do prêmio -->
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
        padding:10px 12px;min-width:0;border-right:2px solid #E2E8F2;">
        <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:20px;
          font-weight:900;color:#0D1F3C;line-height:1.15;word-break:break-word;">${premio || 'A DEFINIR'}</div>
        <div style="font-size:10px;color:#999;font-weight:600;margin-top:4px;
          font-style:italic;font-family:Arial,sans-serif;">Escaneie o QR para ver o prêmio</div>
      </div>

      <!-- QR Code -->
      <div style="width:120px;display:flex;flex-direction:column;align-items:center;
        justify-content:center;padding:10px;flex-shrink:0;gap:4px;">
        ${qrBlock}
        <div style="font-size:8px;color:#888;text-align:center;font-family:Arial,sans-serif;
          letter-spacing:.5px;font-weight:600;">VER PRÊMIO</div>
      </div>
    </div>

  </div>
</div>

<!-- ══ TABELA FULL WIDTH ══ -->
<div style="flex:1;border-radius:12px;overflow:hidden;border:3px solid #0D1F3C;
  margin-bottom:12px;display:flex;flex-direction:column;">
  <table style="height:100%;">
    <thead><tr style="height:62px;">${thCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</div>

<!-- ══ FAIXA INFO ══ -->
<div style="background:#0D1F3C;border-radius:10px;display:flex;align-items:stretch;
  margin-bottom:14px;flex-shrink:0;overflow:hidden;">
  ${[
    { icon: '📅', label: 'DATA', value: dataFormatada },
    { icon: '⏰', label: 'HORÁRIO', value: horario || '--:--' },
    { icon: '📍', label: 'LOCAL', value: local || '—', flex: 2, wrap: true },
  ].map((item, i) => `
  <div style="flex:${item.flex || 1};padding:12px 16px;
    ${i < 2 ? 'border-right:1px solid rgba(255,255,255,.12);' : ''}
    display:flex;align-items:center;gap:10px;min-width:0;">
    <span style="font-size:20px;flex-shrink:0;">${item.icon}</span>
    <div style="min-width:0;flex:1;">
      <div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;
        text-transform:uppercase;margin-bottom:2px;font-family:Arial,sans-serif;">${item.label}</div>
      <div style="font-size:14px;font-weight:700;color:#fff;
        font-family:Arial,sans-serif;${item.wrap
          ? 'white-space:normal;line-height:1.3;'
          : 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'
        }">${item.value}</div>
    </div>
  </div>`).join('')}
  <div style="width:1px;background:rgba(255,255,255,.12);flex-shrink:0;"></div>
  <div style="background:#E8A000;padding:10px 20px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;flex-shrink:0;min-width:165px;">
    <div style="font-size:9px;font-weight:900;color:#0D1F3C;letter-spacing:2px;
      text-transform:uppercase;margin-bottom:3px;font-family:Arial,sans-serif;">Valor da Cartela</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:32px;
      font-weight:900;color:#0D1F3C;letter-spacing:1px;line-height:1;">${valorFormatado}</div>
  </div>
</div>

<!-- ══ TESOURA ══ -->
<div style="display:flex;align-items:center;flex-shrink:0;padding:4px 0 12px;">
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
  <div style="display:flex;align-items:center;gap:6px;padding:0 14px;color:#aab;white-space:nowrap;">
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
    <span style="font-size:9px;letter-spacing:2px;font-weight:700;text-transform:uppercase;font-family:Arial,sans-serif;">Destaque aqui</span>
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
  </div>
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
</div>

<!-- ══ CANHOTO ══ -->
<div style="background:#fff;border:2px solid #0D1F3C;border-radius:10px;
  display:flex;align-items:stretch;overflow:hidden;flex-shrink:0;">
  <div style="background:#0D1F3C;color:#E8A000;font-size:10px;font-weight:900;
    writing-mode:vertical-rl;transform:rotate(180deg);padding:14px 9px;
    letter-spacing:3px;text-transform:uppercase;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;">CANHOTO</div>
  <div style="flex:1;padding:14px 20px;display:flex;flex-direction:column;
    justify-content:space-between;gap:8px;">
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:15px;color:#0D1F3C;letter-spacing:1px;">
      Nº <span style="color:#C0392B;font-size:18px;">${numFormatado}</span>
    </div>
    ${['NOME','TELEFONE','ENDEREÇO'].map(f => `
    <div style="display:flex;align-items:flex-end;gap:8px;">
      <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;
        color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:72px;">${f}:</span>
      <div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:22px;"></div>
    </div>`).join('')}
  </div>
  <div style="background:#F2F5FA;border-left:2px solid #0D1F3C;display:flex;
    flex-direction:column;align-items:center;justify-content:center;
    padding:14px 18px;gap:2px;flex-shrink:0;min-width:110px;">
    <div style="font-size:28px;line-height:1;margin-bottom:3px;">🎱</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:18px;
      font-weight:900;color:#0D1F3C;letter-spacing:3px;">BINGO</div>
    <div style="font-size:11px;font-weight:700;color:#E8A000;font-style:italic;
      font-family:Arial,sans-serif;">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`
}
