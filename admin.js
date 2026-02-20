/* ============================
   DATI E FUNZIONI BASE
============================ */

function getDati() {
  return {
    piloti: JSON.parse(localStorage.getItem("piloti") || "[]"),
    scuderie: JSON.parse(localStorage.getItem("scuderie") || "[]"),
    gare: JSON.parse(localStorage.getItem("gare") || "[]")
  };
}

function salvaDati(dati) {
  localStorage.setItem("piloti", JSON.stringify(dati.piloti));
  localStorage.setItem("scuderie", JSON.stringify(dati.scuderie));
  localStorage.setItem("gare", JSON.stringify(dati.gare));
}

/* ============================
   LOGIN
============================ */

document.getElementById("login-btn").addEventListener("click", () => {
  const pass = document.getElementById("admin-password").value;
  if (pass === "admin") {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("admin-app").classList.remove("hidden");
  } else {
    document.getElementById("login-error").textContent = "Password errata";
  }
});

/* ============================
   TEMA
============================ */

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});

/* ============================
   APRI CLASSIFICA
============================ */

document.getElementById("print-btn").addEventListener("click", () => {
  window.location.href = "classifica.html";
});

/* ============================
   COLORI PREDEFINITI
============================ */

const coloriPredefiniti = {
  "rosso": "#ff0000",
  "rosso ferrari": "#e10600",
  "verde": "#008000",
  "verde chiaro": "#90ee90",
  "blu": "#0000ff",
  "blu chiaro": "#87cefa",
  "giallo": "#ffff00",
  "arancione": "#ffa500",
  "viola": "#800080",
  "rosa": "#ff69b4",
  "nero": "#000000",
  "bianco": "#ffffff",
  "grigio": "#808080",
  "grigio chiaro": "#d3d3d3"
};

/* ============================
   AUTO-LOGO E AUTO-COLORE
============================ */

function generaLogoDaNome(nome) {
  return "assets/" + nome.toLowerCase().replace(/ /g, "-") + ".png";
}

function generaColoreDaNome(nome) {
  if (!nome) return "#ffffff";
  nome = nome.toLowerCase().trim();

  if (coloriPredefiniti[nome]) return coloriPredefiniti[nome];

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(nome)) return nome;

  return "#888888";
}

/* ============================
   PREVIEW COLORE E LOGO
============================ */

const coloreInput = document.getElementById("scuderia-colore");
const previewColore = document.getElementById("preview-colore");
const logoInput = document.getElementById("scuderia-logo");
const previewLogo = document.getElementById("preview-logo");

coloreInput.addEventListener("input", () => {
  previewColore.style.background = generaColoreDaNome(coloreInput.value);
});

logoInput.addEventListener("input", () => {
  previewLogo.src = logoInput.value;
  previewLogo.style.display = "block";
});

/* ============================
   PALETTE COLORI
============================ */

document.querySelectorAll(".colore-box").forEach(box => {
  box.addEventListener("click", () => {
    const nome = box.dataset.colore;
    coloreInput.value = nome;
    previewColore.style.background = generaColoreDaNome(nome);
  });
});

/* ============================
   COLOR PICKER
============================ */

document.getElementById("color-picker").addEventListener("input", e => {
  coloreInput.value = e.target.value;
  previewColore.style.background = e.target.value;
});

/* ============================
   AUTOCOMPLETE SCUDERIE
============================ */

document.getElementById("pilota-scuderia").addEventListener("input", e => {
  const testo = e.target.value.toLowerCase();
  const { scuderie } = getDati();

  const match = scuderie.find(s => s.nome.toLowerCase().startsWith(testo));
  if (match) e.target.value = match.nome;
});

/* ============================
   SCUDERIE
============================ */

function renderScuderie() {
  const { scuderie } = getDati();
  const tbody = document.getElementById("scuderie-table-body");
  tbody.innerHTML = "";

  scuderie.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.nome}</td>
      <td><div style="width:20px;height:20px;border-radius:4px;background:${s.colore};"></div></td>
      <td><img src="${s.logo}" style="width:40px;height:40px;object-fit:contain;"></td>
      <td>
        <button class="btn-small danger" onclick="deleteScuderia('${s.nome}')">Elimina</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteScuderia(nome) {
  const dati = getDati();
  dati.scuderie = dati.scuderie.filter(s => s.nome !== nome);
  salvaDati(dati);
  renderScuderie();
}

document.getElementById("add-scuderia-btn").addEventListener("click", () => {
  const nome = document.getElementById("scuderia-nome").value.trim();
  let colore = document.getElementById("scuderia-colore").value.trim();
  let logo = document.getElementById("scuderia-logo").value.trim();

  if (!nome) return;

  colore = generaColoreDaNome(colore);
  if (!logo) logo = generaLogoDaNome(nome);

  const dati = getDati();
  const esistente = dati.scuderie.find(s => s.nome === nome);

  if (esistente) {
    esistente.colore = colore;
    esistente.logo = logo;
  } else {
    dati.scuderie.push({ nome, colore, logo });
  }

  salvaDati(dati);
  renderScuderie();

  document.getElementById("scuderia-nome").value = "";
  document.getElementById("scuderia-colore").value = "";
  document.getElementById("scuderia-logo").value = "";
  previewColore.style.background = "transparent";
  previewLogo.style.display = "none";
});

/* ============================
   PILOTI
============================ */

function renderPiloti() {
  const { piloti } = getDati();
  const tbody = document.getElementById("piloti-table-body");
  tbody.innerHTML = "";

  piloti.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nickname}</td>
      <td>${p.numero}</td>
      <td>${p.scuderia}</td>
      <td>${p.punti}</td>
      <td>${
        p.trend === "up" ? `▲ +${p.movimento}` :
        p.trend === "down" ? `▼ ${p.movimento}` :
        `■ 0`
      }</td>
      <td>
        <button class="btn-small danger" onclick="deletePilota(${p.id})">Elimina</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deletePilota(id) {
  const dati = getDati();
  dati.piloti = dati.piloti.filter(p => p.id !== id);
  salvaDati(dati);
  renderPiloti();
}

document.getElementById("add-pilota-btn").addEventListener("click", () => {
  const nickname = document.getElementById("pilota-nickname").value.trim();
  const numero = parseInt(document.getElementById("pilota-numero").value);
  const scuderia = document.getElementById("pilota-scuderia").value.trim();
  const punti = parseInt(document.getElementById("pilota-punti").value);

  if (!nickname || !numero || !scuderia) return;

  const dati = getDati();
  let pilota = dati.piloti.find(p => p.nickname === nickname);

  if (pilota) {
    pilota.numero = numero;
    pilota.scuderia = scuderia;
    pilota.punti = punti;
  } else {
    dati.piloti.push({
      id: Date.now(),
      nickname,
      numero,
      scuderia,
      punti,
      trend: "same",
      movimento: 0
    });
  }

  salvaDati(dati);
  renderPiloti();

  document.getElementById("pilota-nickname").value = "";
  document.getElementById("pilota-numero").value = "";
  document.getElementById("pilota-scuderia").value = "";
  document.getElementById("pilota-punti").value = "";
});

/* ============================
   GARE
============================ */

function renderGare() {
  const { gare } = getDati();
  const tbody = document.getElementById("gare-table-body");
  tbody.innerHTML = "";

  gare.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.numero}</td>
      <td>${g.nome}</td>
      <td>${g.data}</td>
      <td>
        <button class="btn-small danger" onclick="deleteGara(${g.numero})">Elimina</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  aggiornaSelectGare();
}

function deleteGara(numero) {
  const dati = getDati();
  dati.gare = dati.gare.filter(g => g.numero !== numero);
  salvaDati(dati);
  renderGare();
}

document.getElementById("add-gara-btn").addEventListener("click", () => {
  const numero = parseInt(document.getElementById("gara-numero").value);
  const nome = document.getElementById("gara-nome").value.trim();
  const data = document.getElementById("gara-data").value;

  if (!numero || !nome) return;

  const dati = getDati();
  let gara = dati.gare.find(g => g.numero === numero);

  if (gara) {
    gara.nome = nome;
    gara.data = data;
  } else {
    dati.gare.push({ numero, nome, data, risultati: [] });
  }

  salvaDati(dati);
  renderGare();

  document.getElementById("gara-numero").value = "";
  document.getElementById("gara-nome").value = "";
  document.getElementById("gara-data").value = "";
});

/* ============================
   RICALCOLO PUNTI + TREND + MOVIMENTO
============================ */

function aggiornaPuntiTotali() {
  const dati = getDati();

  // 1) Salva posizione precedente
  const posizioniVecchie = {};
  const pilotiPrima = [...dati.piloti].sort((a, b) => b.punti - a.punti);
  pilotiPrima.forEach((p, i) => posizioniVecchie[p.id] = i + 1);

  // 2) Reset punti
  dati.piloti.forEach(p => p.punti = 0);

  // 3) Somma punti da tutte le gare
  dati.gare.forEach(g => {
    g.risultati.forEach(r => {
      const pilota = dati.piloti.find(p => p.id === r.pilotaId);
      if (pilota) pilota.punti += r.punti;
    });
  });

  // 4) Calcola nuova classifica
  const pilotiDopo = [...dati.piloti].sort((a, b) => b.punti - a.punti);

  // 5) Trend basato sulla posizione + movimento
  pilotiDopo.forEach((p, i) => {
    const nuovaPos = i + 1;
    const vecchiaPos = posizioniVecchie[p.id] || nuovaPos;

    const movimento = vecchiaPos - nuovaPos;

    if (movimento > 0) {
      p.trend = "up";
      p.movimento = movimento;
    } else if (movimento < 0) {
      p.trend = "down";
      p.movimento = movimento;
    } else {
      p.trend = "same";
      p.movimento = 0;
    }
  });

  salvaDati(dati);
}

/* ============================
   PUNTEGGI
============================ */

function aggiornaSelectGare() {
  const { gare, piloti } = getDati();
  const garaSel = document.getElementById("gara-select");
  const pilotaSel = document.getElementById("pilota-select");

  garaSel.innerHTML = "";
  pilotaSel.innerHTML = "";

  gare.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.numero;
    opt.textContent = `G${g.numero} - ${g.nome}`;
    garaSel.appendChild(opt);
  });

  piloti.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nickname;
    pilotaSel.appendChild(opt);
  });
}

document.getElementById("add-punteggio-btn").addEventListener("click", () => {
  const garaNum = parseInt(document.getElementById("gara-select").value);
  const pilotaId = parseInt(document.getElementById("pilota-select").value);
  const punti = parseInt(document.getElementById("gara-punti").value);

  if (!garaNum || !pilotaId || isNaN(punti)) return;

  const dati = getDati();
  const gara = dati.gare.find(g => g.numero === garaNum);

  const esistente = gara.risultati.find(r => r.pilotaId === pilotaId);

  if (esistente) {
    esistente.punti = punti;
  } else {
    gara.risultati.push({ pilotaId, punti });
  }

  salvaDati(dati);
  aggiornaPuntiTotali();
  renderPiloti();

  document.getElementById("gara-punti").value = "";
});

/* ============================
   BACKUP
============================ */

document.getElementById("export-btn").addEventListener("click", () => {
  const dati = getDati();
  const blob = new Blob([JSON.stringify(dati)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_f1.json";
  a.click();
});

document.getElementById("import-btn").addEventListener("click", () => {
  const file = document.getElementById("import-file").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const dati = JSON.parse(e.target.result);
    salvaDati(dati);
    renderPiloti();
    renderScuderie();
    renderGare();
  };
  reader.readAsText(file);
});

/* ============================
   AVVIO
============================ */

renderPiloti();
renderScuderie();
renderGare();
