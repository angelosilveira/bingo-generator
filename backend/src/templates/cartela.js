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
    font-size:40px;
    font-weight:900;
    text-align:center;
    letter-spacing:3px;
    width:20%;
    padding:13px 0;
  ">${c}</td>`).join('')

  const bodyRows = rows.map(row =>
    `<tr>${row.map(cell => `<td style="
      background:#fff;
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:${cell.free ? '34px' : '44px'};
      font-weight:900;
      text-align:center;
      color:${cell.free ? '#E8A000' : '#0D1F3C'};
      height:74px;
      vertical-align:middle;
      border:1px solid #E2E8F2;
      padding:0;
    ">${cell.free ? '✦' : cell.value}</td>`).join('')}</tr>`
  ).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" style="height:52px;max-width:100%;object-fit:contain;display:block;margin:0 auto 6px;" />`
    : `<div style="font-size:42px;text-align:center;line-height:1;margin-bottom:4px;">🎁</div>`

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

<!-- ══════════════════════════════════════════════ -->
<!--  TOPO: HEADER SPLIT — BINGO | Nº | PRÊMIO    -->
<!-- ══════════════════════════════════════════════ -->
<div style="
  display:flex;
  gap:12px;
  margin-bottom:12px;
  flex-shrink:0;
  align-items:stretch;
">

  <!-- BINGO title block -->
  <div style="
    background:linear-gradient(135deg,#0D1F3C 0%,#182E50 60%,#0D1F3C 100%);
    border-radius:12px;
    padding:14px 24px 12px;
    flex:0 0 auto;
    display:flex;
    flex-direction:column;
    justify-content:center;
    position:relative;
    overflow:hidden;
  ">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(-55deg,transparent,transparent 16px,rgba(232,160,0,.07) 16px,rgba(232,160,0,.07) 32px);pointer-events:none;"></div>
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:82px;
      line-height:.95;
      color:#E8A000;
      letter-spacing:8px;
      text-shadow:0 4px 20px rgba(0,0,0,.5),3px 3px 0 rgba(0,0,0,.35);
      position:relative;
    ">BINGO</div>
    <div style="height:3px;background:linear-gradient(90deg,#E8A000 40%,transparent);margin-top:6px;border-radius:2px;"></div>
  </div>

  <!-- Coluna direita: Nº da cartela + Prêmio em destaque -->
  <div style="flex:1;display:flex;flex-direction:column;gap:10px;">

    <!-- Nº da Cartela — compacto, não mais destaque que o prêmio -->
    <div style="
      display:flex;
      align-items:center;
      background:#fff;
      border:2px solid #0D1F3C;
      border-radius:8px;
      overflow:hidden;
      height:44px;
    ">
      <div style="
        background:#0D1F3C;
        color:#E8A000;
        font-family:Arial,sans-serif;
        font-size:10px;
        font-weight:900;
        letter-spacing:1.5px;
        padding:0 12px;
        height:100%;
        display:flex;
        align-items:center;
        white-space:nowrap;
        text-transform:uppercase;
      ">Nº DA CARTELA</div>
      <div style="
        flex:1;
        font-family:Impact,'Arial Black',Arial,sans-serif;
        font-size:26px;
        font-weight:900;
        color:#C0392B;
        letter-spacing:3px;
        text-align:center;
        padding:0 12px;
      ">${numFormatado}</div>
    </div>

    <!-- PRÊMIO — protagonista -->
    <div style="
      flex:1;
      background:#fff;
      border:2px solid #0D1F3C;
      border-radius:10px;
      overflow:hidden;
      display:flex;
      align-items:stretch;
    ">
      <!-- Label lateral PRÊMIO -->
      <div style="
        background:#E8A000;
        color:#0D1F3C;
        font-family:Arial,sans-serif;
        font-size:10px;
        font-weight:900;
        writing-mode:vertical-rl;
        transform:rotate(180deg);
        padding:10px 7px;
        letter-spacing:3px;
        text-transform:uppercase;
        flex-shrink:0;
        display:flex;
        align-items:center;
        justify-content:center;
      ">PRÊMIO</div>

      <!-- Imagem + nome -->
      <div style="flex:1;display:flex;align-items:center;padding:8px 14px;gap:14px;min-width:0;">
        <!-- Imagem ou emoji -->
        <div style="flex-shrink:0;width:64px;height:64px;display:flex;align-items:center;justify-content:center;">
          ${premioImg}
        </div>
        <!-- Nome do prêmio -->
        <div style="min-width:0;">
          <div style="
            font-family:Impact,'Arial Black',Arial,sans-serif;
            font-size:22px;
            font-weight:900;
            color:#0D1F3C;
            line-height:1.1;
            word-break:break-word;
          ">${premio || 'A DEFINIR'}</div>
          <div style="
            font-size:11px;
            color:#888;
            font-weight:600;
            margin-top:3px;
            font-style:italic;
          ">Prêmio principal do evento</div>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ══════════════════════════════════════════════ -->
<!--         TABELA BINGO — FULL WIDTH             -->
<!-- ══════════════════════════════════════════════ -->
<div style="
  flex:1;
  border-radius:12px;
  overflow:hidden;
  border:3px solid #0D1F3C;
  margin-bottom:12px;
  display:flex;
  flex-direction:column;
">
  <table style="height:100%;">
    <thead>
      <tr style="height:62px;">${thCells}</tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>
</div>

<!-- ══════════════════════════════════════════════ -->
<!--  FAIXA INFO HORIZONTAL — DATA / HORA / LOCAL  -->
<!-- ══════════════════════════════════════════════ -->
<div style="
  background:#0D1F3C;
  border-radius:10px;
  display:flex;
  align-items:stretch;
  margin-bottom:14px;
  flex-shrink:0;
  overflow:hidden;
">
  ${[
    { icon: '📅', label: 'DATA', value: dataFormatada },
    { icon: '⏰', label: 'HORÁRIO', value: horario || '--:--' },
    { icon: '📍', label: 'LOCAL', value: local || '—', wrap: true },
  ].map((item, i) => `
  <div style="
    flex:${item.wrap ? 2 : 1};
    padding:13px 18px;
    ${i < 2 ? 'border-right:1px solid rgba(255,255,255,.12);' : ''}
    display:flex;
    align-items:center;
    gap:12px;
    min-width:0;
  ">
    <span style="font-size:22px;flex-shrink:0;">${item.icon}</span>
    <div style="min-width:0;flex:1;">
      <div style="font-size:9px;font-weight:900;color:#E8A000;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">${item.label}</div>
      <div style="font-size:15px;font-weight:700;color:#fff;${item.wrap ? 'white-space:normal;line-height:1.3;' : 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'}">${item.value}</div>
    </div>
  </div>`).join('')}

  <!-- Divisor + Valor -->
  <div style="width:1px;background:rgba(255,255,255,.12);flex-shrink:0;"></div>
  <div style="
    background:#E8A000;
    padding:12px 22px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
    min-width:170px;
  ">
    <div style="font-size:9px;font-weight:900;color:#0D1F3C;letter-spacing:2px;text-transform:uppercase;margin-bottom:3px;">Valor da Cartela</div>
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:34px;
      font-weight:900;
      color:#0D1F3C;
      letter-spacing:1px;
      line-height:1;
      text-shadow:0 1px 0 rgba(255,255,255,.3);
    ">${valorCartela}</div>
  </div>
</div>

<!-- ══════════════════════════════════════════════ -->
<!--              LINHA TESOURA                    -->
<!-- ══════════════════════════════════════════════ -->
<div style="display:flex;align-items:center;gap:0;flex-shrink:0;padding:4px 0 12px;">
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
  <div style="display:flex;align-items:center;gap:6px;padding:0 14px;color:#aab;white-space:nowrap;">
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
    <span style="font-size:9px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">Destaque aqui</span>
    <span style="font-size:14px;transform:rotate(-90deg);display:inline-block;">✂</span>
  </div>
  <div style="flex:1;border-top:2px dashed #b0bcd0;"></div>
</div>

<!-- ══════════════════════════════════════════════ -->
<!--                 CANHOTO                       -->
<!-- ══════════════════════════════════════════════ -->
<div style="
  background:#fff;
  border:2px solid #0D1F3C;
  border-radius:10px;
  display:flex;
  align-items:stretch;
  overflow:hidden;
  flex-shrink:0;
">
  <!-- Tag CANHOTO -->
  <div style="
    background:#0D1F3C;
    color:#E8A000;
    font-family:Arial,sans-serif;
    font-size:10px;
    font-weight:900;
    writing-mode:vertical-rl;
    transform:rotate(180deg);
    padding:14px 9px;
    letter-spacing:3px;
    text-transform:uppercase;
    flex-shrink:0;
    display:flex;
    align-items:center;
    justify-content:center;
  ">CANHOTO</div>

  <!-- Campos -->
  <div style="flex:1;padding:14px 20px;display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
    <div style="
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:15px;
      color:#0D1F3C;
      letter-spacing:1px;
    ">Nº <span style="color:#C0392B;font-size:18px;">${numFormatado}</span>
    <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:400;color:#999;margin-left:10px;">${dataFormatada}${local ? ' · ' + local : ''}</span>
    </div>
    ${['NOME', 'TELEFONE', 'ENDEREÇO'].map(f => `
    <div style="display:flex;align-items:flex-end;gap:8px;">
      <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#0D1F3C;white-space:nowrap;padding-bottom:3px;min-width:72px;">${f}:</span>
      <div style="flex:1;border-bottom:1.5px solid #0D1F3C;min-height:22px;"></div>
    </div>`).join('')}
  </div>

  <!-- Logo do canhoto -->
  <div style="
    background:#F2F5FA;
    border-left:2px solid #0D1F3C;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:14px 18px;
    gap:2px;
    flex-shrink:0;
    min-width:110px;
  ">
    <div style="font-size:28px;line-height:1;margin-bottom:3px;">🎱</div>
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:18px;font-weight:900;color:#0D1F3C;letter-spacing:3px;">BINGO</div>
    <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:#E8A000;font-style:italic;">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`
}
