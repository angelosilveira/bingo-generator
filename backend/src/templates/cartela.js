import { fmtValor } from '../utils/format.js'

export function gerarHTMLCartela({ numero, rows, premio, premioImageBase64, premioImagens, data, horario, local, valorCartela, contato }) {
  const numFormatado = String(numero).padStart(4, '0')
  const dataFormatada = data
    ? new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
    : '__/__/____'
  const valorFormatado = fmtValor(valorCartela)

  const gridHTML = rows.flat().map(cell =>
    cell.free
      ? `<div class="cell free"><i class="fa-solid fa-star"></i><span>LIVRE</span></div>`
      : `<div class="cell">${cell.value}</div>`
  ).join('')

  const imgs = Array.from({ length: 3 }, (_, i) => {
    const src = (premioImagens && premioImagens[i]) || (i === 0 ? premioImageBase64 : null)
    return src
      ? `<img src="${src}" alt="Premio ${i + 1}" class="prize-img" />`
      : `<div class="prize-img img-placeholder"><i class="fa-solid fa-image"></i></div>`
  })

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
<style>${BASE_CSS}</style>
</head>
<body>
<div class="ticket">

  <!-- ══ HEADER LINHA 1: BINGO + nome + contato + nº ══ -->
  <header class="header-top">
    <div class="header-brand">
      <h1>BINGO</h1>
      <span class="premio-name">${premio || 'A DEFINIR'}</span>
    </div>
    <div class="header-right">
      <div class="header-info-block">
        <span class="info-micro">CONTATO</span>
        <div class="info-val"><i class="fa-solid fa-phone"></i> ${contato || '—'}</div>
      </div>
      <div class="sep-v"></div>
      <div class="header-info-block">
        <span class="info-micro">CARTELA Nº</span>
        <div class="info-val num-val"><i class="fa-solid fa-ticket"></i> ${numFormatado}</div>
      </div>
    </div>
  </header>

  <!-- ══ HEADER LINHA 2: LOCAL · DATA · HORÁRIO · VALOR ══ -->
  <div class="header-bar">
    <div class="bar-item bar-local">
      <i class="fa-solid fa-location-dot"></i>
      <div><small>LOCAL</small><strong>${local || '—'}</strong></div>
    </div>
    <div class="bar-item">
      <i class="fa-solid fa-calendar"></i>
      <div><small>DATA</small><strong>${dataFormatada}</strong></div>
    </div>
    <div class="bar-item">
      <i class="fa-solid fa-clock"></i>
      <div><small>HORÁRIO</small><strong>${horario || '--:--'}</strong></div>
    </div>
    <div class="bar-item bar-valor">
      <i class="fa-solid fa-tag"></i>
      <div><small>VALOR DA CARTELA</small><strong class="valor-text">${valorFormatado || 'R$ —'}</strong></div>
    </div>
  </div>

  <!-- ══ CORPO: 3 FOTOS + GRADE ══ -->
  <section class="body-section">

    <div class="prize-col">
      ${imgs[0]}
      ${imgs[1]}
      ${imgs[2]}
    </div>

    <div class="bingo-col">
      <div class="bingo-header">
        <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
      </div>
      <div class="bingo-grid">
        ${gridHTML}
      </div>
    </div>

  </section>

  <!-- ══ CANHOTO ══ -->
  <section class="stub">
    <div class="stub-title">✂ CANHOTO</div>
    <div class="stub-content">

      <div class="stub-num">
        <small>Nº DA CARTELA</small>
        <strong>${numFormatado}</strong>
      </div>

      <div class="stub-fields">
        <div class="stub-field">
          <i class="fa-solid fa-user"></i>
          <span>Nome:</span>
          <span class="stub-line"></span>
        </div>
        <div class="stub-field">
          <i class="fa-solid fa-phone"></i>
          <span>Telefone:</span>
          <span class="stub-line"></span>
        </div>
      </div>

      <div class="stub-payment">
        <label><span class="chk"></span> PAGO</label>
        <label><span class="chk"></span> NÃO PAGO</label>
      </div>

    </div>
  </section>

</div>
</body>
</html>`
}

export const BASE_CSS = `
:root {
  --blue:    #0D47C8;
  --blue2:   #1563e0;
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
  background:#fff;
  border-radius:18px;
  overflow:hidden;
  border:1px solid var(--border);
  display:flex;
  flex-direction:column;
}

/* ── HEADER LINHA 1 ── */
.header-top {
  background:var(--blue);
  color:#fff;
  padding:16px 22px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-shrink:0;
  gap:20px;
}
.header-brand h1 {
  font-size:68px;
  font-weight:900;
  line-height:.9;
  letter-spacing:4px;
}
.header-brand .premio-name {
  display:block;
  font-size:22px;
  font-weight:700;
  margin-top:8px;
  opacity:.95;
  line-height:1.2;
}
.header-right {
  display:flex;
  align-items:center;
  gap:0;
  flex-shrink:0;
  border-left:1px solid rgba(255,255,255,.25);
  padding-left:20px;
}
.header-info-block {
  display:flex;
  flex-direction:column;
  gap:4px;
  padding:0 20px;
}
.header-info-block:first-child { padding-left:0; }
.info-micro {
  font-size:9px;
  font-weight:700;
  letter-spacing:1.5px;
  color:rgba(255,255,255,.55);
  text-transform:uppercase;
}
.info-val {
  font-size:16px;
  font-weight:700;
  color:#fff;
  display:flex;
  align-items:center;
  gap:7px;
  white-space:nowrap;
}
.info-val i { opacity:.75; font-size:15px; }
.num-val {
  font-size:28px;
  font-weight:900;
  letter-spacing:3px;
  line-height:1;
}
.num-val i { font-size:22px; }
.sep-v {
  width:1px;
  height:36px;
  background:rgba(255,255,255,.25);
  flex-shrink:0;
}

/* ── HEADER LINHA 2 ── */
.header-bar {
  background:var(--blue2);
  display:flex;
  align-items:stretch;
  border-top:1px solid rgba(255,255,255,.15);
  flex-shrink:0;
}
.bar-item {
  flex:1;
  min-width:0;
  padding:10px 14px;
  border-right:1px solid rgba(255,255,255,.15);
  display:flex;
  align-items:center;
  gap:10px;
}
.bar-item:last-child { border-right:none; }
.bar-local { flex:2; }
.bar-item i {
  font-size:17px;
  color:rgba(255,255,255,.7);
  flex-shrink:0;
}
.bar-item small {
  display:block;
  font-size:8px;
  font-weight:700;
  letter-spacing:1.5px;
  color:rgba(255,255,255,.55);
  text-transform:uppercase;
  margin-bottom:3px;
}
.bar-item strong {
  display:block;
  font-size:13px;
  font-weight:700;
  color:#fff;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.bar-valor {
  background:rgba(0,0,0,.15);
}
.bar-valor i { color:#7DFFB3; }
.valor-text {
  font-size:15px !important;
  color:#7DFFB3 !important;
}

/* ── CORPO ── */
.body-section {
  display:flex;
  flex:1;
  min-height:0;
  overflow:hidden;
  border-top:1px solid var(--border);
  gap:12px;
  padding:12px;
}

/* 3 fotos empilhadas */
.prize-col {
  width:220px;
  flex-shrink:0;
  display:grid;
  grid-template-rows:1fr 1fr 1fr;
  overflow:hidden;
  border-radius:10px;
}
.prize-img {
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  border-bottom:1px solid var(--border);
  min-height:0;
}
.prize-img:first-child { border-radius:10px 10px 0 0; }
.prize-img:last-child { border-bottom:none; border-radius:0 0 10px 10px; }
.img-placeholder {
  width:100%;
  height:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#F5F7FB;
  color:#C0C8D8;
  border-bottom:1px solid var(--border);
  min-height:0;
}
.img-placeholder:first-child { border-radius:10px 10px 0 0; }
.img-placeholder:last-child { border-bottom:none; border-radius:0 0 10px 10px; }
.img-placeholder i { font-size:30px; }

/* Grade BINGO */
.bingo-col {
  flex:1;
  display:flex;
  flex-direction:column;
  min-width:0;
  overflow:hidden;
  border:2px solid var(--blue);
  border-radius:10px;
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
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:34px;
  font-weight:900;
}
.bingo-grid {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  grid-template-rows:repeat(5,1fr);
  flex:1;
  min-height:0;
  overflow:hidden;
}
.cell {
  border:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:38px;
  font-weight:900;
  color:#1a1a2e;
}
.cell.free {
  flex-direction:column;
  color:var(--blue);
  gap:3px;
}
.cell.free i { font-size:26px; }
.cell.free span { font-size:12px; font-weight:800; letter-spacing:1px; }

/* ── CANHOTO ── */
.stub {
  padding:0 16px 14px;
  margin-top:10px;
  flex-shrink:0;
}
.stub-title {
  text-align:center;
  color:var(--blue);
  font-size:12px;
  font-weight:800;
  letter-spacing:2px;
  border-top:2px dashed var(--blue);
  padding-top:8px;
  margin-bottom:10px;
}
.stub-content {
  border:1px solid var(--border);
  border-radius:12px;
  display:grid;
  grid-template-columns:150px 1fr 160px;
  overflow:hidden;
}
.stub-content > div, .stub-payment { padding:15px 18px; }
.stub-num { border-right:1px dashed #CBD5E1; }
.stub-num small {
  display:block;
  font-size:9px;
  font-weight:700;
  letter-spacing:2px;
  color:var(--blue);
  margin-bottom:6px;
}
.stub-num strong {
  font-size:40px;
  font-weight:900;
  color:var(--blue);
}
.stub-fields {
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:16px;
  border-right:1px dashed #CBD5E1;
}
.stub-field {
  display:flex;
  align-items:center;
  gap:7px;
  font-size:13px;
  font-weight:600;
  color:#333;
}
.stub-field i { color:var(--blue); font-size:13px; }
.stub-line {
  flex:1;
  border-bottom:1.5px solid #999;
  display:inline-block;
  margin-left:4px;
}
.stub-payment {
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:12px;
}
.stub-payment label {
  display:flex;
  align-items:center;
  gap:8px;
  font-size:11px;
  font-weight:900;
  letter-spacing:1.5px;
  color:#333;
  cursor:default;
}
.chk {
  display:inline-block;
  width:14px;
  height:14px;
  border:2px solid #1a1a2e;
  border-radius:3px;
  flex-shrink:0;
}
`
