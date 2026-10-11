
// ---------- Traduction : le français sert de clé, les dictionnaires viennent de i18n/<langue>.js ----------
const LANG = (typeof window !== 'undefined' && window.LANG) || 'fr';
const TR = (typeof window !== 'undefined' && window.TR) || {};
const LOC = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', pt: 'pt-BR' }[LANG] || 'fr-FR';
const tl = s => (TR[s] !== undefined ? TR[s] : s);
const pl = (n, one, many) => (n > 1 ? tl(many) : tl(one));
function tlx(strings, ...vals) {
  const key = strings.reduce((a, s, i) => a + (i ? '{' + (i - 1) + '}' : '') + s, '');
  return (TR[key] !== undefined ? TR[key] : key).replace(/\{(\d+)\}/g, (m, i) => (vals[+i] === undefined ? '' : vals[+i]));
}
// ---------- Outils numériques ----------
const LF = [0];
function logFact(n) { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; }
function lchoose(n, k) { return (k < 0 || k > n) ? -Infinity : logFact(n) - logFact(k) - logFact(n - k); }
function choose(n, k) { if (k < 0 || k > n) return 0; const v = Math.exp(lchoose(n, k)); return v < 1e15 ? Math.round(v) : v; }

function fmt(x, d = 4) {
  if (x === Infinity) return '+∞';
  if (typeof x !== 'number' || !isFinite(x)) return '—';
  const a = Math.abs(x);
  if (x !== 0 && (a < 1e-4 || a >= 1e12)) {
    let e = Math.floor(Math.log10(a)); let m = x / 10 ** e;
    if (Math.abs(m) >= 9.995) { m /= 10; e += 1; }
    return `${m.toLocaleString(LOC, { maximumFractionDigits: 2 })} × 10<sup>${e}</sup>`;
  }
  return x.toLocaleString(LOC, { maximumFractionDigits: d });
}
function fmtTxt(x, d = 4) { return fmt(x, d).replace(/ × 10<sup>(-?\d+)<\/sup>/, 'e$1'); }
const bin = (n, k) => `<span class="bn"><i>(</i><span class="bn-s"><span>${n}</span><span>${k}</span></span><i>)</i></span>`;
const pw = (b, e) => `${b}<sup>${e}</sup>`;
const par = s => /^[\d,]+$/.test(s) ? s : `(${s})`;

// ---------- Les lois ----------
const LAWS = [
{
  id: 'bernoulli', name: 'Bernoulli', tag: tl('Une épreuve, deux issues'),
  params: [{ key: 'p', label: tl('Probabilité de succès'), sym: 'p', min: 0, max: 1, step: 0.01, value: 0.3 }],
  notation: P => `𝓑(${fmt(P.p)})`,
  variable: tl('<var>X</var> = 1 si l\'épreuve est un succès, 0 sinon.'),
  lede: tl('La loi la plus simple : une seule expérience aléatoire qui réussit avec la probabilité <var>p</var> et échoue sinon. Elle sert de brique de base à presque toutes les autres lois discrètes.'),
  when: tl('Pile ou face, une pièce défectueuse ou non, un client qui achète ou non : toute question à réponse oui/non.'),
  support: () => ({ min: 0, max: 1 }),
  supportTxt: () => '{0, 1}',
  pmf: (k, P) => k === 1 ? P.p : k === 0 ? 1 - P.p : 0,
  mean: P => P.p, variance: P => P.p * (1 - P.p),
  F: {
    pmf: tl('P(X = 1) = <var>p</var> &nbsp;et&nbsp; P(X = 0) = 1 − <var>p</var>'),
    cdf: tl('F(x) = 0 si x &lt; 0 ; 1 − <var>p</var> si 0 ≤ x &lt; 1 ; 1 si x ≥ 1'),
    mean: 'E(X) = <var>p</var>', variance: 'V(X) = <var>p</var>(1 − <var>p</var>)',
    pgf: 'G(s) = 1 − <var>p</var> + <var>p</var>s'
  },
  detail: (k, P) => k === 1 ? `P(X = 1) = p = ${fmt(P.p)}` : k === 0 ? `P(X = 0) = 1 − p = 1 − ${fmt(P.p)} = ${fmt(1 - P.p)}` : tlx`${k} n'est pas dans le support {0, 1}, donc la probabilité est nulle.`,
  mech: tl('On tire un nombre <var>U</var> uniforme entre 0 et 1. Si <var>U</var> &lt; <var>p</var>, c\'est un succès (<var>X</var> = 1), sinon un échec (<var>X</var> = 0).'),
  sample(P, t) { const u = Math.random(); const x = u < P.p ? 1 : 0; if (t) t.html = `U = ${fmt(u, 3)} ${x ? '&lt;' : '≥'} p → <b>${x ? tl('succès') : tl('échec')}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Pile ou face'), text: tl('On lance une pièce équilibrée et on note <var>X</var> = 1 si l\'on obtient pile.'), params: { p: 0.5 }, q: { type: 'eq', a: 1 }, ask: tl('Probabilité d\'obtenir pile') },
    { title: tl('Pièce défectueuse'), text: tl('Une machine produit 3 % de pièces défectueuses. On prélève une pièce et on note <var>X</var> = 1 si elle est défectueuse.'), params: { p: 0.03 }, q: { type: 'eq', a: 0 }, ask: tl('Probabilité que la pièce soit conforme') }
  ],
  props: [
    tl('La somme de <var>n</var> variables de Bernoulli 𝓑(<var>p</var>) indépendantes suit la loi binomiale 𝓑(<var>n</var> ; <var>p</var>).'),
    tl('Comme <var>X</var>² = <var>X</var>, on a E(<var>X</var>²) = <var>p</var>, d\'où V(<var>X</var>) = <var>p</var> − <var>p</var>² = <var>p</var>(1 − <var>p</var>).'),
    tl('La variance est maximale pour <var>p</var> = 0,5 (elle vaut alors 0,25) : c\'est la situation la plus incertaine.'),
    tl('Les lois géométrique et de Pascal comptent le nombre d\'épreuves de Bernoulli nécessaires pour obtenir un ou plusieurs succès.')
  ]
},
{
  id: 'binomial', name: 'Binomiale', tag: tl('Nombre de succès sur n essais'),
  params: [
    { key: 'n', label: tl('Nombre d\'épreuves'), sym: 'n', min: 1, max: 200, step: 1, value: 20, int: true },
    { key: 'p', label: tl('Probabilité de succès'), sym: 'p', min: 0, max: 1, step: 0.01, value: 0.3 }
  ],
  notation: P => `𝓑(${P.n} ; ${fmt(P.p)})`,
  variable: tl('<var>X</var> = nombre de succès obtenus en <var>n</var> épreuves de Bernoulli indépendantes et identiques.'),
  lede: tl('On répète <var>n</var> fois, de façon indépendante, une même épreuve à deux issues dont la probabilité de succès est <var>p</var>. La loi binomiale donne la probabilité d\'obtenir exactement <var>k</var> succès.'),
  when: tl('Nombre de bonnes réponses à un QCM rempli au hasard, nombre de pièces défectueuses dans un lot (tirage avec remise), nombre de clients qui achètent parmi <var>n</var> visiteurs.'),
  support: P => ({ min: 0, max: P.n }),
  supportTxt: P => `{0, 1, …, ${P.n}}`,
  pmf: (k, P) => (k < 0 || k > P.n) ? 0 : Math.exp(lchoose(P.n, k)) * P.p ** k * (1 - P.p) ** (P.n - k),
  mean: P => P.n * P.p, variance: P => P.n * P.p * (1 - P.p),
  F: {
    pmf: `P(X = k) = ${bin('<var>n</var>', '<var>k</var>')} <var>p</var><sup>k</sup> (1 − <var>p</var>)<sup>n − k</sup>`,
    cdf: tl('F(x) = Σ<sub>k ≤ x</sub> P(X = k) &nbsp;(pas de forme simple)'),
    mean: 'E(X) = <var>np</var>', variance: 'V(X) = <var>np</var>(1 − <var>p</var>)',
    pgf: 'G(s) = (1 − <var>p</var> + <var>p</var>s)<sup>n</sup>'
  },
  detail(k, P) {
    if (k < 0 || k > P.n) return tlx`${k} n'est pas dans le support, donc la probabilité est nulle.`;
    const q = 1 - P.p;
    return `P(X = ${k}) = ${bin(P.n, k)} × ${pw(par(fmt(P.p)), k)} × ${pw(par(fmt(q)), P.n - k)} = ${fmt(choose(P.n, k))} × ${fmt(P.p ** k, 6)} × ${fmt(q ** (P.n - k), 6)}`;
  },
  mech: tl('On lance <var>n</var> fois une pièce truquée qui tombe sur « succès » avec la probabilité <var>p</var>, puis on compte les succès. ● = succès, ○ = échec.'),
  sample(P, t) {
    let x = 0, s = '';
    for (let i = 0; i < P.n; i++) { const w = Math.random() < P.p; x += w; if (t && i < 60) s += w ? '●' : '○'; }
    if (t) t.html = tlx`<span class="tr">${s}${P.n > 60 ? '…' : ''}</span> → <b>X = ${x}</b> succès`;
    return x;
  },
  overlays: [
    { id: 'poisson', label: tl('Approximation de Poisson 𝓟(np)'), kind: 'points', fn: P => k => Math.exp(-P.n * P.p + k * Math.log(P.n * P.p) - logFact(k)) },
    { id: 'normal', label: 'Approximation normale 𝓝(np ; np(1−p))', kind: 'line', fn: P => normalDensity(P.n * P.p, Math.sqrt(P.n * P.p * (1 - P.p))) }
  ],
  examples: [
    { title: tl('QCM au hasard'), text: tl('Un QCM comporte 10 questions à 4 choix. Un élève répond entièrement au hasard. <var>X</var> = nombre de bonnes réponses suit 𝓑(10 ; 0,25).'), params: { n: 10, p: 0.25 }, q: { type: 'ge', a: 5 }, ask: tl('Probabilité d\'avoir au moins la moyenne (5 bonnes réponses ou plus)') },
    { title: tl('Contrôle qualité'), text: tl('Une usine produit 5 % de pièces défectueuses. On prélève 20 pièces (production assez grande pour assimiler le prélèvement à un tirage avec remise).'), params: { n: 20, p: 0.05 }, q: { type: 'le', a: 1 }, ask: tl('Probabilité d\'avoir au plus une pièce défectueuse') }
  ],
  props: [
    tl('Si <var>X</var> ∼ 𝓑(<var>n</var>₁ ; <var>p</var>) et <var>Y</var> ∼ 𝓑(<var>n</var>₂ ; <var>p</var>) sont indépendantes, alors <var>X</var> + <var>Y</var> ∼ 𝓑(<var>n</var>₁ + <var>n</var>₂ ; <var>p</var>).'),
    tl('Symétrie : si <var>X</var> ∼ 𝓑(<var>n</var> ; <var>p</var>), le nombre d\'échecs <var>n</var> − <var>X</var> suit 𝓑(<var>n</var> ; 1 − <var>p</var>).'),
    tl('Approximation de Poisson : quand <var>n</var> est grand et <var>p</var> petit (règle usuelle : <var>n</var> ≥ 30, <var>p</var> ≤ 0,1), 𝓑(<var>n</var> ; <var>p</var>) ≈ 𝓟(<var>np</var>). Activez la superposition dans les graphiques pour le voir.'),
    tl('Approximation normale : quand <var>np</var> ≥ 5 et <var>n</var>(1 − <var>p</var>) ≥ 5, la loi ressemble à une courbe en cloche 𝓝(<var>np</var> ; <var>np</var>(1 − <var>p</var>)).'),
    tl('Le mode est l\'entier ⌊(<var>n</var> + 1)<var>p</var>⌋ (deux modes quand (<var>n</var> + 1)<var>p</var> est entier).')
  ]
},
{
  id: 'geometric', name: tl('Géométrique'), tag: tl('Attente du premier succès'),
  params: [{ key: 'p', label: tl('Probabilité de succès'), sym: 'p', min: 0.02, max: 1, step: 0.01, value: 0.2 }],
  notation: P => `𝓖(${fmt(P.p)})`,
  variable: tl('<var>X</var> = rang de l\'épreuve qui donne le premier succès (nombre d\'essais nécessaires).'),
  lede: tl('On répète une épreuve de Bernoulli jusqu\'au premier succès. La loi géométrique décrit le nombre d\'essais nécessaires. C\'est la loi de l\'attente dans un monde discret.'),
  when: tl('Nombre de lancers de dé pour obtenir un 6, nombre d\'appels avant une vente, nombre de tentatives avant la première réussite.'),
  support: () => ({ min: 1, max: Infinity }),
  supportTxt: () => 'ℕ* = {1, 2, 3, …}',
  pmf: (k, P) => k < 1 ? 0 : (1 - P.p) ** (k - 1) * P.p,
  mean: P => 1 / P.p, variance: P => (1 - P.p) / P.p ** 2,
  F: {
    pmf: 'P(X = k) = (1 − <var>p</var>)<sup>k − 1</sup> <var>p</var>',
    cdf: tl('F(k) = 1 − (1 − <var>p</var>)<sup>k</sup> pour k entier ≥ 1'),
    mean: 'E(X) = 1 / <var>p</var>', variance: 'V(X) = (1 − <var>p</var>) / <var>p</var>²',
    pgf: 'G(s) = <var>p</var>s / (1 − (1 − <var>p</var>)s)'
  },
  detail: (k, P) => k < 1 ? tlx`${k} n'est pas dans le support, donc la probabilité est nulle.` : `P(X = ${k}) = ${pw(par(fmt(1 - P.p)), k - 1)} × ${fmt(P.p)}`,
  closed(type, a, P) {
    const q = 1 - P.p;
    if (type === 'le' && a >= 1) return `P(X ≤ ${a}) = 1 − ${pw(par(fmt(q)), a)}`;
    if (type === 'gt' && a >= 0) return tlx`P(X &gt; ${a}) = ${pw(par(fmt(q)), a)} &nbsp;(les ${a} premiers essais sont des échecs)`;
    if (type === 'ge' && a >= 1) return tlx`P(X ≥ ${a}) = ${pw(par(fmt(q)), a - 1)} &nbsp;(les ${a - 1} premiers essais sont des échecs)`;
    return null;
  },
  mech: tl('On répète l\'épreuve de Bernoulli jusqu\'au premier succès et on compte le nombre d\'essais. ○ = échec, ● = succès.'),
  sample(P, t) {
    let x = 0, s = '';
    while (true) { x++; const w = Math.random() < P.p; if (t && x <= 60) s += w ? '●' : '○'; if (w) break; }
    if (t) t.html = tlx`<span class="tr">${s}${x > 60 ? '…' : ''}</span> → <b>X = ${x}</b> (premier succès à l'essai n° ${x})`;
    return x;
  },
  overlays: [],
  examples: [
    { title: tl('Attendre un 6'), text: tl('On lance un dé équilibré jusqu\'à obtenir un 6. <var>X</var> = nombre de lancers suit 𝓖(1/6).'), params: { p: 1 / 6 }, q: { type: 'le', a: 6 }, ask: tl('Probabilité d\'obtenir le 6 en au plus 6 lancers') },
    { title: 'Prospection commerciale', text: tl('Un commercial conclut une vente à chaque appel avec la probabilité 0,2, indépendamment des autres appels.'), params: { p: 0.2 }, q: { type: 'gt', a: 5 }, ask: tl('Probabilité qu\'il faille plus de 5 appels pour la première vente') }
  ],
  props: [
    tl('Absence de mémoire : P(<var>X</var> &gt; <var>m</var> + <var>n</var> | <var>X</var> &gt; <var>m</var>) = P(<var>X</var> &gt; <var>n</var>). Avoir déjà échoué ne rapproche pas du succès. C\'est la seule loi discrète qui a cette propriété.'),
    tl('Variante : certains cours comptent le nombre d\'échecs avant le premier succès, <var>Y</var> = <var>X</var> − 1, à valeurs dans ℕ, avec E(<var>Y</var>) = (1 − <var>p</var>)/<var>p</var>.'),
    tl('C\'est la loi de Pascal avec <var>r</var> = 1, et l\'équivalent discret de la loi exponentielle.'),
    tl('Le mode vaut toujours 1 : le premier essai est le rang le plus probable pour le premier succès.')
  ]
},
{
  id: 'poisson', name: 'Poisson', tag: tl('Événements rares dans un intervalle'),
  params: [{ key: 'lambda', label: tl('Nombre moyen d\'événements'), sym: 'λ', min: 0.1, max: 50, step: 0.1, value: 4 }],
  notation: P => `𝓟(${fmt(P.lambda)})`,
  variable: tl('<var>X</var> = nombre d\'événements survenant dans un intervalle de temps ou d\'espace donné.'),
  lede: tl('La loi de Poisson compte des événements qui arrivent au hasard, indépendamment les uns des autres, à un rythme moyen λ constant. Sa particularité : son espérance et sa variance sont égales à λ.'),
  when: tl('Nombre d\'appels reçus par minute, de clients arrivant en une heure, de fautes de frappe par page, de pannes par mois.'),
  support: () => ({ min: 0, max: Infinity }),
  supportTxt: () => 'ℕ = {0, 1, 2, …}',
  pmf: (k, P) => k < 0 ? 0 : Math.exp(-P.lambda + k * Math.log(P.lambda) - logFact(k)),
  mean: P => P.lambda, variance: P => P.lambda,
  F: {
    pmf: 'P(X = k) = e<sup>−λ</sup> λ<sup>k</sup> / k!',
    cdf: 'F(x) = e<sup>−λ</sup> Σ<sub>k ≤ x</sub> λ<sup>k</sup> / k!',
    mean: 'E(X) = λ', variance: 'V(X) = λ',
    pgf: 'G(s) = e<sup>λ(s − 1)</sup>'
  },
  detail: (k, P) => k < 0 ? tlx`${k} n'est pas dans le support, donc la probabilité est nulle.` : `P(X = ${k}) = e<sup>−${fmt(P.lambda)}</sup> × ${pw(fmt(P.lambda), k)} / ${k}! = ${fmt(Math.exp(-P.lambda), 6)} × ${fmt(P.lambda ** k)} / ${fmt(Math.exp(logFact(k)))}`,
  mech: tl('On simule les instants d\'arrivée d\'événements aléatoires sur un intervalle de durée 1 (les écarts entre deux arrivées suivent une loi exponentielle de paramètre λ) et on compte combien tombent dans l\'intervalle.'),
  sample(P, t) {
    let s = 0, x = 0; const times = [];
    while (true) { s += -Math.log(1 - Math.random()) / P.lambda; if (s > 1) break; x++; if (t && times.length < 12) times.push(fmt(s, 2)); }
    if (t) t.html = tlx`Arrivées aux instants <span class="tr">${times.length ? times.join(' ; ') : tl('aucune')}${x > 12 ? ' ; …' : ''}</span> → <b>X = ${x}</b> ${pl(x, 'événement', 'événements')}`;
    return x;
  },
  overlays: [
    { id: 'normal', label: 'Approximation normale 𝓝(λ ; λ)', kind: 'line', fn: P => normalDensity(P.lambda, Math.sqrt(P.lambda)) }
  ],
  examples: [
    { title: tl('Standard téléphonique'), text: tl('Un standard reçoit en moyenne 4 appels par minute. Le nombre d\'appels <var>X</var> en une minute suit 𝓟(4).'), params: { lambda: 4 }, q: { type: 'ge', a: 8 }, ask: tl('Probabilité de recevoir au moins 8 appels en une minute (saturation)') },
    { title: tl('Coquilles dans un livre'), text: tl('Un livre contient en moyenne 1,5 faute de frappe par page.'), params: { lambda: 1.5 }, q: { type: 'eq', a: 0 }, ask: tl('Probabilité qu\'une page ne contienne aucune faute') }
  ],
  props: [
    tl('Si <var>X</var> ∼ 𝓟(λ) et <var>Y</var> ∼ 𝓟(μ) sont indépendantes, alors <var>X</var> + <var>Y</var> ∼ 𝓟(λ + μ).'),
    tl('Limite de la binomiale : 𝓑(<var>n</var> ; λ/<var>n</var>) tend vers 𝓟(λ) quand <var>n</var> → ∞. C\'est pourquoi on l\'appelle la loi des événements rares.'),
    tl('Pour λ grand (λ ≥ 20 environ), 𝓟(λ) est proche de la loi normale 𝓝(λ ; λ).'),
    tl('Lien avec le temps : si les événements arrivent selon une loi de Poisson, la durée entre deux événements suit une loi exponentielle (loi continue, à venir).'),
    tl('Le mode est ⌊λ⌋ ; si λ est entier, λ − 1 et λ sont tous deux des modes.')
  ]
},
{
  id: 'hypergeometric', name: tl('Hypergéométrique'), tag: tl('Tirages sans remise'),
  params: [
    { key: 'N', label: tl('Taille de la population'), sym: 'N', min: 2, max: 200, step: 1, value: 50, int: true },
    { key: 'K', label: tl('Nombre d\'individus « succès »'), sym: 'K', min: 0, max: P => P.N, step: 1, value: 10, int: true },
    { key: 'n', label: tl('Taille de l\'échantillon'), sym: 'n', min: 1, max: P => P.N, step: 1, value: 8, int: true }
  ],
  notation: P => `𝓗(${P.N} ; ${P.K} ; ${P.n})`,
  variable: tl('<var>X</var> = nombre d\'individus « succès » dans un échantillon de <var>n</var> individus tirés sans remise.'),
  lede: tl('Une urne contient <var>N</var> boules dont <var>K</var> rouges. On en tire <var>n</var> d\'un coup, sans remise. La loi hypergéométrique donne la probabilité d\'obtenir <var>k</var> boules rouges. Les tirages ne sont pas indépendants : chaque tirage modifie la composition de l\'urne.'),
  when: tl('Contrôle de qualité sur un petit lot, jeux de loto, cartes tirées d\'un jeu, sondage dans une petite population.'),
  constrain(P) { P.K = Math.min(P.K, P.N); P.n = Math.min(Math.max(P.n, 1), P.N); return P; },
  support: P => ({ min: Math.max(0, P.n - (P.N - P.K)), max: Math.min(P.n, P.K) }),
  supportTxt: P => `{${Math.max(0, P.n - (P.N - P.K))}, …, ${Math.min(P.n, P.K)}}`,
  pmf: (k, P) => Math.exp(lchoose(P.K, k) + lchoose(P.N - P.K, P.n - k) - lchoose(P.N, P.n)),
  mean: P => P.n * P.K / P.N,
  variance: P => P.N > 1 ? P.n * (P.K / P.N) * (1 - P.K / P.N) * (P.N - P.n) / (P.N - 1) : 0,
  F: {
    pmf: `P(X = k) = ${bin('<var>K</var>', '<var>k</var>')} ${bin('<var>N</var> − <var>K</var>', '<var>n</var> − <var>k</var>')} / ${bin('<var>N</var>', '<var>n</var>')}`,
    cdf: tl('F(x) = Σ<sub>k ≤ x</sub> P(X = k) &nbsp;(pas de forme simple)'),
    mean: 'E(X) = <var>n</var> · <var>K</var>/<var>N</var>',
    variance: 'V(X) = <var>n</var> · <var>K</var>/<var>N</var> · (1 − <var>K</var>/<var>N</var>) · (<var>N</var> − <var>n</var>)/(<var>N</var> − 1)',
    pgf: tl('Pas de forme simple (s\'exprime avec la fonction hypergéométrique ₂F₁, d\'où le nom de la loi)')
  },
  detail(k, P) {
    const s = this.support(P);
    if (k < s.min || k > s.max) return tlx`${k} n'est pas dans le support, donc la probabilité est nulle.`;
    return `P(X = ${k}) = ${bin(P.K, k)} × ${bin(P.N - P.K, P.n - k)} / ${bin(P.N, P.n)} = ${fmt(choose(P.K, k))} × ${fmt(choose(P.N - P.K, P.n - k))} / ${fmt(choose(P.N, P.n))}`;
  },
  mech: tl('On tire <var>n</var> boules une à une, sans remise, dans une urne de <var>N</var> boules dont <var>K</var> rouges, puis on compte les rouges. ● = rouge, ○ = autre.'),
  sample(P, t) {
    let red = P.K, tot = P.N, x = 0, s = '';
    for (let i = 0; i < P.n; i++) { const w = Math.random() < red / tot; if (w) { x++; red--; } tot--; if (t && i < 60) s += w ? '●' : '○'; }
    if (t) t.html = `<span class="tr">${s}${P.n > 60 ? '…' : ''}</span> → <b>X = ${x}</b> ${pl(x, 'boule rouge', 'boules rouges')}`;
    return x;
  },
  overlays: [
    { id: 'binom', label: 'Approximation binomiale 𝓑(n ; K/N)', kind: 'points', fn: P => k => (k < 0 || k > P.n) ? 0 : Math.exp(lchoose(P.n, k)) * (P.K / P.N) ** k * (1 - P.K / P.N) ** (P.n - k) }
  ],
  examples: [
    { title: 'Loto', text: tl('On coche 6 numéros parmi 49 ; le tirage désigne 6 numéros gagnants. <var>X</var> = nombre de bons numéros suit 𝓗(49 ; 6 ; 6).'), params: { N: 49, K: 6, n: 6 }, q: { type: 'ge', a: 3 }, ask: tl('Probabilité d\'avoir au moins 3 bons numéros') },
    { title: tl('Lot de pièces'), text: tl('Un lot de 50 pièces contient 4 pièces défectueuses. Un contrôleur en prélève 10 sans remise.'), params: { N: 50, K: 4, n: 10 }, q: { type: 'ge', a: 1 }, ask: tl('Probabilité de détecter au moins une pièce défectueuse') }
  ],
  props: [
    tl('Notation alternative fréquente : 𝓗(<var>N</var> ; <var>n</var> ; <var>p</var>) avec <var>p</var> = <var>K</var>/<var>N</var>. Ici on utilise directement le nombre <var>K</var> de succès.'),
    tl('L\'espérance est la même qu\'avec remise (<var>n</var> · <var>K</var>/<var>N</var>), mais la variance est multipliée par le facteur d\'exhaustivité (<var>N</var> − <var>n</var>)/(<var>N</var> − 1) &lt; 1 : tirer sans remise réduit la dispersion.'),
    tl('Approximation binomiale : quand l\'échantillon est petit devant la population (règle usuelle : <var>n</var>/<var>N</var> ≤ 0,1), 𝓗(<var>N</var> ; <var>K</var> ; <var>n</var>) ≈ 𝓑(<var>n</var> ; <var>K</var>/<var>N</var>). Activez la superposition pour comparer.'),
    tl('Le support est limité : on ne peut pas tirer plus de rouges qu\'il n\'y en a (<var>k</var> ≤ <var>K</var>) ni plus d\'autres boules qu\'il n\'y en a (<var>n</var> − <var>k</var> ≤ <var>N</var> − <var>K</var>).')
  ]
},
{
  id: 'uniform', name: tl('Uniforme discrète'), tag: tl('Toutes les valeurs équiprobables'),
  params: [
    { key: 'a', label: tl('Plus petite valeur'), sym: 'a', min: -20, max: 100, step: 1, value: 1, int: true },
    { key: 'b', label: tl('Plus grande valeur'), sym: 'b', min: -20, max: 120, step: 1, value: 6, int: true }
  ],
  notation: P => `𝓤({${P.a}, …, ${P.b}})`,
  variable: tl('<var>X</var> = valeur tirée au hasard parmi les entiers de <var>a</var> à <var>b</var>, chacun ayant la même chance.'),
  lede: tl('Chacune des <var>n</var> = <var>b</var> − <var>a</var> + 1 valeurs entières entre <var>a</var> et <var>b</var> a la même probabilité 1/<var>n</var>. C\'est la loi de l\'équiprobabilité, celle des « cas favorables sur cas possibles ».'),
  when: tl('Lancer d\'un dé équilibré, tirage d\'un numéro de loterie, choix aléatoire d\'un jour du mois, générateurs de nombres aléatoires.'),
  constrain(P) { if (P.b < P.a) P.b = P.a; return P; },
  support: P => ({ min: P.a, max: P.b }),
  supportTxt: P => `{${P.a}, ${P.a + 1}, …, ${P.b}}`,
  pmf: (k, P) => (k < P.a || k > P.b) ? 0 : 1 / (P.b - P.a + 1),
  mean: P => (P.a + P.b) / 2, variance: P => ((P.b - P.a + 1) ** 2 - 1) / 12,
  F: {
    pmf: tl('P(X = k) = 1 / <var>n</var> &nbsp;avec <var>n</var> = <var>b</var> − <var>a</var> + 1'),
    cdf: tl('F(k) = (k − <var>a</var> + 1) / <var>n</var> pour k entier entre <var>a</var> et <var>b</var>'),
    mean: 'E(X) = (<var>a</var> + <var>b</var>) / 2', variance: 'V(X) = (<var>n</var>² − 1) / 12',
    pgf: 'G(s) = (s<sup>a</sup> − s<sup>b + 1</sup>) / (<var>n</var>(1 − s))'
  },
  detail: (k, P) => (k < P.a || k > P.b) ? tlx`${k} n'est pas dans le support, donc la probabilité est nulle.` : `P(X = ${k}) = 1 / ${P.b - P.a + 1}`,
  closed(type, a, P) {
    const n = P.b - P.a + 1;
    if (type === 'le' && a >= P.a && a <= P.b) return `P(X ≤ ${a}) = (${a} − ${par(String(P.a))} + 1) / ${n} = ${a - P.a + 1} / ${n}`;
    return null;
  },
  mech: tl('On tire un entier au hasard entre <var>a</var> et <var>b</var>, comme on lancerait un dé à <var>n</var> faces numérotées de <var>a</var> à <var>b</var>.'),
  sample(P, t) { const x = P.a + Math.floor(Math.random() * (P.b - P.a + 1)); if (t) t.html = tlx`Dé à ${P.b - P.a + 1} ${pl(P.b - P.a + 1, 'face', 'faces')} → <b>X = ${x}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Dé équilibré'), text: tl('On lance un dé à six faces équilibré. <var>X</var> suit la loi uniforme sur {1, …, 6}.'), params: { a: 1, b: 6 }, q: { type: 'ge', a: 5 }, ask: tl('Probabilité d\'obtenir 5 ou 6') },
    { title: 'Tombola', text: tl('On tire au hasard un billet numéroté de 1 à 100.'), params: { a: 1, b: 100 }, q: { type: 'between', a: 10, b: 19 }, ask: tl('Probabilité que le numéro commence par 1 et ait deux chiffres (10 à 19)') }
  ],
  props: [
    tl('C\'est le cadre de la formule de Laplace : P(A) = nombre de cas favorables / nombre de cas possibles.'),
    tl('La loi est symétrique autour de (<var>a</var> + <var>b</var>)/2 : coefficient d\'asymétrie nul, espérance égale à la médiane.'),
    tl('Toutes les valeurs sont des modes : aucune n\'est plus probable qu\'une autre.'),
    tl('Si <var>U</var> suit la loi uniforme continue sur [0 ; 1[, alors <var>a</var> + ⌊<var>nU</var>⌋ suit la loi uniforme discrète sur {<var>a</var>, …, <var>b</var>} : c\'est ainsi que les ordinateurs la simulent.')
  ]
},
{
  id: 'pascal', name: tl('Pascal (binomiale négative)'), tag: tl('Attente du r-ième succès'),
  params: [
    { key: 'r', label: tl('Nombre de succès visés'), sym: 'r', min: 1, max: 20, step: 1, value: 3, int: true },
    { key: 'p', label: tl('Probabilité de succès'), sym: 'p', min: 0.05, max: 1, step: 0.01, value: 0.3 }
  ],
  notation: P => `Pascal(${P.r} ; ${fmt(P.p)})`,
  variable: tl('<var>X</var> = nombre d\'épreuves nécessaires pour obtenir <var>r</var> succès.'),
  lede: tl('On répète une épreuve de Bernoulli jusqu\'à obtenir <var>r</var> succès. La loi de Pascal décrit le nombre total d\'essais. Elle généralise la loi géométrique, qui correspond à <var>r</var> = 1.'),
  when: tl('Nombre d\'entretiens pour recruter <var>r</var> personnes, nombre de lancers francs pour en réussir <var>r</var>, nombre de forages pour trouver <var>r</var> puits productifs.'),
  support: P => ({ min: P.r, max: Infinity }),
  supportTxt: P => `{${P.r}, ${P.r + 1}, ${P.r + 2}, …}`,
  pmf: (k, P) => k < P.r ? 0 : Math.exp(lchoose(k - 1, P.r - 1)) * P.p ** P.r * (1 - P.p) ** (k - P.r),
  mean: P => P.r / P.p, variance: P => P.r * (1 - P.p) / P.p ** 2,
  F: {
    pmf: `P(X = k) = ${bin('k − 1', '<var>r</var> − 1')} <var>p</var><sup>r</sup> (1 − <var>p</var>)<sup>k − r</sup>`,
    cdf: tl('F(k) = P(au moins <var>r</var> succès en k essais) = P(𝓑(k ; <var>p</var>) ≥ <var>r</var>)'),
    mean: 'E(X) = <var>r</var> / <var>p</var>', variance: 'V(X) = <var>r</var>(1 − <var>p</var>) / <var>p</var>²',
    pgf: 'G(s) = (<var>p</var>s / (1 − (1 − <var>p</var>)s))<sup>r</sup>'
  },
  detail(k, P) {
    if (k < P.r) return tlx`${k} &lt; r = ${P.r} : impossible d'avoir ${P.r} succès en moins de ${P.r} essais, la probabilité est nulle.`;
    return `P(X = ${k}) = ${bin(k - 1, P.r - 1)} × ${pw(par(fmt(P.p)), P.r)} × ${pw(par(fmt(1 - P.p)), k - P.r)} = ${fmt(choose(k - 1, P.r - 1))} × ${fmt(P.p ** P.r, 6)} × ${fmt((1 - P.p) ** (k - P.r), 6)}`;
  },
  mech: tl('On répète l\'épreuve de Bernoulli jusqu\'à obtenir <var>r</var> succès et on compte le nombre total d\'essais. ○ = échec, ● = succès.'),
  sample(P, t) {
    let x = 0, w = 0, s = '';
    while (w < P.r) { x++; const ok = Math.random() < P.p; w += ok; if (t && x <= 60) s += ok ? '●' : '○'; }
    if (t) t.html = tlx`<span class="tr">${s}${x > 60 ? '…' : ''}</span> → <b>X = ${x}</b> essais pour ${P.r} succès`;
    return x;
  },
  overlays: [
    { id: 'normal', label: 'Approximation normale 𝓝(r/p ; r(1−p)/p²)', kind: 'line', fn: P => normalDensity(P.r / P.p, Math.sqrt(P.r * (1 - P.p)) / P.p) }
  ],
  examples: [
    { title: 'Lancers francs', text: tl('Une joueuse réussit chaque lancer franc avec la probabilité 0,7. Elle tire jusqu\'à en réussir 5.'), params: { r: 5, p: 0.7 }, q: { type: 'le', a: 7 }, ask: tl('Probabilité qu\'elle y parvienne en au plus 7 lancers') },
    { title: 'Recrutement', text: tl('30 % des candidats reçus en entretien acceptent le poste. L\'entreprise doit recruter 3 personnes.'), params: { r: 3, p: 0.3 }, q: { type: 'gt', a: 10 }, ask: tl('Probabilité qu\'il faille plus de 10 entretiens') }
  ],
  props: [
    tl('<var>X</var> est la somme de <var>r</var> variables géométriques 𝓖(<var>p</var>) indépendantes (attente du 1<sup>er</sup> succès, puis du 2<sup>e</sup>, etc.), ce qui donne directement E(<var>X</var>) = <var>r</var>/<var>p</var>.'),
    tl('Lien avec la binomiale : P(<var>X</var> ≤ <var>k</var>) = P(<var>Y</var> ≥ <var>r</var>) avec <var>Y</var> ∼ 𝓑(<var>k</var> ; <var>p</var>). Avoir eu <var>r</var> succès en au plus <var>k</var> essais, c\'est avoir au moins <var>r</var> succès lors des <var>k</var> premiers essais.'),
    tl('Variante « binomiale négative » : le nombre d\'échecs avant le <var>r</var>-ième succès, <var>Y</var> = <var>X</var> − <var>r</var>, à valeurs dans ℕ, d\'espérance <var>r</var>(1 − <var>p</var>)/<var>p</var>.'),
    tl('Pour <var>r</var> = 1, on retrouve la loi géométrique.')
  ]
}
];

function normalDensity(m, s) { return x => s > 0 ? Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI)) : 0; }

function lawTitle(L) { return L.title; }
function getLaw(id) { return LAWS.find(L => L.id === id); }
function constrain(L, P) {
  for (const q of L.params) {
    const mx = typeof q.max === 'function' ? q.max(P) : q.max;
    let v = Number(P[q.key]); if (!isFinite(v)) v = q.value;
    if (q.int) v = Math.round(v);
    P[q.key] = Math.min(Math.max(v, q.min), mx);
  }
  if (L.constrain) L.constrain(P);
  return P;
}

// Tableau complet de la loi (support infini tronqué quand la masse restante < 1e-12)
function table(L, P) {
  const s = L.support(P); const ks = [], ps = [], cs = []; let c = 0;
  for (let k = s.min; k <= s.max; k++) {
    const v = L.pmf(k, P); c += v; ks.push(k); ps.push(v); cs.push(Math.min(c, 1));
    if (!isFinite(s.max) && (c >= 1 - 1e-12 || ks.length > 20000)) break;
  }
  return { ks, ps, cs, infinite: !isFinite(s.max) };
}

function stats(L, P, T) {
  const m = L.mean(P), v = L.variance(P), sd = Math.sqrt(v);
  let m3 = 0, m4 = 0;
  T.ks.forEach((k, i) => { const d = k - m; m3 += d ** 3 * T.ps[i]; m4 += d ** 4 * T.ps[i]; });
  const skew = sd > 1e-12 ? m3 / sd ** 3 : NaN, kurt = sd > 1e-12 ? m4 / v ** 2 - 3 : NaN;
  const pmax = Math.max(...T.ps);
  const modes = T.ks.filter((k, i) => T.ps[i] >= pmax * (1 - 1e-9));
  let med = T.ks[T.ks.length - 1];
  for (let i = 0; i < T.ks.length; i++) if (T.cs[i] >= 0.5 - 1e-12) { med = T.ks[i]; break; }
  return { mean: m, variance: v, sd, skew, kurt, modes, median: med };
}

function inEvent(k, q) {
  switch (q.type) {
    case 'eq': return k === q.a;
    case 'le': return k <= q.a;
    case 'lt': return k < q.a;
    case 'ge': return k >= q.a;
    case 'gt': return k > q.a;
    case 'between': return k >= q.a && k <= q.b;
  }
  return false;
}
function prob(T, q) {
  if (q.type === 'ge' || q.type === 'gt') { // complément, pour inclure la queue infinie
    let s = 0; T.ks.forEach((k, i) => { if (!inEvent(k, q)) s += T.ps[i]; }); return Math.max(0, 1 - s);
  }
  let s = 0; T.ks.forEach((k, i) => { if (inEvent(k, q)) s += T.ps[i]; }); return Math.min(1, s);
}

// ---------- Fonctions spéciales ----------
function lgamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
  x -= 1; let a = c[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function erfc(x) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}
function Phi(z) { return z < 0 ? 0.5 * erfc(-z / Math.SQRT2) : 1 - 0.5 * erfc(z / Math.SQRT2); }
function gammaP(a, x) {
  if (x <= 0) return 0;
  const lead = -x + a * Math.log(x) - lgamma(a);
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-15) break; }
    return Math.min(1, sum * Math.exp(lead));
  }
  const FP = 1e-300; let b = x + 1 - a, c = 1 / FP, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < FP) d = FP; c = b + an / c; if (Math.abs(c) < FP) c = FP;
    d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
  }
  return Math.max(0, 1 - Math.exp(lead) * h);
}
function betacf(a, b, x) {
  const FP = 1e-300, qab = a + b, qap = a + 1, qam = a - 1; let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FP) d = FP; d = 1 / d; let h = d;
  for (let m = 1; m <= 1000; m++) {
    const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FP) d = FP; c = 1 + aa / c; if (Math.abs(c) < FP) c = FP; d = 1 / d;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}
function betaI(a, b, x) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
const lbeta = (a, b) => lgamma(a) + lgamma(b) - lgamma(a + b);
function rnorm() { let u = 0; while (u === 0) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); }
function rgamma(k) {
  if (k < 1) return rgamma(k + 1) * Math.pow(Math.random(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  while (true) {
    let x, v; do { x = rnorm(); v = 1 + c * x; } while (v <= 0);
    v = v * v * v; const u = Math.random();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}
function rchi2(k) { let s = 0; for (let i = 0; i < k; i++) { const z = rnorm(); s += z * z; } return s; }

function quantile(L, P, a) {
  const s = L.support(P);
  let lo = isFinite(s.min) ? s.min : -1, hi = isFinite(s.max) ? s.max : 1;
  if (!isFinite(s.min)) while (L.cdf(lo, P) > a && lo > -1e12) lo *= 2;
  if (!isFinite(s.max)) { hi = Math.max(hi, lo + 1); while (L.cdf(hi, P) < a && hi < 1e12) hi *= 2; }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (L.cdf(mid, P) < a) lo = mid; else hi = mid;
    if (hi - lo < 1e-12 * Math.max(1, Math.abs(mid))) break;
  }
  return (lo + hi) / 2;
}
function probC(L, P, q) {
  if (q.type === 'q') return quantile(L, P, q.a);
  if (q.type === 'le' || q.type === 'lt') return L.cdf(q.a, P);
  if (q.type === 'ge' || q.type === 'gt') return 1 - L.cdf(q.a, P);
  if (q.type === 'between') return Math.max(0, L.cdf(q.b, P) - L.cdf(q.a, P));
  return 0;
}
const NOMGF = tl('n\'existe pas (E(e<sup>tX</sup>) est infinie pour tout t &gt; 0)');
const vr = s => `<var>${s}</var>`;

const CLAWS = [
{
  id: 'cuniform', kind: 'continuous', name: 'Uniforme continue', title: tl('loi uniforme continue'), tag: tl('Densité constante sur [a ; b]'),
  params: [
    { key: 'a', label: tl('Borne inférieure'), sym: 'a', min: -10, max: 10, step: 0.1, value: 0 },
    { key: 'b', label: tl('Borne supérieure'), sym: 'b', min: -10, max: 20, step: 0.1, value: 1 }
  ],
  constrain(P) { if (P.b <= P.a) P.b = +(P.a + 0.1).toFixed(10); return P; },
  notation: P => `𝓤([${fmt(P.a)} ; ${fmt(P.b)}])`, genNotation: `𝓤([${vr('a')} ; ${vr('b')}])`,
  variable: tlx`${vr('X')} = point choisi « au hasard » dans l'intervalle [${vr('a')} ; ${vr('b')}] : deux sous-intervalles de même longueur ont la même probabilité.`,
  lede: tlx`La loi uniforme continue répartit la probabilité de façon égale sur un intervalle. La probabilité d'un sous-intervalle est simplement sa longueur divisée par ${vr('b')} − ${vr('a')}. C'est le point de départ de toutes les simulations sur ordinateur.`,
  when: tl('Instant d\'arrivée au hasard dans un créneau, erreur d\'arrondi, position d\'un point tiré au hasard sur un segment, nombre aléatoire entre 0 et 1.'),
  support: P => ({ min: P.a, max: P.b }), supportTxt: P => `[${fmt(P.a)} ; ${fmt(P.b)}]`, genSupport: `[${vr('a')} ; ${vr('b')}]`,
  pdf: (x, P) => (x < P.a || x > P.b) ? 0 : 1 / (P.b - P.a),
  cdf: (x, P) => x <= P.a ? 0 : x >= P.b ? 1 : (x - P.a) / (P.b - P.a),
  mean: P => (P.a + P.b) / 2, variance: P => (P.b - P.a) ** 2 / 12, skew: () => 0, kurt: () => -1.2,
  mode: () => tl('toute valeur de [a ; b]'), median: P => (P.a + P.b) / 2,
  F: {
    pdf: tlx`f(x) = 1 / (${vr('b')} − ${vr('a')}) si x ∈ [${vr('a')} ; ${vr('b')}], 0 sinon`,
    cdf: tlx`F(x) = (x − ${vr('a')}) / (${vr('b')} − ${vr('a')}) pour x ∈ [${vr('a')} ; ${vr('b')}]`,
    mean: `E(X) = (${vr('a')} + ${vr('b')}) / 2`, variance: `V(X) = (${vr('b')} − ${vr('a')})² / 12`,
    mgf: tlx`M(t) = (e<sup>tb</sup> − e<sup>ta</sup>) / (t(${vr('b')} − ${vr('a')})) pour t ≠ 0`
  },
  Fexpr: (x, P) => x <= P.a ? '0' : x >= P.b ? '1' : `(${fmt(x)} − ${par(fmt(P.a))}) / (${fmt(P.b)} − ${par(fmt(P.a))})`,
  view: P => { const w = P.b - P.a; return [P.a - 0.15 * w, P.b + 0.15 * w]; },
  mech: tlx`On tire <var>U</var> uniforme entre 0 et 1 (c'est ce que fait la fonction « random » d'un ordinateur), puis on pose ${vr('X')} = ${vr('a')} + (${vr('b')} − ${vr('a')})<var>U</var>.`,
  sample(P, t) { const u = Math.random(), x = P.a + (P.b - P.a) * u; if (t) t.html = `U = ${fmt(u, 3)} → X = ${fmt(P.a)} + ${fmt(P.b - P.a)} × ${fmt(u, 3)} = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Attendre le bus'), text: tl('Un bus passe toutes les 15 minutes et vous arrivez à l\'arrêt à un instant quelconque. Votre attente <var>X</var> (en minutes) suit 𝓤([0 ; 15]).'), params: { a: 0, b: 15 }, q: { type: 'ge', a: 10 }, ask: tl('Probabilité d\'attendre au moins 10 minutes') },
    { title: tl('Nombre aléatoire'), text: tl('La fonction random() d\'un tableur renvoie un nombre <var>X</var> uniforme entre 0 et 1.'), params: { a: 0, b: 1 }, q: { type: 'between', a: 0.2, b: 0.5 }, ask: tl('Probabilité que le nombre soit entre 0,2 et 0,5') }
  ],
  props: [
    tl('La probabilité d\'un intervalle ne dépend que de sa longueur : P(<var>c</var> ≤ <var>X</var> ≤ <var>d</var>) = (<var>d</var> − <var>c</var>) / (<var>b</var> − <var>a</var>).'),
    tl('Méthode d\'inversion : si <var>U</var> ∼ 𝓤([0 ; 1]) et <var>F</var> est une fonction de répartition, alors <var>F</var><sup>−1</sup>(<var>U</var>) suit la loi de fonction de répartition <var>F</var>. Toutes les lois de cet atlas peuvent ainsi être simulées à partir de nombres uniformes.'),
    tl('La somme de deux variables uniformes indépendantes sur [0 ; 1] suit une loi triangulaire sur [0 ; 2] : elle n\'est plus uniforme.'),
    tl('C\'est la limite de la loi uniforme discrète quand le nombre de valeurs devient très grand et leur écart très petit.')
  ]
},
{
  id: 'exponential', kind: 'continuous', name: 'Exponentielle', title: tl('loi exponentielle'), tag: tl('Durée de vie sans usure'),
  params: [{ key: 'lambda', label: tl('Taux (nombre moyen d\'événements par unité de temps)'), sym: 'λ', min: 0.05, max: 5, step: 0.05, value: 0.5 }],
  notation: P => `𝓔(${fmt(P.lambda)})`, genNotation: '𝓔(λ)',
  variable: tlx`${vr('X')} = durée d'attente avant un événement qui survient à un rythme constant λ (durée de vie, temps entre deux arrivées).`,
  lede: tl('La loi exponentielle modélise une durée de vie « sans usure » : la probabilité de tomber en panne dans la prochaine heure ne dépend pas de l\'âge de l\'appareil. C\'est l\'équivalent continu de la loi géométrique.'),
  when: tl('Durée de vie d\'un composant électronique, temps entre deux arrivées de clients, temps avant la désintégration d\'un atome radioactif.'),
  support: () => ({ min: 0, max: Infinity }), supportTxt: () => '[0 ; +∞[', genSupport: '[0 ; +∞[',
  pdf: (x, P) => x < 0 ? 0 : P.lambda * Math.exp(-P.lambda * x),
  cdf: (x, P) => x <= 0 ? 0 : 1 - Math.exp(-P.lambda * x),
  mean: P => 1 / P.lambda, variance: P => 1 / P.lambda ** 2, skew: () => 2, kurt: () => 6,
  mode: () => 0, median: P => Math.LN2 / P.lambda,
  F: {
    pdf: tl('f(x) = λ e<sup>−λx</sup> pour x ≥ 0'), cdf: tl('F(x) = 1 − e<sup>−λx</sup> pour x ≥ 0'),
    mean: 'E(X) = 1 / λ', variance: 'V(X) = 1 / λ²', mgf: tl('M(t) = λ / (λ − t) pour t &lt; λ')
  },
  Fexpr: (x, P) => x <= 0 ? '0' : `1 − e<sup>−${fmt(P.lambda)} × ${fmt(x)}</sup>`,
  mech: tl('Méthode d\'inversion : on tire <var>U</var> uniforme entre 0 et 1, puis <var>X</var> = −ln(<var>U</var>) / λ.'),
  sample(P, t) { const u = 1 - Math.random(), x = -Math.log(u) / P.lambda; if (t) t.html = `U = ${fmt(u, 3)} → X = −ln(${fmt(u, 3)}) / ${fmt(P.lambda)} = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Durée de vie d\'un appareil'), text: tl('Un appareil a une durée de vie moyenne de 8 ans, sans usure. Sa durée de vie <var>X</var> (en années) suit 𝓔(1/8) = 𝓔(0,125).'), params: { lambda: 0.125 }, q: { type: 'ge', a: 10 }, ask: tl('Probabilité qu\'il fonctionne encore après 10 ans') },
    { title: tl('Arrivées de clients'), text: tl('Il arrive en moyenne 2 clients par minute. Le temps <var>X</var> (en minutes) entre deux arrivées suit 𝓔(2).'), params: { lambda: 2 }, q: { type: 'le', a: 0.5 }, ask: tl('Probabilité que le client suivant arrive en moins de 30 secondes') }
  ],
  props: [
    tl('Absence de mémoire : P(<var>X</var> &gt; <var>s</var> + <var>t</var> | <var>X</var> &gt; <var>s</var>) = P(<var>X</var> &gt; <var>t</var>). C\'est la seule loi continue qui a cette propriété.'),
    tl('Lien avec Poisson : si les événements arrivent selon une loi de Poisson de paramètre λ par unité de temps, les durées entre deux événements suivent 𝓔(λ).'),
    tl('Le minimum de deux durées exponentielles indépendantes 𝓔(λ) et 𝓔(μ) suit 𝓔(λ + μ).'),
    tl('C\'est la loi gamma Γ(1 ; λ). La somme de <var>k</var> exponentielles indépendantes 𝓔(λ) suit Γ(<var>k</var> ; λ).'),
    tl('La médiane ln 2 / λ est inférieure à la moyenne 1/λ : la plupart des durées sont courtes, quelques-unes très longues.')
  ]
},
{
  id: 'normal', kind: 'continuous', name: 'Normale', title: tl('loi normale'), tag: tl('La courbe en cloche'),
  params: [
    { key: 'mu', label: 'Moyenne', sym: 'μ', min: -20, max: 200, step: 0.1, value: 0 },
    { key: 'sigma', label: tl('Écart-type'), sym: 'σ', min: 0.1, max: 50, step: 0.1, value: 1 }
  ],
  notation: P => `𝓝(${fmt(P.mu)} ; ${fmt(P.sigma ** 2)})`, genNotation: '𝓝(μ ; σ²)',
  variable: tlx`${vr('X')} = grandeur qui résulte de nombreux petits effets indépendants qui s'additionnent (mesure, taille, note, erreur).`,
  lede: tl('La loi normale (ou de Laplace-Gauss) est la loi centrale des statistiques. Sa densité en cloche est symétrique autour de μ, et σ règle sa largeur. Le théorème central limite explique pourquoi elle apparaît partout.'),
  when: tl('Erreurs de mesure, tailles et poids dans une population, scores de QI, moyennes d\'échantillons, approximation des lois binomiale et de Poisson.'),
  support: () => ({ min: -Infinity, max: Infinity }), supportTxt: () => 'ℝ', genSupport: 'ℝ = ]−∞ ; +∞[',
  pdf: (x, P) => Math.exp(-((x - P.mu) ** 2) / (2 * P.sigma ** 2)) / (P.sigma * Math.sqrt(2 * Math.PI)),
  cdf: (x, P) => Phi((x - P.mu) / P.sigma),
  mean: P => P.mu, variance: P => P.sigma ** 2, skew: () => 0, kurt: () => 0, mode: P => P.mu, median: P => P.mu,
  F: {
    pdf: 'f(x) = (1 / (σ√(2π))) e<sup>−(x − μ)² / (2σ²)</sup>',
    cdf: tl('F(x) = Φ((x − μ) / σ), où Φ est la fonction de répartition de 𝓝(0 ; 1) (table de la loi normale)'),
    mean: 'E(X) = μ', variance: 'V(X) = σ²', mgf: 'M(t) = e<sup>μt + σ²t²/2</sup>'
  },
  Fexpr: (x, P) => `Φ((${fmt(x)} − ${par(fmt(P.mu))}) / ${fmt(P.sigma)}) = Φ(${fmt((x - P.mu) / P.sigma, 4)})`,
  mech: tl('Méthode de Box-Muller : à partir de deux nombres uniformes <var>U</var>₁ et <var>U</var>₂, <var>Z</var> = √(−2 ln <var>U</var>₁) cos(2π<var>U</var>₂) suit 𝓝(0 ; 1). On pose ensuite <var>X</var> = μ + σ<var>Z</var>.'),
  sample(P, t) {
    const u1 = 1 - Math.random(), u2 = Math.random(), z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2), x = P.mu + P.sigma * z;
    if (t) t.html = `U₁ = ${fmt(u1, 3)}, U₂ = ${fmt(u2, 3)} → Z = ${fmt(z, 3)} → X = ${fmt(P.mu)} + ${fmt(P.sigma)} × ${par(fmt(z, 3))} = <b>${fmt(x, 3)}</b>`;
    return x;
  },
  overlays: [],
  examples: [
    { title: 'Quotient intellectuel', text: tl('Les scores de QI suivent 𝓝(100 ; 15²) : moyenne 100, écart-type 15.'), params: { mu: 100, sigma: 15 }, q: { type: 'ge', a: 130 }, ask: tl('Proportion de personnes ayant un QI d\'au moins 130') },
    { title: tl('Loi normale centrée réduite'), text: tl('<var>Z</var> ∼ 𝓝(0 ; 1) est la loi des tables. On cherche la valeur <var>z</var> qui laisse 2,5 % de chances à droite, celle des intervalles de confiance à 95 %.'), params: { mu: 0, sigma: 1 }, q: { type: 'q', a: 0.975 }, ask: tl('Quantile d\'ordre 0,975') }
  ],
  props: [
    tl('Règle 68-95-99,7 : environ 68 % des valeurs sont dans [μ − σ ; μ + σ], 95 % dans [μ − 2σ ; μ + 2σ] et 99,7 % dans [μ − 3σ ; μ + 3σ].'),
    tl('Centrage-réduction : si <var>X</var> ∼ 𝓝(μ ; σ²), alors <var>Z</var> = (<var>X</var> − μ)/σ ∼ 𝓝(0 ; 1). C\'est ainsi qu\'on utilise la table de Φ.'),
    tl('Stabilité : la somme de deux variables normales indépendantes 𝓝(μ₁ ; σ₁²) et 𝓝(μ₂ ; σ₂²) suit 𝓝(μ₁ + μ₂ ; σ₁² + σ₂²).'),
    tl('Théorème central limite : la moyenne de <var>n</var> variables indépendantes de même loi (avec variance finie) suit approximativement une loi normale quand <var>n</var> est grand, quelle que soit la loi de départ.'),
    tl('Convention : on écrit 𝓝(μ ; σ²) avec la variance. Certains ouvrages écrivent 𝓝(μ ; σ) avec l\'écart-type ; vérifiez toujours lequel est utilisé.')
  ]
},
{
  id: 'lognormal', kind: 'continuous', name: 'Log-normale', title: tl('loi log-normale'), tag: tl('Son logarithme est normal'),
  params: [
    { key: 'mu', label: tl('Moyenne de ln X'), sym: 'μ', min: -2, max: 5, step: 0.05, value: 0 },
    { key: 'sigma', label: tl('Écart-type de ln X'), sym: 'σ', min: 0.1, max: 2, step: 0.05, value: 0.5 }
  ],
  notation: P => `𝓛𝓝(${fmt(P.mu)} ; ${fmt(P.sigma ** 2)})`, genNotation: '𝓛𝓝(μ ; σ²)',
  variable: tlx`${vr('X')} = grandeur positive dont le logarithme suit 𝓝(μ ; σ²). Elle résulte de nombreux effets qui se multiplient.`,
  lede: tl('Une variable suit la loi log-normale quand son logarithme suit une loi normale. Elle est toujours positive et étalée vers la droite : beaucoup de petites valeurs et quelques très grandes.'),
  when: tl('Revenus et salaires, tailles de fichiers ou de villes, cours boursiers, concentrations de polluants, durées de réparation.'),
  support: () => ({ min: 0, max: Infinity }), supportTxt: () => ']0 ; +∞[', genSupport: ']0 ; +∞[',
  pdf: (x, P) => x <= 0 ? 0 : Math.exp(-((Math.log(x) - P.mu) ** 2) / (2 * P.sigma ** 2)) / (x * P.sigma * Math.sqrt(2 * Math.PI)),
  cdf: (x, P) => x <= 0 ? 0 : Phi((Math.log(x) - P.mu) / P.sigma),
  mean: P => Math.exp(P.mu + P.sigma ** 2 / 2), variance: P => (Math.exp(P.sigma ** 2) - 1) * Math.exp(2 * P.mu + P.sigma ** 2),
  skew: P => (Math.exp(P.sigma ** 2) + 2) * Math.sqrt(Math.exp(P.sigma ** 2) - 1),
  kurt: P => Math.exp(4 * P.sigma ** 2) + 2 * Math.exp(3 * P.sigma ** 2) + 3 * Math.exp(2 * P.sigma ** 2) - 6,
  mode: P => Math.exp(P.mu - P.sigma ** 2), median: P => Math.exp(P.mu),
  F: {
    pdf: tl('f(x) = (1 / (xσ√(2π))) e<sup>−(ln x − μ)² / (2σ²)</sup> pour x &gt; 0'),
    cdf: 'F(x) = Φ((ln x − μ) / σ)',
    mean: 'E(X) = e<sup>μ + σ²/2</sup>', variance: 'V(X) = (e<sup>σ²</sup> − 1) e<sup>2μ + σ²</sup>', mgf: NOMGF
  },
  Fexpr: (x, P) => x <= 0 ? '0' : `Φ((ln ${fmt(x)} − ${par(fmt(P.mu))}) / ${fmt(P.sigma)}) = Φ(${fmt((Math.log(x) - P.mu) / P.sigma, 4)})`,
  view: P => [0, quantile(CLAWS[3], P, 0.995)],
  mech: tl('On simule <var>Y</var> ∼ 𝓝(μ ; σ²) par la méthode de Box-Muller, puis on pose <var>X</var> = e<sup><var>Y</var></sup>.'),
  sample(P, t) { const y = P.mu + P.sigma * rnorm(), x = Math.exp(y); if (t) t.html = `Y = ${fmt(y, 3)} → X = e<sup>Y</sup> = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [],
  examples: [
    { title: 'Salaires', text: tl('Dans une entreprise, le logarithme du salaire annuel (en milliers d\'euros) suit 𝓝(3,4 ; 0,4²). Le salaire <var>X</var> suit donc 𝓛𝓝(3,4 ; 0,16).'), params: { mu: 3.4, sigma: 0.4 }, q: { type: 'ge', a: 50 }, ask: tl('Proportion de salariés gagnant au moins 50 000 €') },
    { title: tl('Taille de grains'), text: tl('Le diamètre <var>X</var> (en mm) des grains d\'un sable suit 𝓛𝓝(0 ; 0,25) : la médiane vaut e⁰ = 1 mm.'), params: { mu: 0, sigma: 0.5 }, q: { type: 'between', a: 0.5, b: 2 }, ask: tl('Proportion de grains entre 0,5 et 2 mm') }
  ],
  props: [
    tl('Si <var>X</var> ∼ 𝓛𝓝(μ ; σ²), alors ln <var>X</var> ∼ 𝓝(μ ; σ²) : on calcule toutes les probabilités avec la table de la loi normale.'),
    tl('Mode &lt; médiane &lt; moyenne : e<sup>μ − σ²</sup> &lt; e<sup>μ</sup> &lt; e<sup>μ + σ²/2</sup>. La moyenne est tirée vers le haut par les grandes valeurs.'),
    tl('Le produit de deux variables log-normales indépendantes est log-normal (les logarithmes s\'additionnent).'),
    tl('Version multiplicative du théorème central limite : un produit de nombreux facteurs positifs indépendants suit approximativement une loi log-normale.')
  ]
},
{
  id: 'gamma', kind: 'continuous', name: 'Gamma', title: tl('loi gamma'), tag: tl('Attente du k-ième événement'),
  params: [
    { key: 'k', label: tl('Paramètre de forme'), sym: 'k', min: 0.2, max: 30, step: 0.1, value: 2 },
    { key: 'lambda', label: 'Taux', sym: 'λ', min: 0.1, max: 5, step: 0.05, value: 1 }
  ],
  notation: P => `Γ(${fmt(P.k)} ; ${fmt(P.lambda)})`, genNotation: `Γ(${vr('k')} ; λ)`,
  variable: tlx`${vr('X')} = durée d'attente du ${vr('k')}-ième événement quand les événements arrivent au rythme λ (pour ${vr('k')} entier).`,
  lede: tl('La loi gamma généralise la loi exponentielle. Pour <var>k</var> entier, c\'est la durée d\'attente jusqu\'au <var>k</var>-ième événement d\'un processus de Poisson. Le paramètre <var>k</var> règle la forme, λ l\'échelle.'),
  when: tl('Temps nécessaire pour servir <var>k</var> clients, durée de vie d\'un système avec pièces de rechange, montants de sinistres en assurance, cumuls de pluie.'),
  support: () => ({ min: 0, max: Infinity }), supportTxt: () => '[0 ; +∞[', genSupport: '[0 ; +∞[',
  pdf: (x, P) => x < 0 ? 0 : x === 0 ? (P.k < 1 ? Infinity : P.k === 1 ? P.lambda : 0) : Math.exp(P.k * Math.log(P.lambda) + (P.k - 1) * Math.log(x) - P.lambda * x - lgamma(P.k)),
  cdf: (x, P) => gammaP(P.k, P.lambda * x),
  mean: P => P.k / P.lambda, variance: P => P.k / P.lambda ** 2, skew: P => 2 / Math.sqrt(P.k), kurt: P => 6 / P.k,
  mode: P => P.k >= 1 ? (P.k - 1) / P.lambda : 0,
  F: {
    pdf: tlx`f(x) = λ<sup>k</sup> x<sup>k − 1</sup> e<sup>−λx</sup> / Γ(${vr('k')}) pour x ≥ 0`,
    cdf: tlx`F(x) = γ(${vr('k')}, λx) / Γ(${vr('k')}) (fonction gamma incomplète). Pour ${vr('k')} entier : 1 − e<sup>−λx</sup> Σ<sub>j &lt; k</sub> (λx)<sup>j</sup>/j!`,
    mean: `E(X) = ${vr('k')} / λ`, variance: `V(X) = ${vr('k')} / λ²`, mgf: tlx`M(t) = (1 − t/λ)<sup>−k</sup> pour t &lt; λ`
  },
  Fexpr: (x, P) => `F(${fmt(x)})`,
  mech: tl('Si <var>k</var> est entier, on additionne <var>k</var> durées exponentielles 𝓔(λ) indépendantes (attente du 1<sup>er</sup> événement, puis du 2<sup>e</sup>, etc.). Sinon, on utilise la méthode de Marsaglia et Tsang, valable pour tout <var>k</var> &gt; 0.'),
  sample(P, t) {
    if (Number.isInteger(P.k) && P.k <= 50) {
      let s = 0; const parts = [];
      for (let i = 0; i < P.k; i++) { const e = -Math.log(1 - Math.random()) / P.lambda; s += e; if (parts.length < 8) parts.push(fmt(e, 2)); }
      if (t) t.html = tlx`Attentes successives <span class="tr">${parts.join(' + ')}${P.k > 8 ? ' + …' : ''}</span> → <b>X = ${fmt(s, 3)}</b>`;
      return s;
    }
    const x = rgamma(P.k) / P.lambda; if (t) t.html = `Marsaglia-Tsang → <b>X = ${fmt(x, 3)}</b>`; return x;
  },
  overlays: [{ id: 'normal', label: 'Approximation normale 𝓝(k/λ ; k/λ²)', fn: P => normalDensity(P.k / P.lambda, Math.sqrt(P.k) / P.lambda) }],
  examples: [
    { title: tl('Troisième client'), text: tl('Les clients arrivent au rythme de 2 par minute (processus de Poisson). L\'instant <var>X</var> d\'arrivée du 3<sup>e</sup> client suit Γ(3 ; 2).'), params: { k: 3, lambda: 2 }, q: { type: 'le', a: 1 }, ask: tl('Probabilité que 3 clients soient arrivés en moins d\'une minute') },
    { title: tl('Pièce de rechange'), text: tl('Un composant a une durée de vie 𝓔(0,1) (10 ans en moyenne) et on dispose d\'une pièce de rechange identique. La durée totale <var>X</var> suit Γ(2 ; 0,1).'), params: { k: 2, lambda: 0.1 }, q: { type: 'ge', a: 20 }, ask: tl('Probabilité que le système dure au moins 20 ans') }
  ],
  props: [
    tl('Pour <var>k</var> = 1, on retrouve la loi exponentielle 𝓔(λ).'),
    tl('Additivité : si <var>X</var> ∼ Γ(<var>k</var>₁ ; λ) et <var>Y</var> ∼ Γ(<var>k</var>₂ ; λ) sont indépendantes, <var>X</var> + <var>Y</var> ∼ Γ(<var>k</var>₁ + <var>k</var>₂ ; λ).'),
    tl('La loi du khi-deux est un cas particulier : χ²(<var>n</var>) = Γ(<var>n</var>/2 ; 1/2).'),
    tl('Pour <var>k</var> entier, on l\'appelle aussi loi d\'Erlang. Lien avec Poisson : P(<var>X</var> ≤ <var>t</var>) = P(au moins <var>k</var> événements avant <var>t</var>).'),
    tl('Convention : certains ouvrages utilisent l\'échelle θ = 1/λ au lieu du taux λ, et écrivent Γ(<var>k</var> ; θ).'),
    tl('Quand <var>k</var> est grand, la loi se rapproche de la loi normale (activez la superposition).')
  ]
},
{
  id: 'beta', kind: 'continuous', name: tl('Bêta'), title: tl('loi bêta'), tag: tl('Proportions entre 0 et 1'),
  params: [
    { key: 'alpha', label: tl('Premier paramètre de forme'), sym: 'α', min: 0.2, max: 20, step: 0.1, value: 2 },
    { key: 'beta', label: tl('Second paramètre de forme'), sym: 'β', min: 0.2, max: 20, step: 0.1, value: 5 }
  ],
  notation: P => tlx`Bêta(${fmt(P.alpha)} ; ${fmt(P.beta)})`, genNotation: tl('Bêta(α ; β)'),
  variable: tlx`${vr('X')} = proportion ou probabilité inconnue, comprise entre 0 et 1.`,
  lede: tl('La loi bêta décrit une quantité comprise entre 0 et 1, typiquement une proportion. Selon α et β, sa densité peut être en cloche, en U, en J ou plate : c\'est une loi très souple.'),
  when: tl('Taux de réussite, proportion d\'électeurs, probabilité inconnue en statistique bayésienne, durée relative d\'une tâche (méthode PERT).'),
  support: () => ({ min: 0, max: 1 }), supportTxt: () => '[0 ; 1]', genSupport: '[0 ; 1]',
  pdf: (x, P) => (x < 0 || x > 1) ? 0 : Math.exp((P.alpha - 1) * Math.log(x) + (P.beta - 1) * Math.log(1 - x) - lbeta(P.alpha, P.beta)),
  cdf: (x, P) => betaI(P.alpha, P.beta, x),
  mean: P => P.alpha / (P.alpha + P.beta),
  variance: P => P.alpha * P.beta / ((P.alpha + P.beta) ** 2 * (P.alpha + P.beta + 1)),
  skew: P => 2 * (P.beta - P.alpha) * Math.sqrt(P.alpha + P.beta + 1) / ((P.alpha + P.beta + 2) * Math.sqrt(P.alpha * P.beta)),
  kurt: P => { const a = P.alpha, b = P.beta; return 6 * ((a - b) ** 2 * (a + b + 1) - a * b * (a + b + 2)) / (a * b * (a + b + 2) * (a + b + 3)); },
  mode: P => {
    const a = P.alpha, b = P.beta;
    if (a > 1 && b > 1) return (a - 1) / (a + b - 2);
    if (a === 1 && b === 1) return tl('toute valeur de [0 ; 1]');
    if (a < 1 && b < 1) return tl('0 et 1 (densité en U)');
    if (a <= 1 && b >= 1) return 0;
    return 1;
  },
  F: {
    pdf: tl('f(x) = x<sup>α − 1</sup> (1 − x)<sup>β − 1</sup> / B(α, β) pour x ∈ [0 ; 1]'),
    cdf: tl('F(x) = I<sub>x</sub>(α, β) (fonction bêta incomplète régularisée)'),
    mean: 'E(X) = α / (α + β)', variance: 'V(X) = αβ / ((α + β)² (α + β + 1))',
    mgf: tl('pas de forme simple (série hypergéométrique ₁F₁)')
  },
  Fexpr: (x, P) => `I<sub>${fmt(x)}</sub>(${fmt(P.alpha)} ; ${fmt(P.beta)})`,
  view: () => [0, 1],
  mech: tl('On simule deux variables gamma indépendantes <var>G</var>₁ ∼ Γ(α ; 1) et <var>G</var>₂ ∼ Γ(β ; 1), puis <var>X</var> = <var>G</var>₁ / (<var>G</var>₁ + <var>G</var>₂).'),
  sample(P, t) { const g1 = rgamma(P.alpha), g2 = rgamma(P.beta), x = g1 / (g1 + g2); if (t) t.html = `G₁ = ${fmt(g1, 3)}, G₂ = ${fmt(g2, 3)} → X = G₁ / (G₁ + G₂) = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Taux de réussite estimé'), text: tl('On ne sait rien d\'un taux de réussite <var>p</var>, puis on observe 7 succès et 3 échecs. En statistique bayésienne, <var>p</var> suit alors Bêta(8 ; 4).'), params: { alpha: 8, beta: 4 }, q: { type: 'ge', a: 0.5 }, ask: tl('Probabilité que le taux de réussite dépasse 50 %') },
    { title: tl('Avancement d\'un projet'), text: tl('La part du budget consommée par une tâche suit Bêta(2 ; 5) : le plus souvent faible, rarement élevée.'), params: { alpha: 2, beta: 5 }, q: { type: 'le', a: 0.2 }, ask: tl('Probabilité que la tâche consomme au plus 20 % du budget') }
  ],
  props: [
    tl('Bêta(1 ; 1) est la loi uniforme sur [0 ; 1].'),
    tl('Symétrie : si <var>X</var> ∼ Bêta(α ; β), alors 1 − <var>X</var> ∼ Bêta(β ; α). La loi est symétrique quand α = β.'),
    tl('Statistique bayésienne : si l\'on part de Bêta(α ; β) pour une probabilité <var>p</var> et qu\'on observe <var>s</var> succès et <var>e</var> échecs, on obtient Bêta(α + <var>s</var> ; β + <var>e</var>).'),
    tl('Si <var>U</var>₁, …, <var>U</var><sub>n</sub> sont uniformes sur [0 ; 1], la <var>k</var>-ième plus petite valeur suit Bêta(<var>k</var> ; <var>n</var> − <var>k</var> + 1).')
  ]
},
{
  id: 'chi2', kind: 'continuous', name: 'Khi-deux', title: tl('loi du khi-deux'), tag: tl('Somme de carrés de normales'),
  params: [{ key: 'k', label: tl('Degrés de liberté'), sym: 'k', min: 1, max: 100, step: 1, value: 4, int: true }],
  notation: P => `χ²(${P.k})`, genNotation: `χ²(${vr('k')})`,
  variable: tlx`${vr('X')} = ${vr('Z')}₁² + … + ${vr('Z')}<sub>k</sub>², somme des carrés de ${vr('k')} variables normales centrées réduites indépendantes.`,
  lede: tl('La loi du khi-deux à <var>k</var> degrés de liberté est la loi d\'une somme de <var>k</var> carrés de variables normales 𝓝(0 ; 1) indépendantes. C\'est la loi des tests d\'adéquation et d\'indépendance.'),
  when: tl('Test du khi-deux (adéquation à une loi, indépendance dans un tableau de contingence), intervalle de confiance pour une variance.'),
  support: () => ({ min: 0, max: Infinity }), supportTxt: () => '[0 ; +∞[', genSupport: '[0 ; +∞[',
  pdf: (x, P) => x < 0 ? 0 : x === 0 ? (P.k < 2 ? Infinity : P.k === 2 ? 0.5 : 0) : Math.exp((P.k / 2 - 1) * Math.log(x) - x / 2 - (P.k / 2) * Math.LN2 - lgamma(P.k / 2)),
  cdf: (x, P) => gammaP(P.k / 2, x / 2),
  mean: P => P.k, variance: P => 2 * P.k, skew: P => Math.sqrt(8 / P.k), kurt: P => 12 / P.k, mode: P => Math.max(P.k - 2, 0),
  F: {
    pdf: tlx`f(x) = x<sup>k/2 − 1</sup> e<sup>−x/2</sup> / (2<sup>k/2</sup> Γ(${vr('k')}/2)) pour x ≥ 0`,
    cdf: tlx`F(x) = γ(${vr('k')}/2, x/2) / Γ(${vr('k')}/2) (lue dans la table du khi-deux)`,
    mean: `E(X) = ${vr('k')}`, variance: `V(X) = 2${vr('k')}`, mgf: tlx`M(t) = (1 − 2t)<sup>−k/2</sup> pour t &lt; 1/2`
  },
  Fexpr: (x, P) => `F(${fmt(x)})`,
  mech: tl('On tire <var>k</var> variables normales centrées réduites indépendantes et on additionne leurs carrés.'),
  sample(P, t) {
    let s = 0; const parts = [];
    for (let i = 0; i < P.k; i++) { const z = rnorm(); s += z * z; if (parts.length < 6) parts.push(`${par(fmt(z, 2))}²`); }
    if (t) t.html = `<span class="tr">${parts.join(' + ')}${P.k > 6 ? ' + …' : ''}</span> = <b>X = ${fmt(s, 3)}</b>`;
    return s;
  },
  overlays: [{ id: 'normal', label: 'Approximation normale 𝓝(k ; 2k)', fn: P => normalDensity(P.k, Math.sqrt(2 * P.k)) }],
  examples: [
    { title: tl('Tester un dé'), text: tl('On lance un dé 600 fois pour tester s\'il est équilibré. Sous l\'hypothèse « dé équilibré », la statistique du test suit χ²(5) (6 faces − 1). On rejette au risque 5 % si elle dépasse le quantile d\'ordre 0,95.'), params: { k: 5 }, q: { type: 'q', a: 0.95 }, ask: tl('Seuil de rejet au risque 5 %') },
    { title: tl('Indépendance'), text: tl('Un tableau de contingence 3 × 3 donne une statistique du khi-deux égale à 9,49, avec (3 − 1)(3 − 1) = 4 degrés de liberté.'), params: { k: 4 }, q: { type: 'ge', a: 9.49 }, ask: tl('p-valeur du test (probabilité de dépasser 9,49)') }
  ],
  props: [
    tl('Additivité : si <var>X</var> ∼ χ²(<var>k</var>₁) et <var>Y</var> ∼ χ²(<var>k</var>₂) sont indépendantes, <var>X</var> + <var>Y</var> ∼ χ²(<var>k</var>₁ + <var>k</var>₂).'),
    tl('χ²(<var>k</var>) = Γ(<var>k</var>/2 ; 1/2). En particulier χ²(2) est la loi exponentielle 𝓔(1/2).'),
    tl('Estimation d\'une variance : pour un échantillon normal de taille <var>n</var>, (<var>n</var> − 1)<var>S</var>²/σ² ∼ χ²(<var>n</var> − 1).'),
    tl('Pour <var>k</var> grand, χ²(<var>k</var>) ≈ 𝓝(<var>k</var> ; 2<var>k</var>) (activez la superposition).')
  ]
},
{
  id: 'student', kind: 'continuous', name: 'Student', title: tl('loi de Student'), tag: tl('Petits échantillons'),
  params: [{ key: 'k', label: tl('Degrés de liberté'), sym: 'k', min: 1, max: 100, step: 1, value: 5, int: true }],
  notation: P => `𝓣(${P.k})`, genNotation: `𝓣(${vr('k')})`,
  variable: tlx`${vr('X')} = ${vr('Z')} / √(${vr('Y')}/${vr('k')}) avec ${vr('Z')} ∼ 𝓝(0 ; 1) et ${vr('Y')} ∼ χ²(${vr('k')}) indépendantes.`,
  lede: tl('La loi de Student ressemble à la loi normale centrée réduite, avec des queues plus épaisses. Elle apparaît quand on standardise une moyenne avec un écart-type estimé sur un petit échantillon. Plus <var>k</var> est grand, plus elle se rapproche de 𝓝(0 ; 1).'),
  when: tl('Intervalle de confiance et test sur une moyenne quand l\'écart-type est inconnu, comparaison de deux moyennes, coefficients d\'une régression.'),
  support: () => ({ min: -Infinity, max: Infinity }), supportTxt: () => 'ℝ', genSupport: 'ℝ = ]−∞ ; +∞[',
  pdf: (x, P) => Math.exp(lgamma((P.k + 1) / 2) - lgamma(P.k / 2) - 0.5 * Math.log(P.k * Math.PI) - (P.k + 1) / 2 * Math.log(1 + x * x / P.k)),
  cdf: (x, P) => { const ib = betaI(P.k / 2, 0.5, P.k / (P.k + x * x)); return x >= 0 ? 1 - ib / 2 : ib / 2; },
  mean: P => P.k > 1 ? 0 : NaN, variance: P => P.k > 2 ? P.k / (P.k - 2) : P.k === 2 ? Infinity : NaN,
  skew: P => P.k > 3 ? 0 : NaN, kurt: P => P.k > 4 ? 6 / (P.k - 4) : P.k > 2 ? Infinity : NaN, mode: () => 0, median: () => 0,
  F: {
    pdf: `f(x) = Γ((${vr('k')} + 1)/2) / (√(${vr('k')}π) Γ(${vr('k')}/2)) · (1 + x²/${vr('k')})<sup>−(k + 1)/2</sup>`,
    cdf: tl('F(x) lue dans la table de Student (s\'exprime avec la fonction bêta incomplète)'),
    mean: tlx`E(X) = 0 si ${vr('k')} &gt; 1 (n'existe pas si ${vr('k')} = 1)`, variance: tlx`V(X) = ${vr('k')} / (${vr('k')} − 2) si ${vr('k')} &gt; 2 (infinie si ${vr('k')} = 2)`,
    mgf: tl('n\'existe pas (les queues sont trop épaisses)')
  },
  Fexpr: (x, P) => `F(${fmt(x)})`,
  view: P => { const q = Math.max(4, quantile(CLAWS[7], P, 0.98)); return [-q, q]; },
  mech: tl('On tire <var>Z</var> ∼ 𝓝(0 ; 1) et <var>Y</var> ∼ χ²(<var>k</var>) (somme de <var>k</var> carrés de normales), puis <var>X</var> = <var>Z</var> / √(<var>Y</var>/<var>k</var>). Pour <var>k</var> = 1 (loi de Cauchy), observez que la moyenne des tirages ne se stabilise jamais.'),
  sample(P, t) { const z = rnorm(), y = rchi2(P.k), x = z / Math.sqrt(y / P.k); if (t) t.html = `Z = ${fmt(z, 3)}, Y = ${fmt(y, 3)} → X = Z / √(Y/${P.k}) = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [{ id: 'normal', label: tl('Loi normale 𝓝(0 ; 1)'), fn: () => normalDensity(0, 1) }],
  examples: [
    { title: tl('Intervalle de confiance'), text: tl('Sur un échantillon de 10 mesures, l\'intervalle de confiance à 95 % de la moyenne est x̄ ± <var>t</var> · s/√10, où <var>t</var> est le quantile d\'ordre 0,975 de 𝓣(9).'), params: { k: 9 }, q: { type: 'q', a: 0.975 }, ask: tl('Valeur de t à utiliser') },
    { title: tl('Queues épaisses'), text: tl('Avec seulement 3 degrés de liberté, les valeurs extrêmes sont bien plus fréquentes qu\'avec la loi normale (pour 𝓝(0 ; 1), P(|Z| ≤ 2) ≈ 0,954).'), params: { k: 3 }, q: { type: 'between', a: -2, b: 2 }, ask: tl('Probabilité que X soit entre −2 et 2') }
  ],
  props: [
    tl('Statistique de Student : pour un échantillon normal de taille <var>n</var>, (<var>X̄</var> − μ) / (<var>S</var>/√<var>n</var>) ∼ 𝓣(<var>n</var> − 1).'),
    tl('Quand <var>k</var> → ∞, 𝓣(<var>k</var>) tend vers 𝓝(0 ; 1). En pratique, pour <var>k</var> ≥ 30 la différence est faible (comparez avec la superposition).'),
    tl('Pour <var>k</var> = 1, c\'est la loi de Cauchy : elle n\'a pas d\'espérance, et la loi des grands nombres ne s\'applique pas. La simulation le montre bien.'),
    tl('Le carré d\'une variable 𝓣(<var>k</var>) suit la loi de Fisher 𝓕(1 ; <var>k</var>).'),
    tl('La loi est symétrique : F(−x) = 1 − F(x).')
  ]
},
{
  id: 'fisher', kind: 'continuous', name: 'Fisher', title: tl('loi de Fisher'), tag: tl('Rapport de deux variances'),
  params: [
    { key: 'd1', label: tl('Degrés de liberté du numérateur'), sym: 'd₁', min: 1, max: 100, step: 1, value: 5, int: true },
    { key: 'd2', label: tl('Degrés de liberté du dénominateur'), sym: 'd₂', min: 1, max: 100, step: 1, value: 10, int: true }
  ],
  notation: P => `𝓕(${P.d1} ; ${P.d2})`, genNotation: '𝓕(<var>d</var>₁ ; <var>d</var>₂)',
  variable: tlx`${vr('X')} = (${vr('U')}/${vr('d')}₁) / (${vr('V')}/${vr('d')}₂) avec ${vr('U')} ∼ χ²(${vr('d')}₁) et ${vr('V')} ∼ χ²(${vr('d')}₂) indépendantes.`,
  lede: tl('La loi de Fisher (ou de Fisher-Snedecor) est la loi d\'un rapport de deux khi-deux divisés par leurs degrés de liberté. Elle sert à comparer des variances.'),
  when: tl('Analyse de la variance (ANOVA), test d\'égalité de deux variances, test global d\'une régression.'),
  support: () => ({ min: 0, max: Infinity }), supportTxt: () => '[0 ; +∞[', genSupport: '[0 ; +∞[',
  pdf: (x, P) => {
    const a = P.d1, b = P.d2;
    if (x < 0) return 0;
    if (x === 0) return a < 2 ? Infinity : a === 2 ? 1 : 0;
    return Math.exp(0.5 * (a * Math.log(a * x) + b * Math.log(b) - (a + b) * Math.log(a * x + b)) - Math.log(x) - lbeta(a / 2, b / 2));
  },
  cdf: (x, P) => x <= 0 ? 0 : betaI(P.d1 / 2, P.d2 / 2, P.d1 * x / (P.d1 * x + P.d2)),
  mean: P => P.d2 > 2 ? P.d2 / (P.d2 - 2) : NaN,
  variance: P => { const a = P.d1, b = P.d2; return b > 4 ? 2 * b * b * (a + b - 2) / (a * (b - 2) ** 2 * (b - 4)) : b > 2 ? Infinity : NaN; },
  skew: P => { const a = P.d1, b = P.d2; return b > 6 ? (2 * a + b - 2) * Math.sqrt(8 * (b - 4)) / ((b - 6) * Math.sqrt(a * (a + b - 2))) : NaN; },
  kurt: P => { const a = P.d1, b = P.d2; return b > 8 ? 12 * (a * (5 * b - 22) * (a + b - 2) + (b - 4) * (b - 2) ** 2) / (a * (b - 6) * (b - 8) * (a + b - 2)) : NaN; },
  mode: P => P.d1 > 2 ? (P.d1 - 2) / P.d1 * P.d2 / (P.d2 + 2) : 0,
  F: {
    pdf: tl('f(x) = √( (d₁x)<sup>d₁</sup> d₂<sup>d₂</sup> / (d₁x + d₂)<sup>d₁ + d₂</sup> ) / (x B(d₁/2, d₂/2)) pour x &gt; 0'),
    cdf: tl('F(x) = I<sub>d₁x/(d₁x + d₂)</sub>(d₁/2, d₂/2), lue dans la table de Fisher'),
    mean: tl('E(X) = d₂ / (d₂ − 2) si d₂ &gt; 2'), variance: tl('V(X) = 2d₂²(d₁ + d₂ − 2) / (d₁(d₂ − 2)²(d₂ − 4)) si d₂ &gt; 4'),
    mgf: tl('n\'existe pas')
  },
  Fexpr: (x, P) => `F(${fmt(x)})`,
  view: P => [0, Math.max(2.5, Math.min(quantile(CLAWS[8], P, 0.99), 8))],
  mech: tl('On simule <var>U</var> ∼ χ²(<var>d</var>₁) et <var>V</var> ∼ χ²(<var>d</var>₂) (sommes de carrés de normales), puis <var>X</var> = (<var>U</var>/<var>d</var>₁) / (<var>V</var>/<var>d</var>₂).'),
  sample(P, t) { const u = rchi2(P.d1), w = rchi2(P.d2), x = (u / P.d1) / (w / P.d2); if (t) t.html = `U = ${fmt(u, 3)}, V = ${fmt(w, 3)} → X = (U/${P.d1}) / (V/${P.d2}) = <b>${fmt(x, 3)}</b>`; return x; },
  overlays: [],
  examples: [
    { title: tl('Analyse de la variance'), text: tl('On compare 4 groupes de 6 personnes. La statistique de l\'ANOVA suit 𝓕(3 ; 20) sous l\'hypothèse « mêmes moyennes ». On rejette au risque 5 % au-delà du quantile d\'ordre 0,95.'), params: { d1: 3, d2: 20 }, q: { type: 'q', a: 0.95 }, ask: tl('Seuil critique au risque 5 %') },
    { title: 'Comparer deux variances', text: tl('Deux échantillons de 11 mesures donnent un rapport de variances s₁²/s₂² = 3. Sous l\'hypothèse de variances égales, ce rapport suit 𝓕(10 ; 10).'), params: { d1: 10, d2: 10 }, q: { type: 'ge', a: 3 }, ask: tl('Probabilité d\'observer un rapport au moins égal à 3') }
  ],
  props: [
    tl('Si <var>X</var> ∼ 𝓕(<var>d</var>₁ ; <var>d</var>₂), alors 1/<var>X</var> ∼ 𝓕(<var>d</var>₂ ; <var>d</var>₁). C\'est ainsi qu\'on lit les quantiles inférieurs dans les tables.'),
    tl('Si <var>T</var> ∼ 𝓣(<var>k</var>), alors <var>T</var>² ∼ 𝓕(1 ; <var>k</var>).'),
    tl('Rapport de variances : pour deux échantillons normaux indépendants de tailles <var>n</var>₁ et <var>n</var>₂ et de même variance, <var>S</var>₁²/<var>S</var>₂² ∼ 𝓕(<var>n</var>₁ − 1 ; <var>n</var>₂ − 1).'),
    tl('Quand <var>d</var>₂ → ∞, <var>d</var>₁<var>X</var> tend vers une loi χ²(<var>d</var>₁).')
  ]
}
];
LAWS.push(...CLAWS);
const FR_TITLES = { bernoulli: 'loi de Bernoulli', binomial: 'loi binomiale', geometric: 'loi géométrique', poisson: 'loi de Poisson', hypergeometric: 'loi hypergéométrique', uniform: 'loi uniforme discrète', pascal: 'loi de Pascal' };
LAWS.forEach(L => { if (!L.title) L.title = tl(FR_TITLES[L.id]); });

// ---------- Lecture d'une loi saisie au clavier ----------
const NAMES = [
  ['bernoulli', ['bernoulli', 'ber', 'bern']],
  ['binomial', ['binomiale', 'binomial', 'bin', 'binom', 'b']],
  ['geometric', ['geometrique', 'geometric', 'geometrica', 'geo', 'geom', 'g']],
  ['poisson', ['poisson', 'pois', 'p']],
  ['hypergeometric', ['hypergeometrique', 'hypergeometric', 'hipergeometrica', 'hyper', 'hiper', 'hypergeo', 'h', 'hg']],
  ['uniform', ['uniforme', 'uniform', 'unif', 'u', 'uniforme discrete', 'discrete uniform', 'uniforme discreta']],
  ['pascal', ['pascal', 'pa', 'binomiale negative', 'negative binomial', 'binomial negative', 'binomial negativa', 'nb', 'bn']],
  ['cuniform', ['uniforme continue', 'continuous uniform', 'uniforme continua']],
  ['exponential', ['exponentielle', 'exponential', 'exponencial', 'exp', 'expo', 'e']],
  ['normal', ['normale', 'normal', 'gauss', 'laplace-gauss', 'gaussienne', 'gaussian', 'gaussiana', 'n']],
  ['lognormal', ['log-normale', 'lognormale', 'log normale', 'lognormal', 'log-normal', 'log normal', 'ln', 'lognorm']],
  ['gamma', ['gamma', 'ga', 'erlang']],
  ['beta', ['beta', 'be']],
  ['chi2', ['khideux']],
  ['student', ['student', 't', 'st']],
  ['fisher', ['fisher', 'f', 'fisher-snedecor', 'snedecor']]
];
const WANT = { bernoulli: [1], binomial: [2], geometric: [1], poisson: [1], hypergeometric: [3], uniform: [1, 2], pascal: [2],
  cuniform: [2], exponential: [1], normal: [2], lognormal: [2], gamma: [2], beta: [2], chi2: [1], student: [1], fisher: [2] };

function splitArgs(s, mode) {
  s = s.replace(/[a-zλμσαβ]+\s*=/g, ' ').replace(/[()\[\]{}]/g, ' ').trim();
  if (!s) return [];
  let parts;
  if (mode === 'fr') parts = s.split(/;|\s+|,\s+/).map(x => x.replace(',', '.'));
  else parts = s.split(/[;,\s]+/);
  return parts.filter(x => x !== '').map(x => (x.includes('/') ? x.split('/').reduce((a, b) => Number(a) / Number(b)) : Number(x)));
}

function assign(id, args) {
  const P = {}; const notes = [];
  switch (id) {
    case 'bernoulli': case 'geometric': P.p = args[0]; break;
    case 'poisson': P.lambda = args[0]; break;
    case 'binomial': P.n = args[0]; P.p = args[1]; break;
    case 'pascal': P.r = args[0]; P.p = args[1]; break;
    case 'uniform': if (args.length === 1) { P.a = 1; P.b = args[0]; } else { P.a = args[0]; P.b = args[1]; } break;
    case 'hypergeometric':
      if (args[2] > 0 && args[2] < 1 && !Number.isInteger(args[2])) { P.N = args[0]; P.n = args[1]; P.K = Math.round(args[2] * args[0]); notes.push(tl('paramètres lus comme 𝓗(N ; n ; p)')); }
      else { P.N = args[0]; P.K = args[1]; P.n = args[2]; }
      break;
    case 'cuniform': P.a = args[0]; P.b = args[1]; break;
    case 'exponential': P.lambda = args[0]; break;
    case 'normal': case 'lognormal':
      P.mu = args[0]; P.sigma = Math.sqrt(Math.max(args[1], 0)); notes.push(tl('le second paramètre est lu comme la variance σ²')); break;
    case 'gamma': P.k = args[0]; P.lambda = args[1]; notes.push(tl('paramètres lus comme Γ(k ; λ), λ étant le taux')); break;
    case 'beta': P.alpha = args[0]; P.beta = args[1]; break;
    case 'chi2': case 'student': P.k = args[0]; break;
    case 'fisher': P.d1 = args[0]; P.d2 = args[1]; break;
  }
  return { id, raw: P, notes };
}

function parseLaw(input) {
  const orig = input;
  let s = input.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  s = s.replace(/\s+(de\s+|des\s+|of\s+|de\s+los\s+|dos\s+)?(parametres?|parameters?|parametros?)\b/g, ' ').replace(/\s+(et|avec|and|with|y|con|e|com)\s+/g, ' ');
  s = s.replace(/^x\s*(~|∼|↪|->|suit|follows|sigue|segue)\s*/, '').replace(/^(la\s+|the\s+|el\s+|a\s+|o\s+)?(loi|law|distribution|ley|distribucion|distribuicao|lei)\s+(de\s+|du\s+|d'|of\s+|del\s+|da\s+|do\s+)?/, '');
  s = s.replace(/𝓑/g, 'b').replace(/𝓟/g, 'p').replace(/𝓖/g, 'g').replace(/𝓗/g, 'h').replace(/𝓤/g, 'u').replace(/𝓝/g, 'n').replace(/𝓔/g, 'e').replace(/𝓣/g, 't').replace(/𝓕/g, 'f').replace(/𝓛𝓝/g, 'ln')
    .replace(/γ|г/g, 'gamma').replace(/β/g, 'beta').replace(/^(khi|chi|qui|ji|χ|x)[\s-]*(2|²|deux|carre|square|cuadrado|quadrado|dos)/, 'khideux').replace(/^cauchy\b/, 'student 1');
  if (!s) return { err: tl('Écrivez une loi, par exemple B(20 ; 0,3), Poisson(4) ou N(0 ; 1).') };
  const m = s.match(/^([a-z][a-z\s'-]*?)\s*(?=[(\[\d.,;-]|$)(.*)$/);
  const list = tl('Exemples : B(20 ; 0,3), Poisson(4), G(0,2), H(50 ; 10 ; 8), U(1 ; 6), Pascal(3 ; 0,3), N(0 ; 1), E(0,5), U([0 ; 1]), LN(0 ; 0,25), Gamma(2 ; 1), Bêta(2 ; 5), khi2(4), Student(5), F(5 ; 10).');
  if (!m) return { err: tl('Je n\'ai pas reconnu de nom de loi. ') + list };
  const name = m[1].trim().replace(/\s+/g, ' ');
  const rest = m[2];
  let ids = NAMES.filter(([, al]) => al.includes(name)).map(([id]) => id);
  if (!ids.length) return { err: tlx`Loi « ${m[1].trim()} » inconnue. ${list}` };
  if (name === 'b') ids = ['bernoulli', 'binomial'];
  const variants = [splitArgs(rest, 'fr'), splitArgs(rest, 'en')];
  if (!variants[0].length) return { id: ids[ids.length - 1], raw: {}, notes: [tl('paramètres par défaut, à régler dans le panneau')] };
  for (const args of variants) {
    if (args.some(x => !isFinite(x))) continue;
    for (let id of ids) {
      if (!WANT[id].includes(args.length)) continue;
      // U(a ; b) : continue si l'on écrit un intervalle avec crochets ou si une borne n'est pas entière
      if (id === 'uniform' && args.length === 2 && (/[\[\]]/.test(orig) || args.some(x => !Number.isInteger(x)))) id = 'cuniform';
      return assign(id, args);
    }
  }
  const L = getLaw(ids[ids.length - 1]);
  const nb = WANT[L.id].join(' ou ');
  return { err: tlx`La ${lawTitle(L)} attend ${nb} ${pl(nb === '1' ? 1 : 2, 'paramètre', 'paramètres')} (${L.params.map(q => q.sym).join(' ; ')}). Séparez-les par « ; », par exemple ${L.notation(constrain(L, { ...Object.fromEntries(L.params.map(q => [q.key, q.value])), ...L.examples[0].params }))}.` };
}
