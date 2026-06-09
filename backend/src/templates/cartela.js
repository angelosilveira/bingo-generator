/**
 * Gera o HTML completo de uma página com uma cartela de bingo.
 * Fiel ao layout da imagem: azul escuro, amarelo, bordas arredondadas, canhoto.
 */
export function gerarHTMLCartela({
  numero,
  rows,
  premio,
  premioImageUrl,
  data,
  horario,
  local,
  valorCartela,
}) {
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'

  const numFormatado = String(numero).padStart(4, '0')

  const cellsHTML = rows
    .map((row) =>
      row
        .map((cell) =>
          cell.free
            ? `<td class="cell free"><span>🎁</span></td>`
            : `<td class="cell">${cell.value}</td>`
        )
        .join('')
    )
    .join('</tr><tr>')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Arial Black', Arial, sans-serif;
    background: #e8f0fe;
    width: 794px;
    min-height: 1123px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  /* ─── CARTELA PRINCIPAL ─── */
  .card {
    background: #dde8fb;
    border-radius: 24px;
    padding: 20px;
    width: 100%;
    display: flex;
    gap: 18px;
    border: 2px solid #b8ccee;
  }

  /* ─── COLUNA ESQUERDA ─── */
  .left { flex: 1; }

  /* Título BINGO */
  .title-wrap {
    text-align: center;
    margin-bottom: 8px;
  }
  .title {
    font-size: 72px;
    font-weight: 900;
    color: #1a3a6b;
    text-shadow: 3px 3px 0 #fff, -1px -1px 0 #0a1f45;
    letter-spacing: 2px;
    line-height: 1;
  }

  /* Nº da cartela */
  .card-num-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }
  .card-num-badge {
    background: #1a3a6b;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 12px 0;
    border-radius: 6px 6px 0 0;
    letter-spacing: 1px;
  }
  .card-num-value {
    background: #fff;
    border: 2px solid #1a3a6b;
    border-radius: 0 0 8px 8px;
    padding: 2px 24px;
    font-size: 36px;
    font-weight: 900;
    color: #e03030;
    letter-spacing: 2px;
    text-align: center;
  }

  /* Tabela */
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 4px;
  }
  th {
    background: #1a3a6b;
    color: #fff;
    font-size: 30px;
    font-weight: 900;
    padding: 10px 0;
    border-radius: 8px;
    text-align: center;
    width: 20%;
  }
  th:nth-child(2), th:nth-child(4) {
    background: #f5a623;
  }
  td.cell {
    background: #fff;
    font-size: 28px;
    font-weight: 900;
    text-align: center;
    padding: 10px 0;
    border-radius: 8px;
    color: #111;
    height: 56px;
  }
  td.cell.free {
    font-size: 28px;
  }

  /* ─── COLUNA DIREITA ─── */
  .right {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .prize-box {
    border: 2px dashed #1a3a6b;
    border-radius: 12px;
    padding: 10px;
    text-align: center;
    background: #fff;
  }
  .prize-label {
    background: #1a3a6b;
    color: #fff;
    font-size: 13px;
    font-weight: 900;
    border-radius: 8px;
    padding: 3px 0;
    margin-bottom: 8px;
    letter-spacing: 1px;
  }
  .prize-img {
    width: 100%;
    height: 100px;
    object-fit: contain;
    border-radius: 8px;
  }
  .prize-placeholder {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  .prize-desc {
    font-size: 10px;
    color: #555;
    margin-top: 4px;
    font-weight: 700;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border-radius: 20px;
    padding: 6px 10px;
    border: 2px solid #1a3a6b;
  }
  .info-icon {
    background: #1a3a6b;
    color: #fff;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .info-content { flex: 1; min-width: 0; }
  .info-label {
    font-size: 9px;
    font-weight: 900;
    color: #f5a623;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .info-value {
    font-size: 11px;
    font-weight: 700;
    color: #1a3a6b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .valor-box {
    background: #1a3a6b;
    border-radius: 12px;
    padding: 8px;
    text-align: center;
    margin-top: auto;
  }
  .valor-label {
    color: #fff;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
  }
  .valor-value {
    background: #f5a623;
    color: #fff;
    font-size: 26px;
    font-weight: 900;
    border-radius: 8px;
    padding: 2px 0;
    margin-top: 4px;
    text-shadow: 1px 1px 0 rgba(0,0,0,.2);
  }

  /* ─── CANHOTO ─── */
  .scissor-line {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0 6px;
    color: #888;
  }
  .scissor-line::before, .scissor-line::after {
    content: '';
    flex: 1;
    border-top: 2px dashed #aaa;
  }

  .stub {
    width: 100%;
    background: #fff;
    border-radius: 16px;
    border: 2px solid #dde8fb;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
  }
  .stub-tag {
    background: #1a3a6b;
    color: #fff;
    font-size: 11px;
    font-weight: 900;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    padding: 10px 6px;
    border-radius: 8px;
    letter-spacing: 2px;
  }
  .stub-fields { flex: 1; }
  .stub-num {
    font-size: 14px;
    font-weight: 900;
    color: #1a3a6b;
    margin-bottom: 4px;
  }
  .stub-num span { color: #e03030; }
  .stub-line {
    font-size: 11px;
    color: #555;
    margin-bottom: 4px;
    display: flex;
    gap: 6px;
  }
  .stub-line-label { font-weight: 700; white-space: nowrap; }
  .stub-line-field {
    flex: 1;
    border-bottom: 1px solid #999;
    min-width: 60px;
  }
  .stub-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #1a3a6b;
    font-size: 22px;
    font-weight: 900;
    gap: 2px;
  }
  .stub-logo-sub {
    font-size: 13px;
    color: #f5a623;
    font-style: italic;
  }
</style>
</head>
<body>

<!-- ═══ CARTELA ═══ -->
<div class="card">
  <!-- Esquerda -->
  <div class="left">
    <div class="title-wrap">
      <div class="title">BINGO</div>
    </div>

    <div class="card-num-wrap">
      <div>
        <div class="card-num-badge">Nº DA CARTELA</div>
        <div class="card-num-value">${numFormatado}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>B</th><th>I</th><th>N</th><th>G</th><th>O</th>
        </tr>
      </thead>
      <tbody>
        <tr>${cellsHTML}</tr>
      </tbody>
    </table>
  </div>

  <!-- Direita -->
  <div class="right">
    <!-- Prêmio -->
    <div class="prize-box">
      <div class="prize-label">PRÊMIO</div>
      ${
        premioImageUrl
          ? `<img class="prize-img" src="${premioImageUrl}" alt="${premio}" />`
          : `<div class="prize-placeholder">🎁</div>`
      }
      ${premio ? `<div class="prize-desc">${premio}</div>` : ''}
    </div>

    <!-- Data -->
    <div class="info-row">
      <div class="info-icon">📅</div>
      <div class="info-content">
        <div class="info-label">DATA</div>
        <div class="info-value">${dataFormatada}</div>
      </div>
    </div>

    <!-- Horário -->
    <div class="info-row">
      <div class="info-icon">🕐</div>
      <div class="info-content">
        <div class="info-label">HORÁRIO</div>
        <div class="info-value">${horario || '--:--'}</div>
      </div>
    </div>

    <!-- Local -->
    <div class="info-row">
      <div class="info-icon">📍</div>
      <div class="info-content">
        <div class="info-label">LOCAL</div>
        <div class="info-value">${local}</div>
      </div>
    </div>

    <!-- Valor -->
    <div class="valor-box">
      <div class="valor-label">VALOR DA CARTELA</div>
      <div class="valor-value">${valorCartela}</div>
    </div>
  </div>
</div>

<!-- ═══ LINHA CANHOTO ═══ -->
<div class="scissor-line">✂</div>

<!-- ═══ CANHOTO ═══ -->
<div class="stub">
  <div class="stub-tag">CANHOTO</div>
  <div class="stub-fields">
    <div class="stub-num">Nº DA CARTELA: <span>${numFormatado}</span></div>
    <div class="stub-line">
      <span class="stub-line-label">NOME:</span>
      <span class="stub-line-field"></span>
    </div>
    <div class="stub-line">
      <span class="stub-line-label">TELEFONE:</span>
      <span class="stub-line-field"></span>
    </div>
    <div class="stub-line">
      <span class="stub-line-label">ENDEREÇO:</span>
      <span class="stub-line-field"></span>
    </div>
  </div>
  <div class="stub-logo">
    🎱
    <div style="font-size:20px;color:#1a3a6b;font-weight:900;">BINGO</div>
    <div class="stub-logo-sub">Boa sorte! ♡</div>
  </div>
</div>

</body>
</html>`
}
