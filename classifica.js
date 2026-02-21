/* ============================
   LETTURA DATI
============================ */

function getDati() {
  const pilotiLS = localStorage.getItem('piloti');
  const scuderieLS = localStorage.getItem('scuderie');
  const gareLS = localStorage.getItem('gare');

  return {
    piloti: pilotiLS ? JSON.parse(pilotiLS) : [],
    scuderie: scuderieLS ? JSON.parse(scuderieLS) : [],
    gare: gareLS ? JSON.parse(gareLS) : []
  };
}

/* ============================
   CLASSIFICA
============================ */

function renderClassifica() {
  const { piloti, scuderie } = getDati();

  const coloriScuderie = {};
  const loghiScuderie = {};
  scuderie.forEach(s => {
    coloriScuderie[s.nome] = s.colore;
    loghiScuderie[s.nome] = s.logo;
  });

  const pilotiOrd = [...piloti].sort((a, b) => b.punti - a.punti);

  const tbody = document.getElementById('classifica-body');
  tbody.innerHTML = '';

  pilotiOrd.forEach((pilota, index) => {
    const tr = document.createElement('tr');

    /* ============================
       COLORAZIONE PODIO
    ============================ */
    if (index === 0) tr.classList.add("podio-oro");
    else if (index === 1) tr.classList.add("podio-argento");
    else if (index === 2) tr.classList.add("podio-bronzo");
    else tr.classList.add("podio-grigio");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="${
  index === 0 ? 'nome-oro' :
  index === 1 ? 'nome-argento' :
  index === 2 ? 'nome-bronzo' :
  ''
}">${pilota.nickname}</td>

      <td>${pilota.numero}</td>

      <td>
        <img src="${loghiScuderie[pilota.scuderia] || ''}" class="logo-scuderia">
        <span class="badge-scuderia" style="background:${coloriScuderie[pilota.scuderia] || '#444'}">
          ${pilota.scuderia}
        </span>
      </td>

      <td class="punti punti-anim">${pilota.punti}</td>

      <td class="${
        pilota.trend === 'up' ? 'trend-up' :
        pilota.trend === 'down' ? 'trend-down' :
        'trend-same'
      }">
        ${
          pilota.trend === 'up'
            ? `▲ +${pilota.movimento || 0}`
          : pilota.trend === 'down'
            ? `▼ ${pilota.movimento || 0}`
          : `■ 0`
        }
      </td>
    `;

    tbody.appendChild(tr);
  });
}


/* ============================
   STORICO GARE
============================ */

function renderStoricoGare() {
  const { gare, piloti } = getDati();
  const container = document.getElementById('storico-gare');
  container.innerHTML = '';

  if (!gare.length) {
    container.textContent = 'Nessuna gara registrata.';
    return;
  }

  const gareOrd = [...gare].sort((a, b) => a.numero - b.numero);

  gareOrd.forEach(g => {
    const div = document.createElement('div');
    div.className = 'gara-block';

    const title = document.createElement('div');
    title.className = 'gara-title';
    title.textContent = `Gara ${g.numero} – ${g.nome} (${g.data || 'data n/d'})`;
    div.appendChild(title);

    g.risultati.forEach(r => {
      const pilota = piloti.find(p => p.id === r.pilotaId);
      if (!pilota) return;

      const p = document.createElement('div');
      p.className = 'gara-punti';
      p.textContent = `${pilota.nickname} – ${r.punti} punti`;
      div.appendChild(p);
    });

    container.appendChild(div);
  });
}

/* ============================
   GRAFICI
============================ */

let chartGara, chartCumulato;

function renderGrafici() {
  const { gare, piloti, scuderie } = getDati();
  const ctxGara = document.getElementById('chart-gara').getContext('2d');
  const ctxCum = document.getElementById('chart-cumulato').getContext('2d');

  if (!gare.length || !piloti.length) {
    if (chartGara) chartGara.destroy();
    if (chartCumulato) chartCumulato.destroy();
    return;
  }

  const gareOrd = [...gare].sort((a, b) => a.numero - b.numero);
  const labels = gareOrd.map(g => `G${g.numero}`);

  const coloriScuderie = {};
  scuderie.forEach(s => {
    coloriScuderie[s.nome] = s.colore || '#ffffff';
  });

  const datasetsGara = [];
  const datasetsCum = [];

  piloti.forEach(p => {
    let cumulato = 0;
    const puntiGara = [];
    const puntiCumulati = [];

    gareOrd.forEach(g => {
      const res = g.risultati.find(r => r.pilotaId === p.id);
      const punti = res ? res.punti : 0;
      puntiGara.push(punti);
      cumulato += punti;
      puntiCumulati.push(cumulato);
    });

    const colore = coloriScuderie[p.scuderia] || '#ffffff';

    datasetsGara.push({
      label: p.nickname,
      data: puntiGara,
      borderColor: colore,
      backgroundColor: colore + '55',
      tension: 0.3
    });

    datasetsCum.push({
      label: p.nickname,
      data: puntiCumulati,
      borderColor: colore,
      backgroundColor: colore + '55',
      tension: 0.3
    });
  });

  if (chartGara) chartGara.destroy();
  if (chartCumulato) chartCumulato.destroy();

  chartGara = new Chart(ctxGara, {
    type: 'line',
    data: { labels, datasets: datasetsGara },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });

  chartCumulato = new Chart(ctxCum, {
    type: 'line',
    data: { labels, datasets: datasetsCum },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}
/* ============================
   CLASSIFICA COSTRUTTORI
============================ */

function renderClassificaCostruttori() {
  const { piloti, scuderie } = getDati();

  // Normalizza nomi scuderie
  const puntiScuderie = {};
  scuderie.forEach(s => {
    puntiScuderie[s.nome.trim().toLowerCase()] = 0;
  });

  // Somma punti piloti → scuderia
  piloti.forEach(p => {
    const nomeScuderia = p.scuderia.trim().toLowerCase();
    if (puntiScuderie[nomeScuderia] !== undefined) {
      puntiScuderie[nomeScuderia] += p.punti;
    }
  });

  // Converti in array ordinato
  const classifica = Object.entries(puntiScuderie)
    .map(([nome, punti]) => {
      const scuderiaOriginale = scuderie.find(s => s.nome.trim().toLowerCase() === nome);
      return {
        nome: scuderiaOriginale ? scuderiaOriginale.nome : nome,
        punti
      };
    })
    .sort((a, b) => b.punti - a.punti);

  const tbody = document.getElementById("classifica-costruttori");
  tbody.innerHTML = "";

  classifica.forEach((s, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="${
        index === 0 ? 'nome-oro' :
        index === 1 ? 'nome-argento' :
        index === 2 ? 'nome-bronzo' : ''
      }">${s.nome}</td>
      <td>${s.punti}</td>
    `;

    tbody.appendChild(tr);
  });
}


/* ============================
   AVVIO
============================ */

renderClassifica();
renderStoricoGare();
renderGrafici();
renderClassificaCostruttori();


/* Tema */
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});

/* Stampa PDF */
document.getElementById("print-btn").addEventListener("click", () => {
  window.print();
});




