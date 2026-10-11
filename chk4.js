
// ====================================================================
// Onglets, quiz, comparaison, ajustement
// ====================================================================
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $$ = s => [...document.querySelectorAll(s)];
const SER = ['var(--accent)', 'var(--theory)', 'var(--ok)'];
const TABS = ['fiches', 'quiz', 'compare', 'fit'];

function setTab(name) {
  if (!TABS.includes(name)) name = 'fiches';
  if (name !== 'fiches' && typeof stopAnim === 'function') stopAnim();
  TABS.forEach(t => { $('#view-' + t).hidden = t !== name; });
  $$('#tabs [data-tab]').forEach(b => b.setAttribute('aria-current', String(b.dataset.tab === name)));
  try { sessionStorage.setItem('atlas-tab', name); } catch (e) {}
  if (name === 'compare') renderCmp();
  window.scrollTo(0, 0);
}
function openFiche(id) { selectLaw(id); setTab('fiches'); }
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.dataset.tab); });
document.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openFiche(b.dataset.open); });

const lawName = id => getLaw(id).name;
function lawSelectHTML(id, attrs) {
  const opt = L => `<option value="${L.id}"${L.id === id ? ' selected' : ''}>${L.name}</option>`;
  return `<select ${attrs}><optgroup label="${tl('Lois discrètes')}">${LAWS.filter(L => !isC(L)).map(opt).join('')}</optgroup><optgroup label="${tl('Lois continues')}">${LAWS.filter(isC).map(opt).join('')}</optgroup></select>`;
}
function paramRowsHTML(L, P, slot) {
  return L.params.map(q => {
    const mx = typeof q.max === 'function' ? q.max(P) : q.max;
    return `<div class="param"><div class="param-head"><label>${q.label}</label><span class="sym">${q.sym}</span></div>
      <div class="param-row"><input type="range" data-slot="${slot}" data-key="${q.key}" min="${q.min}" max="${mx}" step="${q.int ? 1 : (q.key === 'p' ? 0.001 : q.step)}" value="${P[q.key]}" aria-label="${esc(q.label)}">
      <input type="number" data-slot="${slot}" data-key="${q.key}" min="${q.min}" max="${mx}" step="${q.step}" value="${+P[q.key].toFixed(4)}" aria-label="${esc(q.label)}"></div></div>`;
  }).join('');
}

// ---------- Quiz ----------
const QS_KEY = 'atlas-quiz';
const quizStats = () => { try { return JSON.parse(localStorage.getItem(QS_KEY)) || {}; } catch (e) { return {}; } };
const saveQuizStats = s => { try { localStorage.setItem(QS_KEY, JSON.stringify(s)); } catch (e) {} };
const quiz = { phase: 'home', scope: 'all', kind: 'mix', n: 10, qs: [], i: 0, score: 0, picked: null, wrong: [] };
const optHTML = (v, label, on) => `<option value="${v}"${on ? ' selected' : ''}>${label}</option>`;

function renderQuizHome() {
  const st = quizStats();
  const scopeOpts = [['all', tl('Toutes les lois')], ['discrete', tl('Lois discrètes')], ['continuous', tl('Lois continues')], ['weak', tl('Mes points faibles')]]
    .map(([v, l]) => optHTML(v, l, quiz.scope === v)).join('')
    + `<optgroup label="${tl('Une seule loi')}">${LAWS.map(L => optHTML('law:' + L.id, L.name, quiz.scope === 'law:' + L.id)).join('')}</optgroup>`;
  const kindOpts = [['mix', tl('Un peu de tout')]].concat(Object.entries(QUIZ_KINDS)).map(([v, l]) => optHTML(v, l, quiz.kind === v)).join('');
  const nOpts = [5, 10, 20].map(v => optHTML(v, tlx`${v} questions`, quiz.n === v)).join('');
  const rows = LAWS.map(L => {
    const s = st[L.id] || { tries: 0, ok: 0 }; const pct = s.tries ? Math.round(100 * s.ok / s.tries) : null;
    return `<tr><th scope="row"><button class="link" type="button" data-open="${L.id}">${L.name}</button></th>
      <td><div class="bar"><span style="width:${pct ?? 0}%"></span></div></td><td class="r">${pct === null ? '—' : pct + '&nbsp;%'}</td><td class="r">${s.tries}</td></tr>`;
  }).join('');
  const memo = LAWS.map(L => `<tr><th scope="row"><button class="link" type="button" data-open="${L.id}">${L.name}</button></th>
    <td>${L.params.map(q => q.sym).join(', ')}</td><td class="f">${generalSupport(L) || L.genSupport}</td><td class="f">${L.F.mean}</td><td class="f">${L.F.variance}</td></tr>`).join('');
  $('#quiz-body').innerHTML = `
    <div class="panel quiz-setup">
      <div class="qs-grid">
        <label>${tl('Sujet')}<select id="q-scope">${scopeOpts}</select></label>
        <label>${tl('Type de questions')}<select id="q-kind">${kindOpts}</select></label>
        <label>${tl('Longueur')}<select id="q-n">${nOpts}</select></label>
      </div>
      <p class="note">${tl('Calculs de probabilités, espérance et variance, formules, reconnaissance de la loi dans une situation, applications par secteur et propriétés. Les valeurs changent à chaque partie.')}</p>
      <button class="btn" type="button" id="q-start">${tl('Commencer')}</button>
      <p class="err" id="q-err" aria-live="polite"></p>
    </div>
    <div class="grid2">
      <div class="chart-card"><h3>${tl('Ma progression')}</h3><p class="cap">${tl('Taux de bonnes réponses par loi, enregistré sur cet appareil.')}</p>
        <table class="mini"><tbody>${rows}</tbody></table>
        <p><button class="btn ghost" type="button" id="q-reset">${tl('Effacer ma progression')}</button></p></div>
      <div class="chart-card"><h3>${tl('Aide-mémoire')}</h3><p class="cap">${tl('Paramètres, support, espérance et variance de chaque loi.')}</p>
        <div class="table-wrap memo"><table class="mini wide"><thead><tr><th>${tl('Loi')}</th><th>${tl('Param.')}</th><th>${tl('Support')}</th><th>E(X)</th><th>V(X)</th></tr></thead><tbody>${memo}</tbody></table></div></div>
    </div>`;
}
function startQuiz() {
  const sc = quiz.scope; const all = LAWS;
  let pool = sc === 'discrete' ? all.filter(L => !isC(L)) : sc === 'continuous' ? all.filter(isC) : sc.startsWith('law:') ? [getLaw(sc.slice(4))] : sc === 'weak' ? weightedLaws(all, quizStats()) : all;
  quiz.qs = buildQuiz(pool, quiz.kind, quiz.n, all);
  if (!quiz.qs.length) { $('#q-err').textContent = tl('Pas de question de ce type pour cette loi : choisissez « Un peu de tout » ou un autre sujet.'); return; }
  Object.assign(quiz, { phase: 'run', i: 0, score: 0, picked: null, wrong: [] });
  renderQuiz();
}
function renderQuizRun() {
  const q = quiz.qs[quiz.i], done = quiz.picked !== null;
  const opts = q.options.map((o, j) => {
    let cls = 'opt'; if (done) cls += o.ok ? ' ok' : (j === quiz.picked ? ' bad' : ' dim');
    return `<button type="button" class="${cls}" data-pick="${j}"${done ? ' disabled' : ''}><span class="ltr">${'ABCD'[j]}</span><span class="otx">${o.html}</span></button>`;
  }).join('');
  const good = done && q.options[quiz.picked].ok;
  const fb = done ? `<div class="fb ${good ? 'ok' : 'bad'}" aria-live="polite"><b>${good ? tl('Bonne réponse.') : tl('Ce n\'est pas la bonne réponse.')}</b> ${q.explain}</div>
      <div class="qbtns"><button class="btn" type="button" id="q-next">${quiz.i + 1 < quiz.qs.length ? tl('Question suivante') : tl('Voir mon résultat')}</button><button class="btn ghost" type="button" data-open="${q.law}">${tlx`Revoir la fiche : ${lawName(q.law)}`}</button></div>` : '';
  $('#quiz-body').innerHTML = `
    <div class="qprog"><div class="bar"><span style="width:${100 * quiz.i / quiz.qs.length}%"></span></div><span>${tlx`Question ${quiz.i + 1} sur ${quiz.qs.length}`}</span><span>${tlx`Score : ${quiz.score}`}</span></div>
    <div class="panel qcard"><div class="qtag">${esc(QUIZ_KINDS[q.kind] || '')} · ${lawName(q.law)}</div>
      <div class="qtext">${q.html}</div><div class="opts" role="group" aria-label="${tl('Réponses')}">${opts}</div>${fb}
    </div>
    <p><button class="btn ghost" type="button" id="q-quit">${tl('Abandonner')}</button></p>`;
}
function renderQuizEnd() {
  const n = quiz.qs.length, pct = Math.round(100 * quiz.score / n);
  const msg = pct >= 90 ? tl('Excellent.') : pct >= 70 ? tl('Très bien.') : pct >= 50 ? tl('Pas mal, quelques points à revoir.') : tl('À retravailler : relisez les fiches indiquées ci-dessous.');
  const wrong = quiz.wrong.map(w => `<li><div class="qtag">${esc(QUIZ_KINDS[w.q.kind] || '')} · <button class="link" type="button" data-open="${w.q.law}">${lawName(w.q.law)}</button></div><div>${w.q.html}</div>
    <p class="note">${tlx`Votre réponse : ${w.q.options[w.pick].html}. Bonne réponse : ${w.q.options.find(o => o.ok).html}.`}</p><p class="expl">${w.q.explain}</p></li>`).join('');
  $('#quiz-body').innerHTML = `<div class="panel qend"><div class="score"><b>${quiz.score}</b> / ${n}</div><p>${msg} ${tlx`(${pct} % de bonnes réponses)`}</p>
    <div class="qbtns"><button class="btn" type="button" id="q-again">${tl('Rejouer')}</button><button class="btn ghost" type="button" id="q-home">${tl('Changer de sujet')}</button></div></div>
    ${wrong ? `<div><div class="sec-head"><h2>${tl('Questions à revoir')}</h2></div><ol class="wrong">${wrong}</ol></div>` : `<p class="note">${tl('Aucune erreur : rien à revoir.')}</p>`}`;
}
function renderQuiz() { quiz.phase === 'home' ? renderQuizHome() : quiz.phase === 'run' ? renderQuizRun() : renderQuizEnd(); }
$('#quiz-body').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'q-start') startQuiz();
  else if (b.dataset.pick !== undefined && quiz.picked === null) {
    const q = quiz.qs[quiz.i], j = +b.dataset.pick; quiz.picked = j;
    const ok = q.options[j].ok; if (ok) quiz.score++; else quiz.wrong.push({ q, pick: j });
    const st = quizStats(); const s = st[q.law] || (st[q.law] = { tries: 0, ok: 0 }); s.tries++; if (ok) s.ok++; saveQuizStats(st);
    renderQuizRun(); const nx = $('#q-next'); if (nx) nx.focus({ preventScroll: true });
  }
  else if (b.id === 'q-next') { if (quiz.i + 1 < quiz.qs.length) { quiz.i++; quiz.picked = null; renderQuizRun(); } else { quiz.phase = 'end'; renderQuiz(); } window.scrollTo(0, 0); }
  else if (b.id === 'q-quit' || b.id === 'q-home') { quiz.phase = 'home'; renderQuiz(); }
  else if (b.id === 'q-again') startQuiz();
  else if (b.id === 'q-reset') { if (confirm(tl('Effacer toute votre progression ?'))) { saveQuizStats({}); renderQuizHome(); } }
});
$('#quiz-body').addEventListener('change', e => {
  if (e.target.id === 'q-scope') quiz.scope = e.target.value;
  else if (e.target.id === 'q-kind') quiz.kind = e.target.value;
  else if (e.target.id === 'q-n') quiz.n = +e.target.value;
});
document.addEventListener('keydown', e => {
  if ($('#view-quiz').hidden || quiz.phase !== 'run' || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const j = '1234'.indexOf(e.key);
  if (j >= 0 && quiz.picked === null) { const b = $(`[data-pick="${j}"]`); if (b) b.click(); }
});

// ---------- Comparaison ----------
const cmp = { A: null, B: null, calc: { type: 'le', x: 5, alpha: 0.95 }, note: '' };
function setSlot(k, id, raw) { const L = getLaw(id); cmp[k] = { id, P: constrain(L, { ...defaults(L), ...(raw || {}) }) }; }
function loadPreset(i) { const p = COMPARE_PRESETS[i]; setSlot('A', ...p.A); setSlot('B', ...p.B); cmp.note = p.note; cmp.preset = i; buildCmpSlots(); renderCmp(); }
function buildCmpSlots() {
  ['A', 'B'].forEach(k => {
    const s = cmp[k], L = getLaw(s.id), nm = tlx`Loi ${k}`;
    $('#cmp-' + k).innerHTML = `<div class="slot-head"><span class="swatch" style="background:${SER[k === 'A' ? 0 : 1]}"></span><b>${nm}</b> ${lawSelectHTML(s.id, `data-slot="${k}" data-role="law" aria-label="${nm}"`)}</div>
      ${paramRowsHTML(L, s.P, k)}<div class="notation"><var>${k === 'A' ? 'X' : 'Y'}</var> ∼ <span data-nota="${k}">${L.notation(s.P)}</span></div>`;
  });
  $('#cmp-presets').innerHTML = COMPARE_PRESETS.map((p, i) => `<button type="button" class="chip${cmp.preset === i ? ' on' : ''}" data-preset="${i}">${p.label}</button>`).join('');
}
function syncSlot(k, skip) {
  const s = cmp[k], L = getLaw(s.id);
  for (const q of L.params) {
    const mx = typeof q.max === 'function' ? q.max(s.P) : q.max;
    $$(`#cmp-${k} [data-key="${q.key}"]`).forEach(el => { el.max = mx; if (el !== skip) el.value = el.type === 'number' ? +s.P[q.key].toFixed(4) : s.P[q.key]; });
  }
  $(`[data-nota="${k}"]`).innerHTML = L.notation(s.P);
}
$('#view-compare').addEventListener('input', e => {
  const el = e.target, k = el.dataset.slot, key = el.dataset.key; if (!k || !key || el.value === '') return;
  const s = cmp[k], L = getLaw(s.id); s.P[key] = parseFloat(el.value); constrain(L, s.P);
  syncSlot(k, el); cmp.note = ''; renderCmp();
});
$('#view-compare').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.role === 'law') { setSlot(el.dataset.slot, el.value); cmp.preset = -1; cmp.note = ''; buildCmpSlots(); renderCmp(); }
  else if (el.id === 'cmp-type') { cmp.calc.type = el.value; if (el.value === 'q') cmp.calc.alpha = 0.95; renderCmp(); }
  else if (el.id === 'cmp-x') { const v = parseFloat(String(el.value).replace(',', '.')); if (isFinite(v)) { cmp.calc[cmp.calc.type === 'q' ? 'alpha' : 'x'] = v; renderCmp(); } }
  else if (el.dataset.key) syncSlot(el.dataset.slot);
});
$('#cmp-presets').addEventListener('click', e => { const b = e.target.closest('[data-preset]'); if (b) loadPreset(+b.dataset.preset); });
$('#cmp-swap').addEventListener('click', () => { [cmp.A, cmp.B] = [cmp.B, cmp.A]; cmp.preset = -1; cmp.note = ''; buildCmpSlots(); renderCmp(); });

function cmpRange(es) {
  let lo = Infinity, hi = -Infinity;
  es.forEach(e => { let a, b; if (e.c) [a, b] = cview(e.L, e.P); else { const [i0, i1] = viewRange(e.T); a = e.T.ks[i0]; b = e.T.ks[i1]; } lo = Math.min(lo, a); hi = Math.max(hi, b); });
  if (!(hi > lo)) hi = lo + 1; return [lo, hi];
}
function cmpDensityChart(eA, eB, lo, hi) {
  const es = [eA, eB], allD = es.every(e => !e.c), anyD = es.some(e => !e.c);
  const pad = anyD ? 0.8 : 0; const xmin = lo - pad, xmax = hi + pad;
  const N = 320, xs = Array.from({ length: N + 1 }, (_, j) => xmin + (xmax - xmin) * j / N);
  let ys = []; es.forEach(e => { if (e.c) ys = ys.concat(xs.map(x => e.L.pdf(x, e.P))); else ys = ys.concat(e.T.ps); });
  const ymax = anyD ? Math.max(...ys.filter(Number.isFinite)) * 1.08 : densityCap(ys);
  const F = frame({ xmin, xmax, ymax, xInt: allD, xLabel: 'x', yLabel: tl('Comparaison des lois') });
  const bw = Math.max(2, Math.min(18, (F.sx(1) - F.sx(0)) * 0.8 / (allD ? 2 : 1)));
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  es.forEach((e, i) => {
    const col = SER[i];
    if (e.c) {
      const pts = xs.map(x => [x, Math.min(e.L.pdf(x, e.P), ymax * 3)]);
      out += `<path d="${pathOf([[xmin, 0], ...pts, [xmax, 0]], F)}Z" fill="${col}" opacity=".1"/><path d="${pathOf(pts, F)}" fill="none" stroke="${col}" stroke-width="2.2"/>`;
    } else {
      e.T.ks.forEach((k, j) => {
        if (k < xmin || k > xmax) return;
        const x = F.sx(k) + (allD ? (i ? 0 : -bw) : -bw / 2), y = F.sy(e.T.ps[j]), h = F.sy(0) - y;
        out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" fill="${col}" opacity="${allD ? .85 : .55}"/>`;
      });
    }
  });
  return out + '</g></svg>';
}
function cmpCdfChart(eA, eB, lo, hi) {
  const es = [eA, eB], anyD = es.some(e => !e.c), pad = anyD ? 0.8 : 0, xmin = lo - pad, xmax = hi + pad;
  const F = frame({ xmin, xmax, ymax: 1, xInt: es.every(e => !e.c), xLabel: 'x', yLabel: tl('Fonctions de répartition'), yFmt: y => fmtTxt(y, 2) });
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  es.forEach((e, i) => {
    let pts;
    if (e.c) { pts = []; for (let j = 0; j <= 320; j++) { const x = xmin + (xmax - xmin) * j / 320; pts.push([x, e.L.cdf(x, e.P)]); } }
    else { pts = [[xmin, 0]]; let prev = 0; e.T.ks.forEach((k, j) => { pts.push([k, prev]); pts.push([k, e.T.cs[j]]); prev = e.T.cs[j]; }); pts.push([xmax, prev]); }
    out += `<path d="${pathOf(pts, F)}" fill="none" stroke="${SER[i]}" stroke-width="2.2"${i ? ' stroke-dasharray="6 3"' : ''}/>`;
  });
  return out + '</g></svg>';
}
const nanTxt = x => (Number.isFinite(x) ? fmt(Math.abs(x) < 1e-10 ? 0 : x) : (Number.isNaN(x) ? tl('n\'existe pas') : fmt(x)));
function discreteCalc(e, c) {
  if (c.type === 'q') { const T = e.T; const i = T.cs.findIndex(v => v >= c.alpha - 1e-12); return i < 0 ? T.ks[T.ks.length - 1] : T.ks[i]; }
  if (c.type === 'le') return prob(e.T, { type: 'le', a: Math.floor(c.x) });
  return prob(e.T, { type: 'ge', a: Math.ceil(c.x) });
}
function calcOf(e, c) {
  if (!e.c) return discreteCalc(e, c);
  if (c.type === 'q') return quantile(e.L, e.P, Math.min(Math.max(c.alpha, 1e-6), 1 - 1e-6));
  return probC(e.L, e.P, { type: c.type, a: c.x });
}
function renderCmp() {
  if (!cmp.A) return;
  if ($('#view-compare').hidden) return;
  const eA = lawEval(getLaw(cmp.A.id), cmp.A.P), eB = lawEval(getLaw(cmp.B.id), cmp.B.P);
  const [lo, hi] = cmpRange([eA, eB]);
  const sA = summaryLaw(eA.L, eA.P), sB = summaryLaw(eB.L, eB.P);
  const row = (name, a, b, f = nanTxt) => `<tr><th scope="row">${name}</th><td class="v">${f(a)}</td><td class="v">${f(b)}</td></tr>`;
  const modeF = s => s.modeTxt ? s.modeTxt : nanTxt(s.mode);
  const modeRow = `<tr><th scope="row">${tl('Mode')}</th><td class="v">${modeF(sA)}</td><td class="v">${modeF(sB)}</td></tr>`;
  const supp = e => e.L.supportTxt(e.P);
  $('#cmp-chart1').innerHTML = cmpDensityChart(eA, eB, lo, hi);
  $('#cmp-chart2').innerHTML = cmpCdfChart(eA, eB, lo, hi);
  $('#cmp-legend').innerHTML = `<span style="--c:${SER[0]}">A : ${eA.L.name} ${eA.L.notation(eA.P)}</span><span style="--c:${SER[1]}">B : ${eB.L.name} ${eB.L.notation(eB.P)}</span>`;
  $('#cmp-cap1').innerHTML = eA.c && eB.c ? tl('Densités des deux lois. Plus les courbes se superposent, plus les lois sont proches.') : eA.c || eB.c ? tl('Barres : <span class="math">P(X = k)</span> pour la loi discrète ; courbe : densité de la loi continue. Les valeurs entières sont espacées de 1, donc la hauteur d\'une barre est comparable à la densité.') : tl('Barres : <span class="math">P(X = k)</span> pour chaque loi.');
  $('#cmp-table').innerHTML = `<thead><tr><th></th><th style="color:${SER[0]}">A</th><th style="color:${SER[1]}">B</th></tr></thead><tbody>
    ${row(tl('Espérance'), sA.mean, sB.mean)}${row(tl('Variance'), sA.variance, sB.variance)}${row(tl('Écart-type'), sA.sd, sB.sd)}${row(tl('Médiane'), sA.median, sB.median)}${modeRow}${row(tl('Asymétrie'), sA.skew, sB.skew)}${row(tl('Aplatissement (excès)'), sA.kurt, sB.kurt)}${row(tl('Support'), eA, eB, supp)}</tbody>`;
  const c = cmp.calc, isQ = c.type === 'q';
  $('#cmp-type').value = c.type; $('#cmp-x-lbl').textContent = isQ ? 'α =' : 'x =';
  const xi = $('#cmp-x'); if (document.activeElement !== xi) xi.value = isQ ? c.alpha : c.x;
  const vA = calcOf(eA, c), vB = calcOf(eB, c);
  const lbl = isQ ? tlx`quantile d'ordre ${fmt(c.alpha)}` : c.type === 'le' ? `P(X ≤ ${fmt(c.x)})` : `P(X ≥ ${fmt(c.x)})`;
  $('#cmp-calc').innerHTML = `<div class="calc-cols"><div style="border-color:${SER[0]}"><span class="note">A · ${lbl}</span><b>${nanTxt(vA)}</b></div><div style="border-color:${SER[1]}"><span class="note">B · ${lbl}</span><b>${nanTxt(vB)}</b></div><div><span class="note">${tl('Écart')}</span><b>${nanTxt(vA - vB)}</b></div></div>`;
  const w = Math.max(hi - lo, 1), D = compareDistances(eA, eB, lo - 0.2 * w, hi + 0.2 * w);
  const verdict = D.ks < 0.02 ? tl('Les deux lois sont presque indiscernables.') : D.ks < 0.1 ? tl('Les deux lois sont proches : l\'une peut souvent servir d\'approximation de l\'autre.') : D.ks < 0.3 ? tl('Les deux lois sont nettement différentes.') : tl('Les deux lois sont très différentes.');
  $('#cmp-dist').innerHTML = `<div class="stats"><div class="stat"><div class="k">${tl('Distance de Kolmogorov')}</div><div class="v">${fmt(D.ks, 4)}</div><div class="t">${tl('écart maximal entre les deux fonctions de répartition')}</div></div>
    ${D.tv !== null ? `<div class="stat"><div class="k">${tl('Distance en variation totale')}</div><div class="v">${fmt(D.tv, 4)}</div><div class="t">${tl('demi-somme des écarts entre les <span class="math">P(X = k)</span>')}</div></div>` : ''}</div>
    <p class="verdict">${verdict} <span class="note">${tl('(0 : identiques ; 1 : totalement différentes)')}</span></p>`;
  $('#cmp-note').innerHTML = cmp.note ? `<div class="mech">${cmp.note}</div>` : '';
  $('#cmp-open').innerHTML = [eA, eB].map(e => `<button type="button" class="btn ghost" data-open="${e.L.id}">${tlx`Fiche : ${e.L.name}`}</button>`).join(' ');
}

// ---------- Mes données ----------
const fit = { raw: '', force: 'auto', res: null, sel: 0, err: '' };
function fitExamplesInit() {
  $('#fit-examples').innerHTML = FIT_EXAMPLES.map((ex, i) => `<button type="button" class="chip" data-fex="${i}">${esc(ex.label)}</button>`).join('');
}
function runFit() {
  fit.raw = $('#fit-text').value; fit.force = $('#fit-kind').value;
  const p = parseData(fit.raw);
  if (p.err) { fit.err = p.err; fit.res = null; renderFit(); return; }
  const r = fitAll(p.data, fit.force);
  fit.err = r.cands.length ? '' : tl('Aucune des lois proposées ne peut s\'ajuster à ces valeurs (par exemple, valeurs négatives ou toutes égales). Vérifiez vos données.');
  fit.res = r; fit.sel = 0; fit.skipped = p.skipped; renderFit();
}
const rawTxt = (L, raw) => L.params.map(q => `<var>${q.sym}</var> = ${fmt(raw[q.key], 4)}`).join(' ; ');
const pTxt = p => Number.isNaN(p) ? '—' : p < 0.0001 ? '&lt; ' + fmt(0.0001) : fmt(p, 4);
function verdictOf(c) {
  const p = c.test.p;
  if (Number.isNaN(p)) return ['—', 'na', tl('Trop peu de classes pour tester')];
  return p >= 0.05 ? [tl('Compatible'), 'ok', tl('On ne rejette pas la loi (p ≥ 0,05)')] : [tl('Rejetée'), 'bad', tl('Les données s\'écartent de cette loi (p < 0,05)')];
}
const testName = c => c.test.name === 'Khi-deux' ? tl('du khi-deux') : tl('de Kolmogorov-Smirnov');
const testLabel = c => c.test.name === 'Khi-deux' ? tl('Khi-deux') : 'Kolmogorov-Smirnov';
function fitHistogram(d, c, discrete) {
  const L = getLaw(c.id), n = d.n;
  if (discrete) {
    const counts = new Map(); d.sorted.forEach(x => counts.set(x, (counts.get(x) || 0) + 1));
    const lo = d.min, hi = d.max;
    let ymax = 0; for (let k = lo; k <= hi; k++) ymax = Math.max(ymax, (counts.get(k) || 0) / n, L.pmf(k, c.raw));
    const F = frame({ xmin: lo - 0.8, xmax: hi + 0.8, ymax: ymax * 1.1, xInt: true, xLabel: tl('valeur'), yLabel: tl('Fréquences observées et loi ajustée') });
    const bw = Math.max(2, Math.min(40, (F.sx(1) - F.sx(0)) * 0.7));
    let out = F.open + F.g;
    for (let k = lo; k <= hi; k++) {
      const f = (counts.get(k) || 0) / n; const y = F.sy(f);
      out += `<rect class="bar" x="${(F.sx(k) - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(F.sy(0) - y).toFixed(1)}"/>`;
      const th = F.sy(L.pmf(k, c.raw)); out += `<line class="th-tick" x1="${(F.sx(k) - bw / 2 - 2).toFixed(1)}" x2="${(F.sx(k) + bw / 2 + 2).toFixed(1)}" y1="${th.toFixed(1)}" y2="${th.toFixed(1)}"/>`;
    }
    return out + '</svg>';
  }
  const bins = Math.max(5, Math.min(30, Math.ceil(Math.max(1 + Math.log2(n), Math.sqrt(n)))));
  const w = (d.max - d.min) / bins || 1, lo = d.min, hi = d.min + w * bins;
  const cnt = new Array(bins).fill(0); d.sorted.forEach(x => cnt[Math.min(bins - 1, Math.floor((x - lo) / w))]++);
  const dens = cnt.map(k => k / (n * w));
  const xs = Array.from({ length: 241 }, (_, j) => lo - w + (hi - lo + 2 * w) * j / 240);
  const fy = xs.map(x => L.pdf(x, c.raw));
  const ymax = densityCap(dens.concat(fy.filter(Number.isFinite))) * 1.05;
  const F = frame({ xmin: lo - w, xmax: hi + w, ymax, xInt: false, xLabel: tl('valeur'), yLabel: tl('Histogramme et densité ajustée') });
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  dens.forEach((h, j) => { const x0 = F.sx(lo + j * w), x1 = F.sx(lo + (j + 1) * w), y = F.sy(h); out += `<rect class="bar" x="${(x0 + 0.5).toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(1, x1 - x0 - 1).toFixed(1)}" height="${(F.sy(0) - y).toFixed(1)}" opacity=".6"/>`; });
  out += `<path class="th-line" d="${pathOf(xs.map((x, j) => [x, Number.isFinite(fy[j]) ? Math.min(fy[j], ymax * 3) : 0]), F)}"/>`;
  return out + '</g></svg>';
}
function fitCdfChart(d, c) {
  const L = getLaw(c.id), n = d.n, s = d.sorted, step = Math.max(1, Math.floor(n / 300));
  const w = (d.max - d.min) || 1, xmin = d.min - 0.05 * w, xmax = d.max + 0.05 * w;
  const F = frame({ xmin, xmax, ymax: 1, xInt: false, xLabel: tl('valeur'), yLabel: tl('Fonction de répartition empirique'), yFmt: y => fmtTxt(y, 2) });
  const pts = [[xmin, 0]]; let prev = 0;
  for (let i = 0; i < n; i += step) { pts.push([s[i], prev]); prev = (i + 1) / n; pts.push([s[i], prev]); }
  pts.push([xmax, 1]);
  const ev = lawEval(L, c.raw), th = []; for (let j = 0; j <= 240; j++) { const x = xmin + (xmax - xmin) * j / 240; th.push([x, cdfOfEval(ev, x)]); }
  return F.open + F.g + `<g clip-path="url(#${F.clipId})"><path d="${pathOf(pts, F)}" fill="none" stroke="${SER[0]}" stroke-width="2"/><path d="${pathOf(th, F)}" fill="none" stroke="${SER[1]}" stroke-width="2" stroke-dasharray="6 3"/></g></svg>`;
}
function renderFit() {
  const err = $('#fit-err'); err.textContent = fit.err;
  const out = $('#fit-out');
  if (!fit.res || !fit.res.cands.length) { out.hidden = true; return; }
  out.hidden = false;
  const { d, discrete, cands } = fit.res; const c = cands[fit.sel], L = getLaw(c.id);
  const best = cands[0], bL = getLaw(best.id);
  $('#fit-stats').innerHTML = [[tl('Observations'), d.n], [tl('Moyenne'), fmt(d.mean)], [tl('Écart-type'), fmt(d.sd)], [tl('Médiane'), fmt(d.median)], [tl('Minimum'), fmt(d.min)], [tl('Maximum'), fmt(d.max)], [tl('Type retenu'), discrete ? tl('discret') : tl('continu')]]
    .map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('');
  const w100 = Math.round(best.weight * 100);
  let sum = tlx`<b>${bL.name}</b> ${bL.notation(best.raw)} est la loi la mieux placée selon le critère d'Akaike (poids ${w100} %). `;
  if (Number.isNaN(best.test.p)) sum += tl('Le test d\'adéquation n\'est pas applicable (trop peu de classes).');
  else if (best.test.p >= 0.05) sum += tlx`Le test ${testName(best)} ne la rejette pas (p = ${pTxt(best.test.p)}).`;
  else sum += tlx`Mais le test ${testName(best)} la rejette (p = ${pTxt(best.test.p)}) : aucune loi proposée ne décrit bien ces données.`;
  if (cands.length > 1 && cands[1].delta < 2) sum += ' ' + tlx`La loi suivante (${getLaw(cands[1].id).name}) est presque aussi bonne : les données ne suffisent pas à les départager.`;
  $('#fit-summary').innerHTML = sum;
  $('#fit-table').innerHTML = `<thead><tr><th>#</th><th>${tl('Loi')}</th><th>${tl('Paramètres estimés')}</th><th class="r">AIC</th><th class="r">${tl('Poids')}</th><th class="r">${tl('p-valeur')}</th><th>${tl('Verdict')}</th><th></th></tr></thead><tbody>` +
    cands.map((k, i) => { const l = getLaw(k.id), v = verdictOf(k); return `<tr data-fsel="${i}" class="${i === fit.sel ? 'sel' : ''}"><td>${i + 1}</td><th scope="row">${l.name}${k.note ? `<small>${esc(tl(k.note))}</small>` : ''}</th><td>${rawTxt(l, k.raw)}</td><td class="r">${fmt(k.aic, 1)}</td>
      <td class="r"><div class="wbar"><span style="width:${Math.round(k.weight * 100)}%"></span></div>${Math.round(k.weight * 100)}&nbsp;%</td><td class="r" title="${esc(testLabel(k))}">${pTxt(k.test.p)}</td><td><span class="vd ${v[1]}" title="${esc(v[2])}">${v[0]}</span></td>
      <td><button type="button" class="btn ghost sm" data-open="${k.id}" data-fitraw="${i}">${tl('Fiche')}</button></td></tr>`; }).join('') + '</tbody>';
  $('#fit-sel').textContent = `${L.name} ${L.notation(c.raw)}`;
  $('#fit-chart1').innerHTML = fitHistogram(d, c, discrete);
  $('#fit-chart2').innerHTML = fitCdfChart(d, c);
  $('#fit-cap1').innerHTML = discrete ? tl('Barres : fréquences observées. Traits rouges : probabilités <span class="math">P(X = k)</span> de la loi ajustée.') : tl('Barres : histogramme des données (aire totale 1). Courbe rouge : densité de la loi ajustée.');
  $('#fit-skip').textContent = fit.skipped ? tl('La première ligne (un titre de colonne) a été ignorée.') : '';
}
$('#fit-run').addEventListener('click', runFit);
$('#fit-examples').addEventListener('click', e => {
  const b = e.target.closest('[data-fex]'); if (!b) return;
  const ex = FIT_EXAMPLES[+b.dataset.fex]; $('#fit-text').value = exampleData(ex).join(' '); $('#fit-kind').value = 'auto'; runFit();
});
$('#fit-file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  if (f.size > 5e6) { $('#fit-err').textContent = tl('Fichier trop volumineux (5 Mo maximum).'); return; }
  const r = new FileReader(); r.onload = () => { $('#fit-text').value = String(r.result); runFit(); };
  r.onerror = () => { $('#fit-err').textContent = tl('Impossible de lire ce fichier.'); };
  r.readAsText(f); e.target.value = '';
});
$('#fit-out').addEventListener('click', e => {
  const o = e.target.closest('[data-fitraw]');
  if (o) { const k = fit.res.cands[+o.dataset.fitraw], L = getLaw(k.id); state.params[L.id] = constrain(L, { ...state.params[L.id], ...k.raw }); return; }
  const tr = e.target.closest('[data-fsel]'); if (tr && fit.res) { fit.sel = +tr.dataset.fsel; renderFit(); }
});

// ---------- Initialisation ----------
(function initTabs() {
  const ls = $('#lang-select'); ls.value = LANG;
  ls.addEventListener('change', e => { const v = e.target.value; try { localStorage.setItem('atlas-lang', v); } catch (x) {} location.href = location.pathname + '?lang=' + v + location.hash; });
  fitExamplesInit();
  const seed = COMPARE_PRESETS[0]; setSlot('A', ...seed.A); setSlot('B', ...seed.B); cmp.note = seed.note; cmp.preset = 0; buildCmpSlots();
  renderQuiz();
  let t = 'fiches'; try { t = sessionStorage.getItem('atlas-tab') || 'fiches'; } catch (e) {}
  if (location.hash && getLaw(location.hash.slice(1))) t = 'fiches';
  setTab(t);
  window.scrollTo(0, 0);
})();
