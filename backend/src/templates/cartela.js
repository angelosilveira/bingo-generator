export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const COLS = ['B', 'I', 'N', 'G', 'O']
  const COL_BG = ['#1a3a6b', '#f5a623', '#1a3a6b', '#f5a623', '#1a3a6b']

  const thCells = COLS.map((c, i) => `
    <td style="
      background:${COL_BG[i]};
      color:#fff;
      font-family:'Arial Black',Arial,sans-serif;
      font-size:26px;
      font-weight:900;
      text-align:center;
      padding:10px 0;
      border-radius:8px;
      width:20%;
    ">${c}</td>`).join('')

  const bodyRows = rows.map(row => {
    const cells = row.map(cell => `
      <td style="
        background:#fff;
        font-family:'Arial Black',Arial,sans-serif;
        font-size:${cell.free ? '24px' : '26px'};
        font-weight:900;
        text-align:center;
        padding:10px 0;
        border-radius:8px;
        color:#111;
        height:52px;
      ">${cell.free ? '🎁' : cell.value}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" style="width:100%;max-height:90px;object-fit:contain;border-radius:8px;display:block;margin:0 auto;" />`
    : `<div style="font-size:36px;text-align:center;padding:8px 0;">🎁</div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    width:794px;
    min-height:1050px;
    background:#e8f0fe;
    font-family:'Arial Black',Arial,sans-serif;
    padding:20px;
    display:flex;
    flex-direction:column;
    gap:10px;
  }
  table { border-collapse:separate; border-spacing:4px; width:100%; }
</style>
</head>
<body>

<!-- CARTELA PRINCIPAL -->
<div style="
  background:#dde8fb;
  border-radius:20px;
  border:2px solid #b8ccee;
  padding:18px;
  display:flex;
  gap:16px;
">

  <!-- ESQUERDA -->
  <div style="flex:1;min-width:0;">

    <!-- Título BINGO -->
    <div style="text-align:center;margin-bottom:6px;">
      <span style="
        font-family:'Arial Black',Arial,sans-serif;
        font-size:64px;
        font-weight:900;
        color:#1a3a6b;
        text-shadow:3px 3px 0 #fff,-1px -1px 0 #0a1f45;
        letter-spacing:2px;
        line-height:1;
      ">BINGO</span>
    </div>

    <!-- Nº Cartela -->
    <div style="display:flex;justify-content:center;margin-bottom:10px;">
      <div>
        <div style="
          background:#1a3a6b;
          color:#fff;
          font-size:10px;
          font-weight:900;
          padding:2px 12px;
          border-radius:6px 6px 0 0;
          text-align:center;
          letter-spacing:1px;
          font-family:Arial,sans-serif;
        ">Nº DA CARTELA</div>
        <div style="
          background:#fff;
          border:2px solid #1a3a6b;
          border-radius:0 0 8px 8px;
          padding:2px 20px;
          font-size:32px;
          font-weight:900;
          color:#e03030;
          letter-spacing:2px;
          text-align:center;
          font-family:'Arial Black',Arial,sans-serif;
        ">${numFormatado}</div>
      </div>
    </div>

    <!-- Tabela BINGO -->
    <table>
      <thead>
        <tr style="border-spacing:4px;">${thCells}</tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>

  </div>

  <!-- DIREITA -->
  <div style="width:190px;display:flex;flex-direction:column;gap:8px;">

    <!-- Prêmio -->
    <div style="
      border:2px dashed #1a3a6b;
      border-radius:12px;
      padding:8px;
      background:#fff;
      text-align:center;
    ">
      <div style="
        background:#1a3a6b;
        color:#fff;
        font-size:11px;
        font-weight:900;
        border-radius:6px;
        padding:3px 0;
        margin-bottom:6px;
        letter-spacing:1px;
        font-family:Arial,sans-serif;
      ">PRÊMIO</div>
      ${premioImg}
      ${premio ? `<div style="font-size:10px;color:#555;margin-top:4px;font-weight:700;font-family:Arial,sans-serif;">${premio}</div>` : ''}
    </div>

    <!-- Data -->
    <div style="
      display:flex;align-items:center;gap:6px;
      background:#fff;border-radius:20px;
      padding:5px 8px;border:2px solid #1a3a6b;
    ">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">📅</div>
      <div>
        <div style="font-size:8px;font-weight:900;color:#f5a623;letter-spacing:1px;font-family:Arial,sans-serif;">DATA</div>
        <div style="font-size:11px;font-weight:700;color:#1a3a6b;font-family:Arial,sans-serif;">${dataFormatada}</div>
      </div>
    </div>

    <!-- Horário -->
    <div style="
      display:flex;align-items:center;gap:6px;
      background:#fff;border-radius:20px;
      padding:5px 8px;border:2px solid #1a3a6b;
    ">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">🕐</div>
      <div>
        <div style="font-size:8px;font-weight:900;color:#f5a623;letter-spacing:1px;font-family:Arial,sans-serif;">HORÁRIO</div>
        <div style="font-size:11px;font-weight:700;color:#1a3a6b;font-family:Arial,sans-serif;">${horario || '--:--'}</div>
      </div>
    </div>

    <!-- Local -->
    <div style="
      display:flex;align-items:center;gap:6px;
      background:#fff;border-radius:20px;
      padding:5px 8px;border:2px solid #1a3a6b;
    ">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">📍</div>
      <div style="min-width:0;">
        <div style="font-size:8px;font-weight:900;color:#f5a623;letter-spacing:1px;font-family:Arial,sans-serif;">LOCAL</div>
        <div style="font-size:11px;font-weight:700;color:#1a3a6b;font-family:Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">${local}</div>
      </div>
    </div>

    <!-- Valor -->
    <div style="
      background:#1a3a6b;
      border-radius:12px;
      padding:8px;
      text-align:center;
      margin-top:auto;
    ">
      <div style="color:#fff;font-size:9px;font-weight:900;letter-spacing:1px;font-family:Arial,sans-serif;">VALOR DA CARTELA</div>
      <div style="
        background:#f5a623;
        color:#fff;
        font-size:24px;
        font-weight:900;
        border-radius:8px;
        padding:2px 0;
        margin-top:4px;
        font-family:'Arial Black',Arial,sans-serif;
        text-shadow:1px 1px 0 rgba(0,0,0,.2);
      ">${valorCartela}</div>
    </div>

  </div>
</div>

<!-- LINHA TESOURA -->
<div style="display:flex;align-items:center;gap:8px;color:#999;margin:2px 0;">
  <div style="flex:1;border-top:2px dashed #bbb;"></div>
  <span style="font-size:16px;">✂</span>
  <div style="flex:1;border-top:2px dashed #bbb;"></div>
</div>

<!-- CANHOTO -->
<div style="
  background:#fff;
  border-radius:14px;
  border:2px solid #dde8fb;
  display:flex;
  align-items:center;
  gap:14px;
  padding:10px 14px;
">
  <div style="
    background:#1a3a6b;
    color:#fff;
    font-size:10px;
    font-weight:900;
    writing-mode:vertical-rl;
    transform:rotate(180deg);
    padding:10px 6px;
    border-radius:8px;
    letter-spacing:2px;
    font-family:Arial,sans-serif;
  ">CANHOTO</div>

  <div style="flex:1;">
    <div style="font-size:13px;font-weight:900;color:#1a3a6b;margin-bottom:5px;font-family:'Arial Black',Arial,sans-serif;">
      Nº DA CARTELA: <span style="color:#e03030;">${numFormatado}</span>
    </div>
    ${['NOME','TELEFONE','ENDEREÇO'].map(f => `
    <div style="display:flex;gap:6px;align-items:flex-end;margin-bottom:4px;font-size:11px;font-family:Arial,sans-serif;">
      <span style="font-weight:700;white-space:nowrap;color:#333;">${f}:</span>
      <span style="flex:1;border-bottom:1px solid #999;"></span>
    </div>`).join('')}
  </div>

  <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
    <span style="font-size:28px;">🎱</span>
    <span style="font-size:18px;font-weight:900;color:#1a3a6b;font-family:'Arial Black',Arial,sans-serif;">BINGO</span>
    <span style="font-size:12px;font-weight:700;color:#f5a623;font-style:italic;font-family:Arial,sans-serif;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`
}
