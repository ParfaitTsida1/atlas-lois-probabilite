
const $ = s => document.querySelector(s);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isC = L => L.kind === 'continuous';
const defaults = L => Object.fromEntries(L.params.map(q => [q.key, q.value]));

const state = { law: LAWS[1], params: {}, overlay: 'none', calc: { type: 'le', a: 8, b: 10 }, sim: null, anim: null };
LAWS.forEach(L => { state.params[L.id] = constrain(L, defaults(L)); });
try { const saved = localStorage.getItem('atlas-law'); if (saved && getLaw(saved)) state.law = getLaw(saved); } catch (e) {}
if (location.hash && getLaw(location.hash.slice(1))) state.law = getLaw(location.hash.slice(1));

const fmtMoment = x => Number.isNaN(x) ? tl('n\'existe pas') : fmt(Math.abs(x) < 1e-10 ? 0 : x);

// ---------- Graphiques SVG ----------
function niceStep(range, count) {
  const raw = range / Math.max(count, 1); const mag = 10 ** Math.floor(Math.log10(raw)); const r = raw / mag;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 2.5 ? 2.5 : r <= 5 ? 5 : 10) * mag;
}
function ticks(min, max, count, integer) {
  let st = niceStep(max - min || 1, count); if (integer) st = Math.max(1, Math.round(st));
  const out = []; for (let x = Math.ceil(min / st - 1e-9) * st; x <= max + 1e-9; x += st) out.push(+x.toFixed(10)); return out;
}
function frame({ W = 480, H = 290, xmin, xmax, ymin = 0, ymax, xInt = true, yFmt = y => fmtTxt(y, 3), xLabel = '', yLabel = '' }) {
  const m = { l: 50, r: 12, t: 14, b: xLabel ? 44 : 30 };
  const sx = x => m.l + (x - xmin) / (xmax - xmin) * (W - m.l - m.r);
  const sy = y => H - m.b - (y - ymin) / (ymax - ymin || 1) * (H - m.t - m.b);
  let g = '';
  for (const y of ticks(ymin, ymax, 5)) g += `<line class="ax" x1="${m.l}" x2="${W - m.r}" y1="${sy(y)}" y2="${sy(y)}"/><text class="tk" x="${m.l - 6}" y="${sy(y) + 4}" text-anchor="end">${yFmt(y)}</text>`;
  g += `<line class="ax0" x1="${m.l}" x2="${W - m.r}" y1="${sy(ymin)}" y2="${sy(ymin)}"/>`;
  const xt = xInt ? ticks(Math.ceil(xmin), Math.floor(xmax), 9, true) : ticks(xmin, xmax, 7, false);
  for (const x of xt) g += `<line class="ax0" x1="${sx(x)}" x2="${sx(x)}" y1="${sy(ymin)}" y2="${sy(ymin) + 4}"/><text class="tk" x="${sx(x)}" y="${sy(ymin) + 17}" text-anchor="middle">${x.toLocaleString(LOC, { maximumFractionDigits: 3 })}</text>`;
  if (xLabel) g += `<text class="lbl" x="${(m.l + W - m.r) / 2}" y="${H - 6}" text-anchor="middle">${xLabel}</text>`;
  const id = 'c' + Math.random().toString(36).slice(2, 8);
  const clip = `<defs><clipPath id="${id}"><rect x="${m.l}" y="${m.t - 2}" width="${W - m.l - m.r}" height="${H - m.t - m.b + 2}"/></clipPath></defs>`;
  return { W, H, m, sx, sy, g, clipId: id, open: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${yLabel}">${clip}` };
}
const pathOf = (pts, F) => pts.map(([x, y], j) => `${j ? 'L' : 'M'}${F.sx(x).toFixed(1)},${F.sy(y).toFixed(1)}`).join('');

// --- discrètes ---
function viewRange(T) {
  const n = T.ks.length;
  if (n <= 16) return [0, n - 1];
  let i0 = 0; while (i0 < n - 1 && T.cs[i0] < 2e-4) i0++;
  let i1 = n - 1; while (i1 > i0 && T.cs[i1 - 1] > 1 - 2e-4) i1--;
  if (i1 - i0 < 6) i1 = Math.min(n - 1, i0 + 6);
  return [i0, i1];
}
function pmfChart(L, P, T, q) {
  const [i0, i1] = viewRange(T);
  const ks = T.ks.slice(i0, i1 + 1), ps = T.ps.slice(i0, i1 + 1);
  const ov = L.overlays.find(o => o.id === state.overlay);
  const ovf = ov ? ov.fn(P) : null;
  let ymax = Math.max(...ps);
  if (ovf) for (let k = ks[0]; k <= ks[ks.length - 1]; k++) ymax = Math.max(ymax, ovf(k));
  ymax *= 1.08;
  const F = frame({ xmin: ks[0] - 0.6, xmax: ks[ks.length - 1] + 0.6, ymax, xLabel: 'k', yLabel: tl('Loi de probabilité') });
  const bw = Math.max(1, Math.min(26, (F.sx(1) - F.sx(0)) * 0.62));
  let out = F.open + F.g;
  const anyHl = q && ks.some(k => inEvent(k, q));
  ks.forEach((k, i) => {
    const x = F.sx(k), y = F.sy(ps[i]), y0 = F.sy(0);
    const cls = anyHl ? (inEvent(k, q) ? 'bar hl' : 'bar dim') : 'bar';
    out += `<rect class="${cls}" x="${x - bw / 2}" y="${y}" width="${bw}" height="${Math.max(0, y0 - y)}" rx="${bw > 6 ? 2 : 0}"><title>P(X = ${k}) = ${fmtTxt(ps[i], 5)}</title></rect>`;
  });
  if (ovf) {
    if (ov.kind === 'points') ks.forEach(k => { out += `<circle class="ov-pt" cx="${F.sx(k)}" cy="${F.sy(ovf(k))}" r="${Math.min(4.5, Math.max(2.5, bw / 3))}"><title>approximation : ${fmtTxt(ovf(k), 5)}</title></circle>`; });
    else {
      const a = ks[0] - 0.6, b = ks[ks.length - 1] + 0.6, pts = [];
      for (let j = 0; j <= 240; j++) { const x = a + (b - a) * j / 240; pts.push([x, ovf(x)]); }
      out += `<path class="ov-line" d="${pathOf(pts, F)}"/>`;
    }
  }
  return out + '</svg>';
}
function cdfChart(L, P, T) {
  const [i0, i1] = viewRange(T);
  const ks = T.ks.slice(i0, i1 + 1), cs = T.cs.slice(i0, i1 + 1);
  const pad = Math.max(1, Math.round((ks[ks.length - 1] - ks[0]) * 0.06));
  const xmin = ks[0] - pad, xmax = ks[ks.length - 1] + pad;
  const F = frame({ xmin, xmax, ymax: 1.04, xLabel: 'x', yLabel: tl('Fonction de répartition') });
  let out = F.open + F.g;
  const before = i0 > 0 ? T.cs[i0 - 1] : 0;
  let d = `M${F.sx(xmin)},${F.sy(before)}L${F.sx(ks[0])},${F.sy(before)}`;
  const dots = ks.length <= 60; let circles = '';
  ks.forEach((k, i) => {
    const x2 = i < ks.length - 1 ? ks[i + 1] : xmax;
    d += `M${F.sx(k)},${F.sy(cs[i])}L${F.sx(x2)},${F.sy(cs[i])}`;
    if (dots) {
      circles += `<circle class="step-open" cx="${F.sx(k)}" cy="${F.sy(i ? cs[i - 1] : before)}" r="3.2"/>`;
      circles += `<circle class="step-dot" cx="${F.sx(k)}" cy="${F.sy(cs[i])}" r="3.4"><title>F(${k}) = ${fmtTxt(cs[i], 5)}</title></circle>`;
    }
  });
  return out + `<path class="step" d="${d}"/>` + circles + '</svg>';
}

// --- continues ---
function cview(L, P) {
  if (L.view) return L.view(P);
  const s = L.support(P);
  return [isFinite(s.min) ? s.min : quantile(L, P, 0.001), isFinite(s.max) ? s.max : quantile(L, P, 0.999)];
}
function densityCap(vals) {
  const f = vals.filter(y => isFinite(y)).sort((a, b) => a - b);
  if (!f.length) return 1;
  const top = f[f.length - 1], p90 = f[Math.floor(0.9 * (f.length - 1))];
  return Math.min(top, 3 * p90) * 1.08 || 1;
}
function eventInterval(L, P, q, lo, hi) {
  switch (q.type) {
    case 'le': case 'lt': return [lo, Math.min(hi, q.a)];
    case 'ge': case 'gt': return [Math.max(lo, q.a), hi];
    case 'between': return [Math.max(lo, q.a), Math.min(hi, q.b)];
    case 'q': return (q.a > 0 && q.a < 1) ? [lo, Math.min(hi, quantile(L, P, q.a))] : null;
  }
  return null;
}
function densityChart(L, P, q) {
  const [lo, hi] = cview(L, P); const N = 320;
  const xs = Array.from({ length: N + 1 }, (_, j) => lo + (hi - lo) * j / N);
  const ys = xs.map(x => L.pdf(x, P));
  const ov = L.overlays.find(o => o.id === state.overlay); const ovf = ov ? ov.fn(P) : null;
  const ymax = densityCap(ovf ? ys.concat(xs.map(ovf)) : ys);
  const F = frame({ xmin: lo, xmax: hi, ymax, xInt: false, xLabel: 'x', yLabel: tl('Densité') });
  const clampY = y => isFinite(y) ? Math.min(y, ymax * 3) : ymax * 3;
  const pts = xs.map((x, j) => [x, clampY(ys[j])]);
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  out += `<path class="dens-area" d="${pathOf([[lo, 0], ...pts, [hi, 0]], F)}Z"/>`;
  const iv = q && eventInterval(L, P, q, lo, hi);
  if (iv && iv[1] > iv[0]) {
    const hp = []; for (let j = 0; j <= 160; j++) { const x = iv[0] + (iv[1] - iv[0]) * j / 160; hp.push([x, clampY(L.pdf(x, P))]); }
    out += `<path class="dens-hl" d="${pathOf([[iv[0], 0], ...hp, [iv[1], 0]], F)}Z"/>`;
  }
  out += `<path class="dens-line" d="${pathOf(pts, F)}"/>`;
  if (ovf) out += `<path class="ov-line" d="${pathOf(xs.map(x => [x, clampY(ovf(x))]), F)}"/>`;
  out += '</g>';
  return out + '</svg>';
}
function ccdfChart(L, P, q) {
  const [lo, hi] = cview(L, P); const N = 320;
  const F = frame({ xmin: lo, xmax: hi, ymax: 1.04, xInt: false, xLabel: 'x', yLabel: tl('Fonction de répartition') });
  const pts = Array.from({ length: N + 1 }, (_, j) => { const x = lo + (hi - lo) * j / N; return [x, L.cdf(x, P)]; });
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})"><path class="step" d="${pathOf(pts, F)}"/>`;
  const mark = (x, y) => `<path class="guide" d="M${F.sx(lo)},${F.sy(y)}L${F.sx(x)},${F.sy(y)}L${F.sx(x)},${F.sy(0)}"/><circle class="guide-dot" cx="${F.sx(x)}" cy="${F.sy(y)}" r="4"/>`;
  if (q) {
    if (q.type === 'q' && q.a > 0 && q.a < 1) out += mark(quantile(L, P, q.a), q.a);
    else if (q.type === 'between') { out += mark(q.a, L.cdf(q.a, P)) + mark(q.b, L.cdf(q.b, P)); }
    else if (q.type !== 'q') out += mark(q.a, L.cdf(q.a, P));
  }
  return out + '</g></svg>';
}

// --- simulation ---
function simChartD(L, P, T) {
  const S = state.sim;
  const [i0, i1] = viewRange(T);
  let kmin = T.ks[i0], kmax = T.ks[i1];
  if (S.n) { kmin = Math.min(kmin, S.min); kmax = Math.max(kmax, S.max); }
  let ymax = 0; const th = k => L.pmf(k, P);
  for (let k = kmin; k <= kmax; k++) ymax = Math.max(ymax, th(k), S.n ? (S.counts.get(k) || 0) / S.n : 0);
  ymax *= 1.1;
  const F = frame({ xmin: kmin - 0.6, xmax: kmax + 0.6, ymax, xLabel: 'k', yLabel: tl('Fréquences observées') });
  const bw = Math.max(1, Math.min(26, (F.sx(1) - F.sx(0)) * 0.62));
  let out = F.open + F.g;
  if (S.n) for (const [k, c] of S.counts) {
    if (k < kmin || k > kmax) continue;
    const f = c / S.n, y = F.sy(f);
    out += tlx`<rect class="emp" x="${F.sx(k) - bw / 2}" y="${y}" width="${bw}" height="${F.sy(0) - y}"><title>k = ${k} : ${c} ${pl(c, 'tirage', 'tirages')}, fréquence ${fmtTxt(f, 4)} (théorie ${fmtTxt(th(k), 4)})</title></rect>`;
  }
  const tw = Math.max(bw + 4, 5);
  for (let k = kmin; k <= kmax; k++) { const p = th(k); if (p > 0) out += `<line class="th-tick" x1="${F.sx(k) - tw / 2}" x2="${F.sx(k) + tw / 2}" y1="${F.sy(p)}" y2="${F.sy(p)}"/>`; }
  if (!S.n) out += tlx`<text class="lbl" x="${(F.m.l + F.W) / 2}" y="${F.H / 2 - 30}" text-anchor="middle">Lancez des tirages pour voir apparaître les fréquences.</text>`;
  return out + '</svg>';
}
function simChartC(L, P) {
  const S = state.sim; const [lo, hi] = cview(L, P); const B = 40, w = (hi - lo) / B;
  const counts = new Array(B).fill(0); let outside = 0;
  for (const x of S.samples) { const i = Math.floor((x - lo) / w); if (i >= 0 && i < B) counts[i]++; else if (x === hi) counts[B - 1]++; else outside++; }
  const dens = counts.map(c => S.n ? c / (S.n * w) : 0);
  const xs = Array.from({ length: 241 }, (_, j) => lo + (hi - lo) * j / 240);
  const ys = xs.map(x => L.pdf(x, P));
  const ymax = Math.max(densityCap(ys), ...dens.map(d => Math.min(d, densityCap(ys) * 1.5)));
  const F = frame({ xmin: lo, xmax: hi, ymax, xInt: false, xLabel: 'x', yLabel: tl('Histogramme des tirages') });
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  dens.forEach((d, i) => { if (!d) return; const x0 = F.sx(lo + i * w), x1 = F.sx(lo + (i + 1) * w), y = F.sy(d); out += `<rect class="emp" x="${x0 + 0.5}" y="${y}" width="${Math.max(0.5, x1 - x0 - 1)}" height="${F.sy(0) - y}"><title>[${fmtTxt(lo + i * w, 3)} ; ${fmtTxt(lo + (i + 1) * w, 3)}[ : ${counts[i]} tirages</title></rect>`; });
  out += `<path class="th-line" d="${pathOf(xs.map((x, j) => [x, isFinite(ys[j]) ? Math.min(ys[j], ymax * 3) : ymax * 3]), F)}"/></g>`;
  if (!S.n) out += tlx`<text class="lbl" x="${(F.m.l + F.W) / 2}" y="${F.H / 2 - 30}" text-anchor="middle">Lancez des tirages pour voir apparaître l'histogramme.</text>`;
  else if (outside) out += tlx`<text class="lbl" x="${F.W - F.m.r - 4}" y="${F.m.t + 12}" text-anchor="end">${outside.toLocaleString(LOC)} ${pl(outside, 'tirage', 'tirages')} hors du cadre</text>`;
  return out + '</svg>';
}
function runChart(L, P) {
  const S = state.sim, m = L.mean(P), sd = Math.sqrt(L.variance(P));
  const pts = S.run, nmax = Math.max(10, S.n);
  const finiteM = isFinite(m), finiteSd = isFinite(sd);
  let center, span;
  if (finiteM) {
    center = m;
    span = finiteSd ? Math.max(sd * 1.96 / Math.sqrt(Math.max(5, Math.min(nmax, 20))), 1e-6) : 1e-6;
    pts.forEach(([n, y]) => { if (n >= 5) span = Math.max(span, Math.abs(y - m)); });
    if (!finiteSd && span < 1e-5) span = 1;
  } else {
    const ys = pts.filter(([n]) => n >= 5).map(([, y]) => y);
    const a = ys.length ? Math.min(...ys) : -1, b = ys.length ? Math.max(...ys) : 1;
    center = (a + b) / 2; span = Math.max((b - a) / 2, 0.5);
  }
  span *= 1.15;
  const F = frame({ xmin: 0, xmax: nmax, ymin: center - span, ymax: center + span, xInt: true, xLabel: tl('nombre de tirages n'), yLabel: tl('Moyenne des tirages'), yFmt: y => fmtTxt(y, 2) });
  let out = F.open + F.g + `<g clip-path="url(#${F.clipId})">`;
  if (finiteM && finiteSd && sd > 0) {
    let up = '', dn = '';
    for (let j = 0; j <= 160; j++) { const n = Math.max(1, nmax * j / 160); const h = 1.96 * sd / Math.sqrt(n); up += `${j ? 'L' : 'M'}${F.sx(n).toFixed(1)},${F.sy(m + h).toFixed(1)}`; dn = `L${F.sx(n).toFixed(1)},${F.sy(m - h).toFixed(1)}` + dn; }
    out += `<path class="band" d="${up}${dn}Z"/>`;
  }
  if (finiteM) out += `<line class="mean-line" x1="${F.m.l}" x2="${F.W - F.m.r}" y1="${F.sy(m)}" y2="${F.sy(m)}"/>`;
  if (pts.length) out += `<path class="run" d="${pathOf(pts, F)}"/>`;
  out += '</g>';
  if (finiteM) out += `<text class="lbl" x="${F.W - F.m.r - 4}" y="${F.sy(m) - 6}" text-anchor="end" style="fill:var(--theory)">E(X) = ${fmtTxt(m, 3)}</text>`;
  else out += tlx`<text class="lbl" x="${F.W - F.m.r - 4}" y="${F.m.t + 12}" text-anchor="end" style="fill:var(--theory)">E(X) n'existe pas : la moyenne ne se stabilise pas</text>`;
  return out + '</svg>';
}

// ---------- Rendu ----------
function current() { const L = state.law, P = state.params[L.id]; return { L, P, T: isC(L) ? null : table(L, P) }; }

function renderNav() {
  const btn = L => `<button type="button" data-law="${L.id}" aria-current="${L === state.law}"><span class="n-name">${L.name}</span><span class="n-tag">${L.tag}</span></button>`;
  $('#nav-d').innerHTML = LAWS.filter(L => !isC(L)).map(btn).join('');
  $('#nav-c').innerHTML = LAWS.filter(isC).map(btn).join('');
}

function renderParams() {
  const L = state.law, P = state.params[L.id];
  $('#params').innerHTML = L.params.map(q => {
    const mx = typeof q.max === 'function' ? q.max(P) : q.max;
    return `<div class="param"><div class="param-head"><label for="pr-${q.key}">${q.label}</label><span class="sym">${q.sym}</span></div>
      <div class="param-row"><input type="range" id="pr-${q.key}" data-key="${q.key}" min="${q.min}" max="${mx}" step="${q.int ? 1 : (q.key === 'p' ? 0.001 : q.step)}" value="${P[q.key]}" aria-label="${q.label}">
      <input type="number" id="pn-${q.key}" data-key="${q.key}" min="${q.min}" max="${mx}" step="${q.step}" value="${+P[q.key].toFixed(4)}" aria-label="${q.label} (valeur)"></div></div>`;
  }).join('');
  syncParamInputs();
}
function syncParamInputs(skip) {
  const L = state.law, P = state.params[L.id];
  for (const q of L.params) {
    const mx = typeof q.max === 'function' ? q.max(P) : q.max;
    const r = $(`#pr-${q.key}`), n = $(`#pn-${q.key}`);
    r.max = mx; n.max = mx;
    if (r !== skip) r.value = P[q.key];
    if (n !== skip) n.value = +P[q.key].toFixed(4);
  }
  $('#notation').innerHTML = `<var>X</var> ∼ ${L.notation(P)}`;
}

function renderHero(L) {
  $('#hero').innerHTML = tlx`<div class="eyebrow">${isC(L) ? tl('Loi continue') : tl('Loi discrète')}</div><h1>${lawTitle(L).replace(/^./, c => c.toUpperCase())}</h1>
    <p class="lede">${L.lede}</p>
    <div class="hero-grid"><div><h3>Variable étudiée</h3><p>${L.variable}</p></div><div><h3>Quand l'utiliser</h3><p>${L.when}</p></div></div>`;
  renderUsage(L);
}

function generalSupport(L) {
  return L.genSupport || {
    bernoulli: '{0, 1}', binomial: '{0, 1, …, <var>n</var>}', geometric: 'ℕ* = {1, 2, 3, …}', poisson: 'ℕ = {0, 1, 2, …}',
    hypergeometric: '{max(0, <var>n</var> − (<var>N</var> − <var>K</var>)), …, min(<var>n</var>, <var>K</var>)}',
    uniform: '{<var>a</var>, <var>a</var> + 1, …, <var>b</var>}', pascal: '{<var>r</var>, <var>r</var> + 1, …}'
  }[L.id];
}
const caracRow = ([a, b, f, val]) => `<tr><th scope="row">${a}${b ? `<small>${b}</small>` : ''}</th><td class="f">${f}</td><td class="v">${val}</td></tr>`;

function renderCarac(L, P, T) {
  if (isC(L)) return renderCaracC(L, P);
  const S = stats(L, P, T);
  const modesTxt = S.modes.length === T.ks.length && S.modes.length > 2 ? tl('toutes les valeurs') : S.modes.map(k => k.toLocaleString(LOC)).join(' et ');
  const rows = [
    ['Notation', '', `<span class="math">${L.notation(P).replace(/\(.*$/, '')}(${L.params.map(q => `<var>${q.sym}</var>`).join(' ; ')})</span>`, `<span class="math">${L.notation(P)}</span>`],
    ['Support', tl('valeurs possibles de X'), generalSupport(L), L.supportTxt(P)],
    [tl('Loi de probabilité'), 'P(X = k)', L.F.pmf, `P(X = ${S.modes[0]}) = ${fmt(L.pmf(S.modes[0], P))}`],
    [tl('Fonction de répartition'), 'F(x) = P(X ≤ x)', L.F.cdf, `F(${S.median}) = ${fmt(T.cs[T.ks.indexOf(S.median)])}`],
    [tl('Espérance'), tl('valeur moyenne'), L.F.mean, fmt(S.mean)],
    ['Variance', 'dispersion', L.F.variance, fmt(S.variance)],
    [tl('Écart-type'), 'σ = √V(X)', 'σ = √V(X)', fmt(S.sd)],
    ['Mode', tl('valeur(s) la plus probable'), tl('valeur de k qui maximise P(X = k)'), modesTxt],
    [tl('Médiane'), tl('plus petit k tel que F(k) ≥ 1/2'), tl('partage la loi en deux moitiés'), S.median.toLocaleString(LOC)],
    [tl('Coefficient d\'asymétrie'), 'E[(X − μ)³] / σ³', tl('positif : queue étalée à droite ; nul : symétrique'), isFinite(S.skew) ? fmt(Math.abs(S.skew) < 1e-10 ? 0 : S.skew) : tl('non défini (σ = 0)')],
    [tl('Aplatissement (excès)'), 'E[(X − μ)⁴] / σ⁴ − 3', tl('comparé à la loi normale (0)'), isFinite(S.kurt) ? fmt(Math.abs(S.kurt) < 1e-10 ? 0 : S.kurt) : tl('non défini (σ = 0)')],
    [tl('Fonction génératrice'), 'G(s) = E(s<sup>X</sup>)', L.F.pgf, '']
  ];
  $('#carac').innerHTML = rows.map(caracRow).join('');
}
function renderCaracC(L, P) {
  const m = L.mean(P), V = L.variance(P);
  const med = L.median ? L.median(P) : quantile(L, P, 0.5);
  const q1 = quantile(L, P, 0.25), q3 = quantile(L, P, 0.75);
  const mo = L.mode(P);
  const at = isFinite(m) ? m : med;
  const rows = [
    ['Notation', '', `<span class="math">${L.genNotation}</span>`, `<span class="math">${L.notation(P)}</span>`],
    ['Support', tl('valeurs possibles de X'), L.genSupport, L.supportTxt(P)],
    [tl('Densité'), tl('f(x), avec P(a ≤ X ≤ b) = ∫ f'), L.F.pdf, `f(${fmt(at, 3)}) = ${fmt(L.pdf(at, P))}`],
    [tl('Fonction de répartition'), 'F(x) = P(X ≤ x)', L.F.cdf, `F(${fmt(at, 3)}) = ${fmt(L.cdf(at, P))}`],
    [tl('Espérance'), tl('valeur moyenne'), L.F.mean, fmtMoment(m)],
    ['Variance', 'dispersion', L.F.variance, fmtMoment(V)],
    [tl('Écart-type'), 'σ = √V(X)', 'σ = √V(X)', fmtMoment(Math.sqrt(V))],
    ['Mode', tl('maximum de la densité'), tl('valeur de x qui maximise f(x)'), typeof mo === 'number' ? fmt(mo) : mo],
    [tl('Médiane'), 'F(x) = 1/2', tl('partage la loi en deux moitiés'), fmt(med)],
    ['Quartiles', 'F(Q₁) = 1/4, F(Q₃) = 3/4', tl('50 % des valeurs sont entre Q₁ et Q₃'), `${fmt(q1)} ; ${fmt(q3)}`],
    [tl('Coefficient d\'asymétrie'), 'E[(X − μ)³] / σ³', tl('positif : queue étalée à droite ; nul : symétrique'), fmtMoment(L.skew(P))],
    [tl('Aplatissement (excès)'), 'E[(X − μ)⁴] / σ⁴ − 3', tl('comparé à la loi normale (0)'), fmtMoment(L.kurt(P))],
    [tl('Fonction génératrice des moments'), 'M(t) = E(e<sup>tX</sup>)', L.F.mgf, '']
  ];
  $('#carac').innerHTML = rows.map(caracRow).join('');
}

function renderOverlayTools(L) {
  if (!L.overlays.find(o => o.id === state.overlay)) state.overlay = 'none';
  $('#overlay-tools').innerHTML = L.overlays.length ? `<label for="overlay">Superposer</label><select id="overlay"><option value="none">rien</option>${L.overlays.map(o => `<option value="${o.id}" ${o.id === state.overlay ? 'selected' : ''}>${o.label}</option>`).join('')}</select>` : '';
}

function renderChartText(L) {
  const c = isC(L);
  $('#pmf-title').textContent = c ? tl('Densité de probabilité') : tl('Loi de probabilité');
  $('#pmf-cap').innerHTML = c
    ? tl('Courbe <span class="math">y = f(x)</span>. L\'aire sous la courbe entre <span class="math">a</span> et <span class="math">b</span> vaut <span class="math">P(a ≤ X ≤ b)</span> ; l\'aire surlignée correspond à l\'événement calculé plus bas.')
    : tl('Hauteur de chaque bâton : <span class="math">P(X = k)</span>. Les bâtons surlignés correspondent à l\'événement calculé plus bas.');
  $('#cdf-cap').innerHTML = c
    ? tl('<span class="math">F(x) = P(X ≤ x)</span> : une courbe continue et croissante de 0 à 1, dont la pente est la densité.')
    : tl('<span class="math">F(x) = P(X ≤ x)</span> : une fonction en escalier qui saute de <span class="math">P(X = k)</span> en chaque valeur <span class="math">k</span>.');
  $('#sim-title').textContent = c ? tl('Histogramme des tirages') : tl('Fréquences observées');
  $('#sim-cap').innerHTML = c
    ? tl('Barres : histogramme des tirages, à l\'échelle de la densité (aire totale 1). Courbe rouge : densité théorique.')
    : tl('Barres : fréquences des tirages. Traits rouges : probabilités théoriques.');
}

function renderCharts(L, P, T) {
  const q = state.calc;
  if (isC(L)) { $('#chart-pmf').innerHTML = densityChart(L, P, q); $('#chart-cdf').innerHTML = ccdfChart(L, P, q); }
  else { $('#chart-pmf').innerHTML = pmfChart(L, P, T, q); $('#chart-cdf').innerHTML = cdfChart(L, P, T); }
  const ov = L.overlays.find(o => o.id === state.overlay);
  $('#legend-pmf').innerHTML = tlx`<span style="--c:var(--accent)">${isC(L) ? tl('densité f(x)') : 'P(X = k)'}</span><span style="--c:var(--hl)">événement calculé</span>${ov ? `<span class="${ov.kind === 'points' ? 'dot' : ''}" style="--c:var(--ok)">${ov.label}</span>` : ''}`;
}

function eventTxt(q) {
  return { eq: `P(X = ${fmt(q.a)})`, le: `P(X ≤ ${fmt(q.a)})`, lt: `P(X &lt; ${fmt(q.a)})`, ge: `P(X ≥ ${fmt(q.a)})`, gt: `P(X &gt; ${fmt(q.a)})`, between: `P(${fmt(q.a)} ≤ X ≤ ${fmt(q.b)})`, q: tlx`x tel que P(X ≤ x) = ${fmt(q.a)}` }[q.type];
}
function simFreq(q) {
  const S = state.sim; if (!S || !S.n) return '';
  let c = 0;
  if (S.samples) { const x0 = q.type === 'q' ? null : q; if (!x0) return ''; for (const x of S.samples) if (inEvent(x, q)) c++; }
  else for (const [k, n] of S.counts) if (inEvent(k, q)) c += n;
  return tlx`<p class="note">Dans la simulation : ${c.toLocaleString(LOC)} ${pl(c, 'tirage', 'tirages')} sur ${S.n.toLocaleString(LOC)} réalisent l'événement, soit une fréquence de ${fmt(c / S.n)}.</p>`;
}

function calcDetailD(L, P, T, q, p) {
  const closed = L.closed ? L.closed(q.type, q.a, P) : null;
  if (q.type === 'eq') return L.detail(q.a, P);
  if (closed) return closed;
  const ks = T.ks.filter(k => inEvent(k, q));
  if (ks.length === 0) return tl('Aucune valeur du support ne réalise cet événement.');
  if (ks.length <= 4) return tlx`On additionne ${ks.map(k => `P(X = ${k})`).join(' + ')} = ${ks.map(k => fmt(L.pmf(k, P))).join(' + ')}.`;
  if (q.type === 'ge' || q.type === 'gt') return tlx`On passe par l'événement contraire : ${eventTxt(q)} = 1 − P(X ≤ ${q.type === 'ge' ? q.a - 1 : q.a}) = 1 − ${fmt(1 - p)}.`;
  return tlx`On additionne les ${ks.length} probabilités P(X = k) pour k allant de ${ks[0]} à ${ks[ks.length - 1]}.`;
}
function renderCalc(L, P, T) {
  if (isC(L)) return renderCalcC(L, P);
  const q = state.calc; const p = prob(T, q);
  const detail = calcDetailD(L, P, T, q, p);
  $('#calc-out').innerHTML = tlx`<p class="calc-big">${eventTxt(q)} = <b>${fmt(p, 5)}</b></p><p class="calc-detail"><span class="math">${detail}</span></p><p class="note">Soit environ ${fmt(p * 100, 2)} % de chances.</p>${simFreq(q)}`;
}
function calcDetailC(L, P, q) {
  if (q.type === 'between') return `${eventTxt(q)} = F(${fmt(q.b)}) − F(${fmt(q.a)}) = ${fmt(L.cdf(q.b, P), 5)} − ${fmt(L.cdf(q.a, P), 5)}`;
  if (q.type === 'le' || q.type === 'lt') return `${eventTxt(q)} = F(${fmt(q.a)}) = ${L.Fexpr(q.a, P)}`;
  return `${eventTxt(q)} = 1 − F(${fmt(q.a)}) = 1 − ${L.Fexpr(q.a, P)} = 1 − ${fmt(L.cdf(q.a, P), 5)}`;
}
function renderCalcC(L, P) {
  const q = state.calc;
  if (q.type === 'q') {
    if (!(q.a > 0 && q.a < 1)) { $('#calc-out').innerHTML = tl('<p class="note">L\'ordre α du quantile doit être strictement compris entre 0 et 1 (par exemple 0,95).</p>'); return; }
    const x = quantile(L, P, q.a);
    $('#calc-out').innerHTML = `<p class="calc-big">x<sub>${fmt(q.a)}</sub> = <b>${fmt(x, 5)}</b></p><p class="calc-detail"><span class="math">${tlx`C'est la valeur telle que P(X ≤ ${fmt(x, 4)}) = ${fmt(q.a)} : X a ${fmt(q.a * 100, 2)} % de chances d'être inférieure à ${fmt(x, 4)} et ${fmt((1 - q.a) * 100, 2)} % de chances d'être supérieure.`}</span></p><p class="note">${tl('On lit ce nombre dans les tables statistiques ; ici il est obtenu en inversant F numériquement.')}</p>`;
    return;
  }
  const p = probC(L, P, q); const detail = calcDetailC(L, P, q);
  $('#calc-out').innerHTML = tlx`<p class="calc-big">${eventTxt(q)} = <b>${fmt(p, 5)}</b></p><p class="calc-detail"><span class="math">${detail}</span></p><p class="note">Soit environ ${fmt(p * 100, 2)} % de chances. Pour une loi continue, P(X = x) = 0 : inégalités larges et strictes donnent le même résultat.</p>${simFreq(q)}`;
}

function answerOf(L, P, q) {
  if (isC(L)) { const r = probC(L, P, q); return q.type === 'q' ? `x<sub>${fmt(q.a)}</sub> = <b>${fmt(r, 4)}</b>` : `${eventTxt(q)} = <b>${fmt(r, 4)}</b> &nbsp;<span class="note">(≈ ${fmt(r * 100, 1)} %)</span>`; }
  const r = prob(table(L, P), q); return `${eventTxt(q)} = <b>${fmt(r, 4)}</b> &nbsp;<span class="note">(≈ ${fmt(r * 100, 1)} %)</span>`;
}
function renderExamples(L) {
  $('#examples').innerHTML = L.examples.map((e, i) => {
    const P = constrain(L, { ...state.params[L.id], ...e.params });
    return tlx`<article class="ex"><h3>${e.title}</h3><p>${e.text}</p><p class="q">${e.ask} :</p><p class="ans">${answerOf(L, P, e.q)}</p><p class="note">Paramètres : <span class="math">${L.notation(P)}</span></p><button class="btn ghost" type="button" data-ex="${i}">Charger l'exemple</button></article>`;
  }).join('');
}
function renderProps(L) { $('#props').innerHTML = L.props.map(p => `<li>${p}</li>`).join(''); }

function renderCalcOptions(L) {
  const opts = isC(L)
    ? [['le', 'P(X ≤ x)'], ['ge', 'P(X ≥ x)'], ['between', 'P(a ≤ X ≤ b)'], ['q', tl('Quantile : x tel que P(X ≤ x) = α')]]
    : [['eq', 'P(X = k)'], ['le', 'P(X ≤ k)'], ['lt', 'P(X < k)'], ['ge', 'P(X ≥ k)'], ['gt', 'P(X > k)'], ['between', 'P(a ≤ X ≤ b)']];
  $('#calc-type').innerHTML = opts.map(([v, t]) => `<option value="${v}">${t.replace('<', '&lt;').replace('>', '&gt;')}</option>`).join('');
  const st = isC(L) ? 'any' : '1';
  $('#calc-a').step = st; $('#calc-b').step = st;
}
function renderCalcInputs() {
  const q = state.calc, c = isC(state.law);
  $('#calc-type').value = q.type;
  $('#calc-a').value = q.a; $('#calc-b').value = q.b ?? q.a;
  const btw = q.type === 'between';
  $('#calc-a-lbl').textContent = btw ? 'a =' : q.type === 'q' ? 'α =' : c ? 'x =' : 'k =';
  $('#calc-b').hidden = !btw; $('#calc-b-lbl').hidden = !btw;
}

function refresh() {
  const { L, P, T } = current();
  syncParamInputs(document.activeElement);
  renderCarac(L, P, T); renderCharts(L, P, T); renderCalc(L, P, T); renderExamples(L);
}

function selectLaw(id) {
  stopAnim();
  state.law = getLaw(id);
  try { localStorage.setItem('atlas-law', id); } catch (e) {}
  const L = state.law;
  const e = L.examples[0]; state.calc = { ...e.q, b: e.q.b ?? (isC(L) ? e.q.a + 1 : e.q.a + 2) };
  renderNav(); renderParams(); renderHero(L); renderOverlayTools(L); renderProps(L); renderChartText(L); renderCalcOptions(L); renderCalcInputs();
  resetSim(); refresh();
}

// ---------- Simulation ----------
function resetSim() {
  stopAnim();
  state.sim = { n: 0, sum: 0, sum2: 0, counts: new Map(), samples: isC(state.law) ? [] : null, run: [], min: Infinity, max: -Infinity, last: '' };
  renderSim();
}
function draw(count) {
  const { L, P } = current(); const S = state.sim;
  for (let i = 0; i < count; i++) {
    const t = i === count - 1 ? {} : null;
    const x = L.sample(P, t);
    S.n++; S.sum += x; S.sum2 += x * x;
    if (S.samples) S.samples.push(x); else S.counts.set(x, (S.counts.get(x) || 0) + 1);
    if (x < S.min) S.min = x; if (x > S.max) S.max = x;
    if (S.n <= 300 || S.n % Math.ceil(S.n / 300) === 0) S.run.push([S.n, S.sum / S.n]);
    if (t) S.last = t.html;
  }
}
function renderSim() {
  const { L, P, T } = current(); const S = state.sim;
  $('#mech').innerHTML = tlx`<b>Comment on simule :</b> ${L.mech}`;
  $('#sim-last').innerHTML = S.n ? tlx`Dernier tirage : ${S.last}` : tl('Aucun tirage pour l\'instant.');
  const m = S.n ? S.sum / S.n : NaN;
  const vr = S.n > 1 ? Math.max(0, (S.sum2 - S.n * m * m) / (S.n - 1)) : NaN;
  let dist = NaN, distLabel, distHint;
  if (isC(L)) {
    distLabel = tl('Écart de Kolmogorov'); distHint = 'max |F̂ₙ(x) − F(x)|, tend vers <b>0</b>';
    if (S.n) { const xs = Float64Array.from(S.samples).sort(); dist = 0; xs.forEach((x, i) => { const F = L.cdf(x, P); dist = Math.max(dist, (i + 1) / S.n - F, F - i / S.n); }); }
  } else {
    distLabel = tl('Écart à la loi'); distHint = tl('½ Σ |fréquence − probabilité|, tend vers <b>0</b>');
    if (S.n) { dist = 0; const seen = new Set(); T.ks.forEach((k, i) => { dist += Math.abs((S.counts.get(k) || 0) / S.n - T.ps[i]); seen.add(k); }); for (const [k, c] of S.counts) if (!seen.has(k)) dist += c / S.n; dist /= 2; }
  }
  const th = x => Number.isNaN(x) ? tl('n\'existe pas') : fmtTxt(x, 3);
  $('#sim-stats').innerHTML = `
    <div class="stat"><div class="k">${tl('Tirages')}</div><div class="v">${S.n.toLocaleString(LOC)}</div><div class="t">${tl('taille de l\'échantillon')}</div></div>
    <div class="stat"><div class="k">${tl('Moyenne observée')}</div><div class="v">${S.n ? fmtTxt(m, 3) : '—'}</div><div class="t">${tl('théorie')} E(X) = <b>${th(L.mean(P))}</b></div></div>
    <div class="stat"><div class="k">${tl('Variance observée')}</div><div class="v">${S.n > 1 ? fmtTxt(vr, 3) : '—'}</div><div class="t">${tl('théorie')} V(X) = <b>${th(L.variance(P))}</b></div></div>
    <div class="stat"><div class="k">${distLabel}</div><div class="v">${S.n ? fmtTxt(dist, 3) : '—'}</div><div class="t">${distHint}</div></div>`;
  $('#chart-sim').innerHTML = isC(L) ? simChartC(L, P) : simChartD(L, P, T);
  $('#chart-run').innerHTML = runChart(L, P);
}
function stopAnim() { if (state.anim) { cancelAnimationFrame(state.anim.id); state.anim = null; } const b = $('#sim-anim'); if (b) b.textContent = tl('Animer 5 000 tirages'); }
function startAnim() {
  if (reduceMotion) { draw(5000); renderSim(); refresh(); return; }
  const target = state.sim.n + 5000;
  state.anim = { id: 0 };
  $('#sim-anim').textContent = tl('Arrêter');
  const step = () => {
    const S = state.sim; const left = target - S.n;
    if (left <= 0 || !state.anim) { stopAnim(); refresh(); return; }
    draw(Math.min(left, Math.max(1, Math.floor(S.n / 25)))); renderSim();
    state.anim.id = requestAnimationFrame(step);
  };
  state.anim.id = requestAnimationFrame(step);
}

// ---------- Événements ----------
document.querySelector('.side').addEventListener('click', e => { const b = e.target.closest('[data-law]'); if (b) selectLaw(b.dataset.law); });
$('#params').addEventListener('input', e => {
  const k = e.target.dataset.key; if (!k) return;
  const L = state.law, P = state.params[L.id];
  const x = parseFloat(String(e.target.value).replace(',', '.')); if (!isFinite(x)) return;
  P[k] = x; constrain(L, P);
  resetSim(); refresh();
});
$('#params').addEventListener('change', () => syncParamInputs());
$('#overlay-tools').addEventListener('change', e => { if (e.target.id === 'overlay') { state.overlay = e.target.value; const { L, P, T } = current(); renderCharts(L, P, T); } });
function readCalc() {
  const c = isC(state.law);
  const rd = s => { const x = parseFloat(String($(s).value).replace(',', '.')); return isFinite(x) ? (c ? x : Math.round(x)) : 0; };
  const prevType = state.calc.type, type = $('#calc-type').value;
  state.calc = { type, a: rd('#calc-a'), b: rd('#calc-b') };
  if (c && type === 'q' && prevType !== 'q') state.calc.a = 0.95;
  if (c && prevType === 'q' && type !== 'q') { const { L, P } = current(); state.calc.a = +quantile(L, P, 0.5).toPrecision(3); state.calc.b = +quantile(L, P, 0.9).toPrecision(3); }
  if (type === 'between' && state.calc.b < state.calc.a) [state.calc.a, state.calc.b] = [state.calc.b, state.calc.a];
  if (prevType !== type || document.activeElement === $('#calc-type')) renderCalcInputs();
  const { L, P, T } = current(); renderCharts(L, P, T); renderCalc(L, P, T);
}
['#calc-type', '#calc-a', '#calc-b'].forEach(s => $(s).addEventListener('change', readCalc));
['#calc-a', '#calc-b'].forEach(s => $(s).addEventListener('input', () => { if ($(s).value !== '') readCalc(); }));
document.querySelector('.sim-controls').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.draw) { stopAnim(); draw(+b.dataset.draw); renderSim(); const { L, P, T } = current(); renderCalc(L, P, T); }
  else if (b.id === 'sim-reset') { resetSim(); refresh(); }
  else if (b.id === 'sim-anim') { state.anim ? stopAnim() : startAnim(); }
});
$('#examples').addEventListener('click', e => {
  const b = e.target.closest('[data-ex]'); if (!b) return;
  const L = state.law, ex = L.examples[+b.dataset.ex];
  state.params[L.id] = constrain(L, { ...state.params[L.id], ...ex.params });
  state.calc = { ...ex.q, b: ex.q.b ?? (isC(L) ? ex.q.a + 1 : ex.q.a + 2) };
  renderParams(); renderCalcInputs(); resetSim(); refresh();
  document.querySelector('.calc').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
});
$('#parse-form').addEventListener('submit', e => {
  e.preventDefault();
  const msg = $('#parse-msg'); const r = parseLaw($('#law-input').value);
  if (r.err) { msg.className = 'err'; msg.textContent = r.err; return; }
  const L = getLaw(r.id);
  const P = constrain(L, { ...state.params[L.id], ...r.raw });
  const changed = Object.keys(r.raw).filter(k => Math.abs(r.raw[k] - P[k]) > 1e-9);
  state.params[L.id] = P;
  selectLaw(L.id); setTab('fiches');
  msg.className = 'ok';
  msg.innerHTML = tlx`Reconnu : ${lawTitle(L)}, <span class="math">X ∼ ${L.notation(P)}</span>${r.notes.length ? ` (${r.notes.join(' ; ')})` : ''}.` + (changed.length ? tlx` ${pl(changed.length, 'Paramètre ajusté', 'Paramètres ajustés')} aux limites autorisées : ${changed.map(k => `${L.params.find(q => q.key === k).sym} = ${fmt(P[k])}`).join(', ')}.` : '');
});

selectLaw(state.law.id);
