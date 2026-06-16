import { fmtValor } from '../utils/format.js'

export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, data, horario, local, valorCartela }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'
  const valorFormatado = fmtValor(valorCartela)

  // Grid gerado estaticamente — sem JS, funciona no iframe e no Puppeteer
  const gridHTML = rows.flat().map(cell =>
    cell.free
      ? `<div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div>`
      : `<div class="cell">${cell.value}</div>`
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
      <span>${premio || 'A DEFINIR'}</span>
    </div>
    <div class="header-right">
      <i class="fa-solid fa-ticket"></i>
      <div>
        <small>CARTELA Nº</small>
        <strong>${numFormatado}</strong>
      </div>
    </div>
  </header>

  <!-- FOTO + SIDEBAR -->
  <section class="prize-section">

    <div class="prize-image">
      ${premioImg}
    </div>

    <div class="prize-card">

      <div class="card-block">
        <h3><i class="fa-solid fa-location-dot"></i> LOCAL</h3>
        <div class="contact">${local || '—'}</div>
      </div>

      <div class="divider"></div>

      <div class="card-block">
        <h3><i class="fa-solid fa-calendar"></i> DATA E HORÁRIO</h3>
        <div class="contact">${dataFormatada}</div>
        <div class="sub-info">às ${horario || '--:--'}</div>
      </div>

      <div class="divider"></div>

      <div class="card-block">
        <h3><i class="fa-solid fa-tag"></i> VALOR DA CARTELA</h3>
        <div class="price">${valorFormatado || 'R$ —'}</div>
      </div>

    </div>
  </section>

  <!-- BINGO -->
  <section class="bingo-section">
    <div class="bingo-header">
      <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
    </div>
    <div class="bingo-grid">
      ${gridHTML}
    </div>
  </section>

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

      <div class="stub-price">
        <div class="stub-payment">
          <label><span class="chk"></span> PAGO</label>
          <label><span class="chk"></span> NÃO PAGO</label>
        </div>
        <small>VALOR DA CARTELA</small>
        <strong>${valorFormatado || 'R$ —'}</strong>
      </div>

    </div>
  </section>

</div>
</body>
</html>`
}

export const BASE_CSS = `
:root {
  --primary: #0D47C8;
  --green:   #0F9D58;
  --border:  #DCE5F5;
}
* { margin:0; padding:0; box-sizing:border-box; }
html, body {
  width:794px; height:1123px;
  background:#ECEFF3;
  font-family:Arial,Helvetica,sans-serif;
  overflow:hidden;
}
body { padding:14px; }

.ticket {
  width:766px; height:1095px;
  margin:auto;
  background:#fff;
  border-radius:20px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex;
  flex-direction:column;
}

/* ── HEADER ── */
.header {
  background:var(--primary);
  color:#fff;
  height:140px;
  flex-shrink:0;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:24px 30px;
}
.header-left h1 {
  font-size:76px;
  line-height:.9;
  font-weight:900;
}
.header-left span {
  display:block;
  margin-top:8px;
  font-size:22px;
  font-weight:700;
  opacity:.92;
}
.header-right {
  display:flex;
  align-items:center;
  gap:16px;
  border-left:1px solid rgba(255,255,255,.35);
  padding-left:24px;
}
.header-right i { font-size:44px; }
.header-right small { display:block; font-size:13px; font-weight:600; opacity:.8; }
.header-right strong { display:block; font-size:54px; font-weight:900; line-height:1; }

/* ── FOTO + SIDEBAR ── */
.prize-section {
  display:grid;
  grid-template-columns:1fr 220px;
  gap:14px;
  padding:14px;
  flex-shrink:0;
  height:320px;
}
.prize-image {
  border-radius:14px;
  overflow:hidden;
  border:1px solid var(--border);
  height:100%;
}
.prize-image img { width:100%; height:100%; object-fit:cover; }
.img-placeholder {
  width:100%; height:100%;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:10px; background:#F5F7FB; color:#A0AABB;
}
.img-placeholder i { font-size:36px; }
.img-placeholder span { font-size:10px; font-weight:700; letter-spacing:2px; }

.prize-card {
  border:1px solid var(--border);
  border-radius:14px;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.card-block { padding:14px 16px; flex:1; }
.card-block h3 {
  display:flex; align-items:center; gap:8px;
  color:var(--primary);
  font-size:11px; font-weight:900;
  letter-spacing:1.5px; text-transform:uppercase;
  margin-bottom:6px;
}
.card-block h3 i { font-size:14px; }
.contact { font-size:16px; font-weight:700; color:#1a1a2e; line-height:1.3; }
.sub-info { font-size:14px; font-weight:600; color:#555; margin-top:3px; }
.price { font-size:26px; font-weight:900; color:var(--green); }
.divider { height:1px; background:var(--border); flex-shrink:0; }

/* ── BINGO ── */
.bingo-section {
  padding:0 14px 10px;
  flex:1;
  display:flex;
  flex-direction:column;
  min-height:0;
}
.bingo-header {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex-shrink:0;
}
.bingo-header div {
  background:var(--primary); color:#fff;
  height:52px;
  display:flex; align-items:center; justify-content:center;
  font-size:36px; font-weight:900;
}
.bingo-header div:first-child { border-radius:12px 0 0 0; }
.bingo-header div:last-child  { border-radius:0 12px 0 0; }

.bingo-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  flex:1;
}
.cell {
  border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  font-size:38px; font-weight:900; color:#1a1a2e;
}
.cell.free {
  flex-direction:column;
  color:var(--primary);
  gap:3px;
}
.cell.free i { font-size:26px; }
.cell.free span { font-size:12px; font-weight:800; letter-spacing:1px; }

/* ── CANHOTO ── */
.stub { padding:0 14px 14px; flex-shrink:0; }
.stub-title {
  text-align:center;
  color:var(--primary);
  font-size:13px; font-weight:800;
  letter-spacing:2px;
  border-top:2px dashed var(--primary);
  padding-top:8px;
  margin-bottom:10px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:14px;
  display:grid;
  grid-template-columns:150px 1fr 180px;
}
.stub-content > div { padding:16px 18px; }
.stub-content > div:not(:last-child) { border-right:1px dashed #CBD5E1; }

.stub-number small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--primary); margin-bottom:6px; }
.stub-number strong { font-size:42px; font-weight:900; color:var(--primary); }

.stub-form {
  display:flex; flex-direction:column;
  justify-content:center; gap:14px;
  font-size:12px; font-weight:600; color:#333;
}
.stub-form i { color:var(--primary); margin-right:5px; }
.line {
  display:inline-block;
  border-bottom:1.5px solid #999;
  width:52%; margin-left:5px;
  vertical-align:bottom;
}

.stub-price {
  display:flex; flex-direction:column;
  justify-content:space-between;
}
.stub-payment {
  display:flex; flex-direction:column; gap:8px;
  padding-bottom:8px;
  border-bottom:1px solid var(--border);
  margin-bottom:8px;
}
.stub-payment label {
  display:flex; align-items:center; gap:7px;
  font-size:10px; font-weight:900;
  letter-spacing:1.5px; color:#333; cursor:default;
}
.chk {
  display:inline-block;
  width:13px; height:13px;
  border:2px solid #1a1a2e;
  border-radius:3px; flex-shrink:0;
}
.stub-price small { display:block; font-size:9px; font-weight:700; letter-spacing:2px; color:var(--primary); margin-bottom:4px; }
.stub-price strong { font-size:20px; font-weight:900; color:var(--green); }
`
