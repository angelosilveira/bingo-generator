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
      font-size:34px;
      font-weight:900;
      text-align:center;
      padding:14px 0;
      border-radius:10px;
      width:20%;
    ">${c}</td>`).join('')

  const bodyRows = rows.map(row => {
    const cells = row.map(cell => `
      <td style="
        background:#fff;
        font-family:'Arial Black',Arial,sans-serif;
        font-size:${cell.free ? '30px' : '34px'};
        font-weight:900;
        text-align:center;
        padding:0;
        border-radius:10px;
        color:#111;
        height:72px;
        vertical-align:middle;
      ">${cell.free ? '🎁' : cell.value}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" style="width:100%;max-height:110px;object-fit:contain;border-radius:8px;display:block;margin:0 auto;" />`
    : `<div style="font-size:48px;text-align:center;padding:10px 0;">🎁</div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    width: 794px;
    height: 1123px;
    background: #e8f0fe;
    font-family: 'Arial Black', Arial, sans-serif;
    overflow: hidden;
  }
  body {
    padding: 24px 24px 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  table { border-collapse: separate; border-spacing: 5px; width: 100%; }
</style>
</head>
<body>

<!-- ═══ CARTELA PRINCIPAL ═══ -->
<div style="
  background: #dde8fb;
  border-radius: 22px;
  border: 2px solid #b8ccee;
  padding: 22px 20px;
  display: flex;
  gap: 18px;
  flex: 1;
">

  <!-- ESQUERDA -->
  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px;">

    <!-- Título BINGO -->
    <div style="text-align: center; line-height: 1;">
      <span style="
        font-family: 'Arial Black', Arial, sans-serif;
        font-size: 80px;
        font-weight: 900;
        color: #1a3a6b;
        text-shadow: 3px 3px 0 #fff, -2px -2px 0 #0a1f45;
        letter-spacing: 3px;
      ">BINGO</span>
    </div>

    <!-- Nº Cartela -->
    <div style="display: flex; justify-content: center;">
      <div>
        <div style="
          background: #1a3a6b;
          color: #fff;
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 900;
          padding: 3px 16px;
          border-radius: 8px 8px 0 0;
          text-align: center;
          letter-spacing: 1.5px;
        ">Nº DA CARTELA</div>
        <div style="
          background: #fff;
          border: 2px solid #1a3a6b;
          border-radius: 0 0 10px 10px;
          padding: 4px 28px;
          font-family: 'Arial Black', Arial, sans-serif;
          font-size: 42px;
          font-weight: 900;
          color: #e03030;
          letter-spacing: 3px;
          text-align: center;
        ">${numFormatado}</div>
      </div>
    </div>

    <!-- Tabela BINGO -->
    <div style="flex: 1;">
      <table style="height: 100%;">
        <thead>
          <tr style="height: 60px;">${thCells}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>

  </div>

  <!-- DIREITA -->
  <div style="width: 210px; display: flex; flex-direction: column; gap: 10px;">

    <!-- Prêmio -->
    <div style="
      border: 2px dashed #1a3a6b;
      border-radius: 14px;
      padding: 10px;
      background: #fff;
      text-align: center;
    ">
      <div style="
        background: #1a3a6b;
        color: #fff;
        font-family: Arial, sans-serif;
        font-size: 13px;
        font-weight: 900;
        border-radius: 8px;
        padding: 4px 0;
        margin-bottom: 8px;
        letter-spacing: 1.5px;
      ">PRÊMIO</div>
      ${premioImg}
      ${premio ? `<div style="font-size:13px;color:#444;margin-top:6px;font-weight:700;font-family:Arial,sans-serif;line-height:1.3;">${premio}</div>` : ''}
    </div>

    <!-- Data -->
    <div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:24px;padding:7px 10px;border:2px solid #1a3a6b;">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">📅</div>
      <div>
        <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#f5a623;letter-spacing:1px;">DATA</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1a3a6b;">${dataFormatada}</div>
      </div>
    </div>

    <!-- Horário -->
    <div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:24px;padding:7px 10px;border:2px solid #1a3a6b;">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🕐</div>
      <div>
        <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#f5a623;letter-spacing:1px;">HORÁRIO</div>
        <div style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#1a3a6b;">${horario || '--:--'}</div>
      </div>
    </div>

    <!-- Local -->
    <div style="display:flex;align-items:center;gap:8px;background:#fff;border-radius:24px;padding:7px 10px;border:2px solid #1a3a6b;">
      <div style="background:#1a3a6b;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">📍</div>
      <div style="min-width:0;">
        <div style="font-family:Arial,sans-serif;font-size:10px;font-weight:900;color:#f5a623;letter-spacing:1px;">LOCAL</div>
        <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#1a3a6b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:148px;">${local}</div>
      </div>
    </div>

    <!-- Valor -->
    <div style="background:#1a3a6b;border-radius:14px;padding:10px;text-align:center;margin-top:auto;">
      <div style="font-family:Arial,sans-serif;color:#fff;font-size:11px;font-weight:900;letter-spacing:1.5px;">VALOR DA CARTELA</div>
      <div style="
        background:#f5a623;
        color:#fff;
        font-family:'Arial Black',Arial,sans-serif;
        font-size:32px;
        font-weight:900;
        border-radius:10px;
        padding:4px 0;
        margin-top:6px;
        text-shadow:1px 1px 0 rgba(0,0,0,.2);
      ">${valorCartela}</div>
    </div>

  </div>
</div>

<!-- ═══ LINHA TESOURA ═══ -->
<div style="display:flex;align-items:center;gap:8px;color:#aaa;flex-shrink:0;">
  <div style="flex:1;border-top:2px dashed #ccc;"></div>
  <span style="font-size:18px;">✂</span>
  <div style="flex:1;border-top:2px dashed #ccc;"></div>
</div>

<!-- ═══ CANHOTO ═══ -->
<div style="
  background: #fff;
  border-radius: 16px;
  border: 2px solid #dde8fb;
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 16px;
  flex-shrink: 0;
">
  <!-- Tag vertical -->
  <div style="
    background: #1a3a6b;
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: 900;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    padding: 12px 8px;
    border-radius: 10px;
    letter-spacing: 3px;
    flex-shrink: 0;
  ">CANHOTO</div>

  <!-- Campos -->
  <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; padding: 4px 0;">
    <div style="font-family:'Arial Black',Arial,sans-serif;font-size:16px;font-weight:900;color:#1a3a6b;">
      Nº DA CARTELA: <span style="color:#e03030;">${numFormatado}</span>
    </div>

    ${['NOME', 'TELEFONE', 'ENDEREÇO'].map(f => `
    <div style="display:flex;gap:8px;align-items:flex-end;">
      <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#333;white-space:nowrap;">${f}:</span>
      <div style="flex:1;border-bottom:1.5px solid #aaa;min-height:24px;"></div>
    </div>`).join('')}
  </div>

  <!-- Logo -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;gap:2px;">
    <span style="font-size:36px;">🎱</span>
    <span style="font-family:'Arial Black',Arial,sans-serif;font-size:22px;font-weight:900;color:#1a3a6b;">BINGO</span>
    <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:#f5a623;font-style:italic;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`
}
