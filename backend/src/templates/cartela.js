import { fmtValor } from '../utils/format.js'

export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'
  const valorFormatado = fmtValor(valorCartela)

  const bodyRows = rows.map(row =>
    `<tr>${row.map(cell => `
      <td class="cell${cell.free ? ' free' : ''}">
        ${cell.free
          ? `<i class="fa-solid fa-star"></i><span>LIVRE</span>`
          : cell.value}
      </td>`).join('')}</tr>`
  ).join('')

  const premioImg = premioImageBase64
    ? `<img src="${premioImageBase64}" alt="Prêmio" />`
    : `<div class="img-placeholder"><i class="fa-solid fa-image"></i><span>FOTO DO PRÊMIO</span></div>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
<style>
${BASE_CSS}
</style>
</head>
<body>
<div class="ticket">

  <!-- HEADER -->
  <header class="header">
    <div class="header-left">
      <h1>BINGO</h1>
      <span class="premio-sub">${premio || 'A DEFINIR'}</span>
    </div>
    <div class="header-right">
      <div class="info-col">
        <div class="info-row">
          <i class="fa-solid fa-location-dot"></i>
          <div><small>LOCAL</small><strong>${local || '—'}</strong></div>
        </div>
        <div class="info-row">
          <i class="fa-solid fa-calendar"></i>
          <div><small>DATA</small><strong>${dataFormatada}</strong></div>
        </div>
        <div class="info-row">
          <i class="fa-solid fa-clock"></i>
          <div><small>HORÁRIO</small><strong>${horario || '--:--'}</strong></div>
        </div>
      </div>
      <div class="num-block">
        <i class="fa-solid fa-ticket"></i>
        <div>
          <small>CARTELA Nº</small>
          <strong>${numFormatado}</strong>
        </div>
      </div>
    </div>
  </header>

  <!-- PRIZE + BINGO -->
  <section class="main-section">

    <div class="prize-image">
      ${premioImg}
    </div>

    <div class="bingo-section">
      <div class="bingo-header">
        <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
      </div>
      <div class="bingo-grid">
        ${rows.map(row => row.map(cell => `
          <div class="cell${cell.free ? ' free' : ''}">
            ${cell.free
              ? `<i class="fa-solid fa-star"></i><span>LIVRE</span>`
              : cell.value}
          </div>`).join('')).join('')}
      </div>
    </div>

  </section>

  <!-- VALOR -->
  <div class="valor-bar">
    <span class="valor-label"><i class="fa-solid fa-tag"></i> VALOR DA CARTELA</span>
    <span class="valor-num">${valorFormatado || 'R$ —'}</span>
  </div>

  <!-- CANHOTO -->
  <section class="stub">
    <div class="stub-title">✂ CANHOTO</div>
    <div class="stub-content">

      <div class="stub-number">
        <small>Nº DA CARTELA</small>
        <strong>${numFormatado}</strong>
      </div>

      <div class="stub-form">
        <div><i class="fa-solid fa-user"></i> Nome: <span class="line"></span></div>
        <div><i class="fa-solid fa-phone"></i> Telefone: <span class="line"></span></div>
        <div><i class="fa-solid fa-house"></i> Endereço: <span class="line"></span></div>
      </div>

      <div class="stub-right">
        <div class="stub-payment">
          <label><span class="chk"></span> PAGO</label>
          <label><span class="chk"></span> NÃO PAGO</label>
        </div>
        <div class="stub-price">
          <small>VALOR DA CARTELA</small>
          <strong>${valorFormatado || 'R$ —'}</strong>
        </div>
      </div>

    </div>
  </section>

</div>
</body>
</html>`
}

export const BASE_CSS = `
:root {
  --blue: #0D47C8;
  --green: #0F9D58;
  --border: #DCE5F5;
}
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:794px; height:1123px; background:#ECEFF3; font-family:Arial,Helvetica,sans-serif; overflow:hidden; }
body { padding:14px; }

.ticket {
  width:766px; height:1095px;
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex; flex-direction:column;
}

/* ── HEADER ── */
.header {
  background:var(--blue);
  color:#fff;
  padding:20px 28px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-shrink:0;
}
.header-left h1 {
  font-size:72px; font-weight:900; line-height:.9;
}
.header-left .premio-sub {
  display:block;
  font-size:20px; font-weight:700;
  margin-top:10px;
  opacity:.92;
}
.header-right {
  display:flex;
  align-items:center;
  gap:24px;
  border-left:1px solid rgba(255,255,255,.3);
  padding-left:24px;
}
.info-col {
  display:flex;
  flex-direction:column;
  gap:8px;
}
.info-row {
  display:flex;
  align-items:center;
  gap:10px;
}
.info-row i { font-size:18px; opacity:.85; flex-shrink:0; }
.info-row small { display:block; font-size:9px; font-weight:700; letter-spacing:1.5px; opacity:.75; text-transform:uppercase; }
.info-row strong { display:block; font-size:15px; font-weight:700; line-height:1.1; }

.num-block {
  display:flex;
  align-items:center;
  gap:12px;
  border-left:1px solid rgba(255,255,255,.3);
  padding-left:20px;
}
.num-block i { font-size:36px; opacity:.85; }
.num-block small { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; opacity:.75; }
.num-block strong { display:block; font-size:52px; font-weight:900; line-height:1; }

/* ── MAIN SECTION ── */
.main-section {
  display:flex;
  gap:14px;
  padding:14px 16px;
  flex:1;
  min-height:0;
}

.prize-image {
  width:290px; flex-shrink:0;
  border-radius:14px;
  overflow:hidden;
  border:1px solid var(--border);
}
.prize-image img {
  width:100%; height:100%; object-fit:cover;
}
.img-placeholder {
  width:100%; height:100%;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:10px;
  background:#F5F7FB;
  color:#A0AABB;
}
.img-placeholder i { font-size:40px; }
.img-placeholder span { font-size:11px; font-weight:700; letter-spacing:2px; }

.bingo-section {
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
}

.bingo-header {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex-shrink:0;
}
.bingo-header div {
  background:var(--blue);
  color:#fff;
  height:52px;
  display:flex; align-items:center; justify-content:center;
  font-size:34px; font-weight:900;
}
.bingo-header div:first-child { border-radius:10px 0 0 0; }
.bingo-header div:last-child  { border-radius:0 10px 0 0; }

.bingo-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex:1;
}
.cell {
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:42px; font-weight:900; color:#1a1a2e;
}
.cell.free {
  flex-direction:column;
  color:var(--blue);
  gap:4px;
  font-size:14px;
}
.cell.free i { font-size:30px; }
.cell.free span { font-size:13px; font-weight:800; letter-spacing:1px; }

/* ── VALOR BAR ── */
.valor-bar {
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:#F5F7FB;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  padding:10px 22px;
  flex-shrink:0;
}
.valor-label {
  font-size:13px; font-weight:800;
  color:var(--blue);
  letter-spacing:1px;
  display:flex; align-items:center; gap:8px;
}
.valor-label i { font-size:16px; }
.valor-num {
  font-size:32px; font-weight:900;
  color:var(--green);
}

/* ── CANHOTO ── */
.stub {
  padding:0 16px 12px;
  flex-shrink:0;
}
.stub-title {
  text-align:center;
  color:var(--blue);
  font-size:13px; font-weight:800;
  border-top:2px dashed var(--blue);
  padding-top:8px;
  margin-bottom:10px;
  letter-spacing:2px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:14px;
  display:grid;
  grid-template-columns:160px 1fr 200px;
}
.stub-content > div {
  padding:16px 20px;
}
.stub-content > div:not(:last-child) {
  border-right:1px dashed #cbd5e1;
}
.stub-number small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--blue); margin-bottom:6px; }
.stub-number strong { font-size:44px; font-weight:900; color:var(--blue); }

.stub-form {
  display:flex; flex-direction:column;
  justify-content:center; gap:18px;
  font-size:13px; font-weight:600; color:#333;
}
.stub-form i { color:var(--blue); margin-right:6px; }
.line {
  display:inline-block;
  border-bottom:1.5px solid #999;
  width:55%;
  margin-left:6px;
  vertical-align:bottom;
}

.stub-right {
  display:flex; flex-direction:column;
  justify-content:space-between;
}
.stub-payment {
  display:flex; flex-direction:column; gap:10px;
}
.stub-payment label {
  display:flex; align-items:center; gap:8px;
  font-size:11px; font-weight:900; letter-spacing:1.5px; color:#333;
  cursor:default;
}
.chk {
  display:inline-block;
  width:14px; height:14px;
  border:2px solid #1a1a2e;
  border-radius:3px;
  flex-shrink:0;
}
.stub-price small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--blue); margin-bottom:4px; }
.stub-price strong { font-size:24px; font-weight:900; color:var(--green); }
`
