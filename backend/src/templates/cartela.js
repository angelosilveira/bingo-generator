export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
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
    background:${COL_COLORS[i].bg};
    color:${COL_COLORS[i].text};
    font-family:Impact,'Arial Black',Arial,sans-serif;
    font-size:42px;
    font-weight:900;
    text-align:center;
    letter-spacing:3px;
    width:20%;
    padding:14px 0;
  ">${c}</td>`).join('')

  const bodyRows = rows.map((row, ri) => {
    const cells = row.map((cell, ci) => {
      const isGold = ci === 1 || ci === 3
      return `<td style="
        background:#fff;
        font-family:Impact,'Arial Black',Arial,sans-serif;
        font-size:${cell.free ? '36px' : '46px'};
        font-weight:900;
        text-align:center;
        color:${cell.free ? '#E8A000' : '#0D1F3C'};
        height:80px;
        vertical-align:middle;
        border:1px solid #E2E8F2;
        padding:0;
      ">${cell.free ? '✦' : cell.value}</td>`
    }).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" style="height:38px;max-width:120px;object-fit:contain;display:inline-block;vertical-align:middle;margin-right:8px;" />`
    : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    width:794px; height:1123px;
    background:#F2F5FA;
    font-family:Arial,sans-serif;
    overflow:hidden;
  }
  body { display:flex; flex-direction:column; }
  table { border-collapse:collapse; width:100%; }
</style>
</head>
<body>

<!-- ╔══════════════════════════════════════╗ -->
<!-- ║            HEADER FAIXA             ║ -->
<!-- ╚══════════════════════════════════════╝ -->
<div style="
  background: linear-gradient(135deg, #0D1F3C 0%, #162E58 50%, #0D1F3C 100%);
  padding: 18px 32px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
">
  <!-- Padrão diagonal sutil -->
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(
    -55deg,
    transparent, transparent 18px,
    rgba(232,160,0,.06) 18px, rgba(232,160,0,.06) 36px
  );pointer-events:none;"></div>

  <!-- BINGO title -->
  <div style="position:relative;">
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:88px;
      line-height:1;
      color:#E8A000;
      letter-spacing:10px;
      text-shadow:0 4px 24px rgba(0,0,0,.5), 3px 3px 0 rgba(0,0,0,.3);
    ">BINGO</div>
    <div style="
      height:4px;
      background:linear-gradient(90deg,#E8A000,transparent);
      margin-top:4px;
      border-radius:2px;
    "></div>
  </div>

  <!-- Lado direito do header: nº + prêmio inline -->
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;position:relative;">

    <!-- Nº da Cartela -->
    <div style="display:flex;align-items:center;gap:0;">
      <div style="
        background:#E8A000;
        color:#0D1F3C;
        font-family:Arial,sans-serif;
        font-size:10px;
        font-weight:900;
        letter-spacing:2px;
        padding:5px 10px;
        border-radius:6px 0 0 6px;
        text-transform:uppercase;
        white-space:nowrap;
        line-height:1;
      ">Nº DA<br>CARTELA</div>
      <div style="
        background:#fff;
        color:#C0392B;
        font-family:Impact,'Arial Black',Arial,sans-serif;
        font-size:40px;
        font-weight:900;
        letter-spacing:4px;
        padding:0 18px;
        border-radius:0 6px 6px 0;
        line-height:1.15;
        min-width:130px;
        text-align:center;
      ">${numFormatado}</div>
    </div>

    <!-- Prêmio inline no header -->
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      background:rgba(255,255,255,.1);
      border:1px solid rgba(232,160,0,.4);
      border-radius:8px;
      padding:6px 12px;
      backdrop-filter:blur(4px);
    ">
      ${premioImg}
      <div>
        <div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:1.5px;text-transform:uppercase;">Prêmio</div>
        <div style="font-size:14px;font-weight:700;color:#fff;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${premio || 'A definir'}</div>
      </div>
    </div>

  </div>
</div>

<!-- ╔══════════════════════════════════════╗ -->
<!-- ║          TABELA FULL WIDTH          ║ -->
<!-- ╚══════════════════════════════════════╝ -->
<div style="flex:1;display:flex;flex-direction:column;background:#fff;border-left:4px solid #0D1F3C;border-right:4px solid #0D1F3C;">
  <table style="height:100%;">
    <thead>
      <tr style="height:68px;">${thCells}</tr>
    </thead>
    <tbody style="flex:1;">${bodyRows}</tbody>
  </table>
</div>

<!-- ╔══════════════════════════════════════╗ -->
<!-- ║        FAIXA INFO (4 blocos)        ║ -->
<!-- ╚══════════════════════════════════════╝ -->
<div style="
  background:#0D1F3C;
  display:flex;
  align-items:stretch;
  flex-shrink:0;
  border-left:4px solid #0D1F3C;
  border-right:4px solid #0D1F3C;
">
  ${[
    { icon: '📅', label: 'DATA', value: dataFormatada },
    { icon: '⏰', label: 'HORÁRIO', value: horario || '--:--' },
    { icon: '📍', label: 'LOCAL', value: local || '—' },
  ].map((item, i) => `
  <div style="
    flex:1;
    padding:12px 16px;
    border-right:1px solid rgba(255,255,255,.1);
    display:flex;
    align-items:center;
    gap:10px;
  ">
    <span style="font-size:22px;flex-shrink:0;opacity:.9;">${item.icon}</span>
    <div style="min-width:0;">
      <div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">${item.label}</div>
      <div style="font-size:15px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.value}</div>
    </div>
  </div>`).join('')}

  <!-- Valor da cartela -->
  <div style="
    background:#E8A000;
    padding:10px 20px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    min-width:160px;
  ">
    <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:900;color:#0D1F3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">Valor da Cartela</div>
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:32px;
      font-weight:900;
      color:#0D1F3C;
      letter-spacing:1px;
      line-height:1;
      text-shadow:0 1px 0 rgba(255,255,255,.3);
    ">${valorCartela}</div>
  </div>
</div>

<!-- ╔══════════════════════════════════════╗ -->
<!-- ║          LINHA TESOURA             ║ -->
<!-- ╚══════════════════════════════════════╝ -->
<div style="
  display:flex;
  align-items:center;
  gap:0;
  flex-shrink:0;
  padding:10px 0 8px;
">
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
  <div style="
    display:flex;
    align-items:center;
    gap:6px;
    padding:0 12px;
    color:#8899aa;
    font-size:13px;
    font-family:Arial,sans-serif;
    white-space:nowrap;
  ">
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
    <span style="font-size:10px;letter-spacing:1px;">DESTAQUE AQUI</span>
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
  </div>
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
</div>

<!-- ╔══════════════════════════════════════╗ -->
<!-- ║              CANHOTO               ║ -->
<!-- ╚══════════════════════════════════════╝ -->
<div style="
  background:#fff;
  border:2px solid #0D1F3C;
  border-radius:10px;
  margin:0 0 4px;
  display:flex;
  align-items:stretch;
  overflow:hidden;
  flex-shrink:0;
">
  <!-- Tag lateral CANHOTO -->
  <div style="
    background:#0D1F3C;
    color:#E8A000;
    font-family:Arial,sans-serif;
    font-size:10px;
    font-weight:900;
    writing-mode:vertical-rl;
    transform:rotate(180deg);
    padding:14px 9px;
    letter-spacing:3.5px;
    text-transform:uppercase;
    flex-shrink:0;
  ">CANHOTO</div>

  <!-- Campos -->
  <div style="flex:1;padding:12px 20px;display:flex;flex-direction:column;justify-content:space-between;">

    <!-- Nº da cartela -->
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:15px;
      color:#0D1F3C;
      letter-spacing:1px;
      margin-bottom:8px;
    ">Nº <span style="color:#C0392B;font-size:18px;">${numFormatado}</span>
    <span style="
      font-family:Arial,sans-serif;
      font-size:10px;
      font-weight:400;
      color:#888;
      margin-left:12px;
      letter-spacing:.5px;
    ">${dataFormatada} · ${local || ''}</span>
    </div>

    ${['NOME', 'TELEFONE', 'ENDEREÇO'].map(f => `
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;">
      <span style="
        font-family:Arial,sans-serif;
        font-size:11px;
        font-weight:700;
        color:#0D1F3C;
        white-space:nowrap;
        padding-bottom:3px;
        min-width:68px;
      ">${f}:</span>
      <div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:20px;"></div>
    </div>`).join('')}
  </div>

  <!-- Bloco direito do canhoto -->
  <div style="
    background:#F2F5FA;
    border-left:2px solid #0D1F3C;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:12px 18px;
    gap:1px;
    flex-shrink:0;
    min-width:110px;
  ">
    <div style="font-size:28px;line-height:1;margin-bottom:2px;">🎱</div>
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:18px;
      font-weight:900;
      color:#0D1F3C;
      letter-spacing:3px;
    ">BINGO</div>
    <div style="
      font-family:Arial,sans-serif;
      font-size:11px;
      font-weight:700;
      color:#E8A000;
      font-style:italic;
    ">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`
}
