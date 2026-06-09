export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const COLS = ['B', 'I', 'N', 'G', 'O']
  const COL_BG = ['#0B2E5E','#F0A500','#0B2E5E','#F0A500','#0B2E5E']

  const thCells = COLS.map((c, i) => `
    <td style="
      background:${COL_BG[i]};
      color:#fff;
      font-family:Impact,'Arial Black',Arial,sans-serif;
      font-size:38px;
      font-weight:900;
      text-align:center;
      padding:12px 0;
      border-radius:6px;
      width:20%;
      letter-spacing:2px;
    ">${c}</td>`).join('')

  const bodyRows = rows.map(row => {
    const cells = row.map(cell => `
      <td style="
        background:#fff;
        font-family:Impact,'Arial Black',Arial,sans-serif;
        font-size:${cell.free ? '32px' : '40px'};
        font-weight:900;
        text-align:center;
        padding:0;
        border-radius:6px;
        color:#0B2E5E;
        height:76px;
        vertical-align:middle;
        border:2px solid #e8eef8;
      ">${cell.free ? '★' : cell.value}</td>`).join('')
    return `<tr>${cells}</tr>`
  }).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" style="width:100%;max-height:100px;object-fit:contain;display:block;margin:0 auto 6px;" />`
    : `<div style="font-size:44px;text-align:center;padding:6px 0;line-height:1;">🎁</div>`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    width: 794px;
    height: 1123px;
    background: #F4F7FC;
    font-family: Arial, sans-serif;
    overflow: hidden;
  }
  body {
    padding: 28px 28px 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  table { border-collapse: separate; border-spacing: 5px; width: 100%; }
</style>
</head>
<body>

<!-- ═══ CARTELA PRINCIPAL ═══ -->
<div style="
  flex: 1;
  background: #fff;
  border-radius: 16px;
  border: 3px solid #0B2E5E;
  box-shadow: 0 2px 0 #0B2E5E, inset 0 0 0 6px #fff, inset 0 0 0 8px #0B2E5E;
  display: flex;
  gap: 0;
  overflow: hidden;
  margin-bottom: 14px;
">

  <!-- ESQUERDA -->
  <div style="flex: 1; min-width: 0; padding: 22px 18px 22px 22px; display: flex; flex-direction: column; gap: 10px; border-right: 3px solid #0B2E5E;">

    <!-- Título BINGO com faixa dourada -->
    <div style="text-align: center; background: #0B2E5E; border-radius: 10px; padding: 6px 0 4px; position:relative; overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(240,165,0,.12) 8px,rgba(240,165,0,.12) 16px);"></div>
      <span style="
        font-family: Impact, 'Arial Black', Arial, sans-serif;
        font-size: 86px;
        font-weight: 900;
        color: #F0A500;
        letter-spacing: 8px;
        text-shadow: 3px 3px 0 rgba(0,0,0,.4), -1px -1px 0 rgba(255,255,255,.1);
        line-height: 1;
        position: relative;
      ">BINGO</span>
    </div>

    <!-- Nº Cartela -->
    <div style="display: flex; justify-content: center;">
      <div style="text-align:center;">
        <div style="
          background: #0B2E5E;
          color: #F0A500;
          font-family: Arial, sans-serif;
          font-size: 11px;
          font-weight: 900;
          padding: 4px 20px 3px;
          border-radius: 6px 6px 0 0;
          letter-spacing: 2.5px;
          text-transform: uppercase;
        ">Nº DA CARTELA</div>
        <div style="
          background: #fff;
          border: 3px solid #0B2E5E;
          border-top: none;
          border-radius: 0 0 8px 8px;
          padding: 2px 32px 4px;
          font-family: Impact, 'Arial Black', Arial, sans-serif;
          font-size: 48px;
          font-weight: 900;
          color: #D42B2B;
          letter-spacing: 4px;
        ">${numFormatado}</div>
      </div>
    </div>

    <!-- Tabela BINGO -->
    <div style="flex: 1;">
      <table style="height: 100%;">
        <thead>
          <tr style="height: 62px;">${thCells}</tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>

  </div>

  <!-- DIREITA -->
  <div style="width: 218px; padding: 22px 18px 18px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFF;">

    <!-- Prêmio -->
    <div style="text-align: center;">
      <div style="
        background: #0B2E5E;
        color: #F0A500;
        font-family: Arial, sans-serif;
        font-size: 11px;
        font-weight: 900;
        padding: 5px 0;
        border-radius: 6px 6px 0 0;
        letter-spacing: 2.5px;
      ">PRÊMIO</div>
      <div style="
        border: 2px solid #0B2E5E;
        border-top: none;
        border-radius: 0 0 10px 10px;
        padding: 12px 8px 10px;
        background: #fff;
      ">
        ${premioImg}
        ${premio ? `<div style="font-size:12px;color:#333;font-weight:700;line-height:1.3;font-family:Arial,sans-serif;">${premio}</div>` : ''}
      </div>
    </div>

    <!-- Info rows -->
    ${[
      { icon: '📅', label: 'DATA', value: dataFormatada },
      { icon: '⏰', label: 'HORÁRIO', value: horario || '--:--' },
      { icon: '📍', label: 'LOCAL', value: local, truncate: true },
    ].map(row => `
    <div style="display:flex;align-items:center;gap:10px;border-bottom:1.5px solid #e0e8f4;padding-bottom:10px;">
      <span style="font-size:20px;flex-shrink:0;">${row.icon}</span>
      <div style="min-width:0;flex:1;">
        <div style="font-size:9px;font-weight:900;color:#F0A500;letter-spacing:1.5px;font-family:Arial,sans-serif;text-transform:uppercase;">${row.label}</div>
        <div style="font-size:14px;font-weight:700;color:#0B2E5E;font-family:Arial,sans-serif;${row.truncate ? 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;' : ''}">${row.value}</div>
      </div>
    </div>`).join('')}

    <!-- Valor -->
    <div style="margin-top: auto; border-radius: 10px; overflow: hidden; border: 2px solid #0B2E5E;">
      <div style="
        background: #0B2E5E;
        color: #fff;
        font-family: Arial, sans-serif;
        font-size: 10px;
        font-weight: 900;
        text-align: center;
        padding: 5px;
        letter-spacing: 2px;
      ">VALOR DA CARTELA</div>
      <div style="
        background: #F0A500;
        font-family: Impact, 'Arial Black', Arial, sans-serif;
        font-size: 38px;
        font-weight: 900;
        color: #fff;
        text-align: center;
        padding: 8px 0;
        text-shadow: 2px 2px 0 rgba(0,0,0,.25);
        letter-spacing: 1px;
      ">${valorCartela}</div>
    </div>

  </div>
</div>

<!-- ═══ LINHA TESOURA ═══ -->
<div style="display:flex;align-items:center;gap:6px;color:#999;margin-bottom:14px;flex-shrink:0;">
  <div style="flex:1;border-top:2px dashed #aaa;"></div>
  <span style="font-size:16px;transform:rotate(-90deg);display:inline-block;">✂</span>
  <div style="flex:1;border-top:2px dashed #aaa;"></div>
</div>

<!-- ═══ CANHOTO ═══ -->
<div style="
  background: #fff;
  border-radius: 12px;
  border: 2px solid #0B2E5E;
  display: flex;
  align-items: stretch;
  gap: 0;
  flex-shrink: 0;
  overflow: hidden;
">
  <!-- Tag CANHOTO -->
  <div style="
    background: #0B2E5E;
    color: #F0A500;
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 900;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    padding: 14px 10px;
    letter-spacing: 3px;
    flex-shrink: 0;
  ">CANHOTO</div>

  <!-- Campos -->
  <div style="flex:1; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; justify-content: center;">
    <div style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:17px;font-weight:900;color:#0B2E5E;letter-spacing:1px;">
      Nº <span style="color:#D42B2B;">${numFormatado}</span>
    </div>
    ${['NOME', 'TELEFONE', 'ENDEREÇO'].map(f => `
    <div style="display:flex;align-items:flex-end;gap:8px;">
      <span style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#555;white-space:nowrap;padding-bottom:2px;">${f}:</span>
      <div style="flex:1;border-bottom:1.5px solid #0B2E5E;min-height:22px;"></div>
    </div>`).join('')}
  </div>

  <!-- Logo -->
  <div style="
    background: #F8FAFF;
    border-left: 2px solid #0B2E5E;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 14px 16px;
    gap: 2px;
    flex-shrink: 0;
  ">
    <span style="font-size:32px;line-height:1;">🎱</span>
    <span style="font-family:Impact,'Arial Black',Arial,sans-serif;font-size:20px;font-weight:900;color:#0B2E5E;letter-spacing:3px;">BINGO</span>
    <span style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#F0A500;font-style:italic;">Boa sorte! ♡</span>
  </div>
</div>

</body>
</html>`
}
