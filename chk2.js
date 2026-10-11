
// ---------- Applications concrètes ----------
const USAGES = {
  bernoulli: {
    problem: tl('Modéliser toute décision ou mesure à deux issues : réussite ou échec, oui ou non. C\'est la brique de départ pour compter des succès ou attendre un événement.'),
    sectors: [
      { s: 'Marketing', t: tl('un visiteur clique sur une publicité ou non (taux de clic).') },
      { s: tl('Santé'), t: tl('un patient répond ou non à un traitement.') },
      { s: 'Industrie', t: tl('une pièce contrôlée est conforme ou défectueuse.') },
      { s: 'Finance', t: tl('un emprunteur rembourse son crédit ou fait défaut.') }
    ],
    limit: tl('ne convient pas si le résultat a plus de deux issues (on utilise alors la loi multinomiale) ou si l\'on compte plusieurs essais.')
  },
  binomial: {
    problem: tl('Savoir combien de succès attendre sur un nombre fixé d\'essais indépendants, et avec quelle probabilité un seuil est dépassé.'),
    sectors: [
      { s: tl('Qualité'), t: tl('nombre de pièces défectueuses dans un échantillon, pour accepter ou refuser un lot.') },
      { s: tl('Santé'), t: tl('nombre de patients guéris parmi les <var>n</var> traités d\'un essai clinique.') },
      { s: 'E-commerce', t: tl('nombre de visiteurs qui achètent parmi les <var>n</var> d\'une journée.') },
      { s: 'Sondages', t: tl('nombre de personnes favorables à une mesure dans un échantillon tiré avec remise.') }
    ],
    limit: tl('ne convient pas si les essais ne sont pas indépendants (tirage sans remise dans une petite population : loi hypergéométrique) ou si la probabilité change d\'un essai à l\'autre.')
  },
  geometric: {
    problem: tl('Prévoir combien d\'essais il faudra avant le premier succès, par exemple pour dimensionner un effort de prospection.'),
    sectors: [
      { s: 'Ventes', t: tl('nombre d\'appels avant la première vente.') },
      { s: 'Informatique', t: tl('nombre de tentatives de transmission avant qu\'un message passe.') },
      { s: 'Fabrication', t: tl('nombre de pièces produites avant le premier défaut.') },
      { s: tl('Fiabilité'), t: tl('nombre de cycles d\'utilisation avant la première panne d\'un appareil.') }
    ],
    limit: tl('suppose que la probabilité de succès <var>p</var> reste constante ; si l\'on s\'améliore avec l\'expérience, l\'attente est surestimée.')
  },
  poisson: {
    problem: tl('Compter des événements rares et indépendants dans un intervalle de temps ou d\'espace, pour dimensionner des capacités et repérer ce qui sort de l\'ordinaire.'),
    sectors: [
      { s: tl('Centres d\'appels'), t: tl('appels reçus par minute, pour dimensionner le nombre d\'opérateurs.') },
      { s: tl('Santé'), t: tl('arrivées aux urgences par heure, pour planifier le personnel.') },
      { s: 'Assurance', t: tl('nombre de sinistres par an dans un portefeuille.') },
      { s: tl('Sécurité routière'), t: tl('nombre d\'accidents par mois sur un tronçon de route.') }
    ],
    limit: tl('suppose un rythme constant et des événements indépendants ; en cas de rafales ou d\'heures de pointe, la variance dépasse la moyenne et il faut une autre loi (binomiale négative, par exemple).')
  },
  hypergeometric: {
    problem: tl('Calculer des probabilités quand on tire sans remise dans une petite population, là où la loi binomiale serait fausse.'),
    sectors: [
      { s: tl('Contrôle qualité'), t: tl('prélever 10 pièces dans un lot de 50 qui contient 4 défauts.') },
      { s: tl('Jeux et loterie'), t: tl('probabilités du loto ou d\'une main de cartes au poker.') },
      { s: 'Audit', t: tl('vérifier un échantillon de factures parmi celles d\'un registre où certaines sont erronées.') },
      { s: tl('Écologie'), t: tl('capture-recapture : estimer la taille d\'une population animale.') }
    ],
    limit: tl('inutile quand l\'échantillon est petit devant la population (<var>n</var>/<var>N</var> ≤ 0,1) : la loi binomiale donne alors presque le même résultat, plus simplement.')
  },
  uniform: {
    problem: tl('Modéliser un tirage où toutes les valeurs sont également probables, point de départ de la formule « cas favorables sur cas possibles ».'),
    sectors: [
      { s: 'Jeux', t: tl('lancer d\'un dé, tirage d\'un numéro de loterie.') },
      { s: 'Informatique', t: tl('choisir au hasard un serveur, un indice ou une clé.') },
      { s: 'Statistiques', t: tl('tirer un échantillon aléatoire parmi <var>n</var> individus numérotés.') },
      { s: tl('Éducation'), t: tl('tirer au sort un candidat ou un sujet d\'examen.') }
    ],
    limit: tl('ne convient pas si certaines valeurs sont plus fréquentes que d\'autres, ce qui est le cas de la plupart des mesures réelles.')
  },
  pascal: {
    problem: tl('Prévoir combien d\'essais il faudra pour atteindre un objectif de <var>r</var> succès, quand chaque essai réussit avec la probabilité <var>p</var>.'),
    sectors: [
      { s: 'Ressources humaines', t: tl('nombre d\'entretiens nécessaires pour recruter <var>r</var> personnes.') },
      { s: tl('Prospection minière'), t: tl('nombre de forages pour trouver <var>r</var> gisements exploitables.') },
      { s: 'Sport', t: tl('nombre de tentatives pour réussir <var>r</var> lancers francs.') },
      { s: tl('Études cliniques'), t: tl('nombre de personnes à solliciter pour recruter <var>r</var> participants quand la part qui accepte est connue.') }
    ],
    limit: tl('mêmes hypothèses que la loi géométrique (essais indépendants, <var>p</var> constante) ; ne convient pas pour un nombre d\'essais fixé à l\'avance.')
  },
  cuniform: {
    problem: tl('Modéliser une valeur continue pour laquelle on n\'a aucune information, où tous les sous-intervalles de même longueur sont équiprobables ; base de la simulation sur ordinateur.'),
    sectors: [
      { s: 'Transport', t: tl('attente d\'un bus ou d\'un train qui passe à intervalle fixe.') },
      { s: 'Simulation', t: tl('générateurs de nombres aléatoires et méthodes de Monte-Carlo.') },
      { s: tl('Métrologie'), t: tl('erreur d\'arrondi d\'un instrument de mesure.') },
      { s: 'Physique', t: tl('position d\'un point au hasard sur un segment, phase d\'un signal.') }
    ],
    limit: tl('ne convient pas si la grandeur a une valeur centrale plus probable (cloche) ou n\'est pas bornée.')
  },
  exponential: {
    problem: tl('Modéliser des durées d\'attente ou de vie sans usure : probabilité qu\'un événement se produise avant un temps donné.'),
    sectors: [
      { s: tl('Fiabilité et maintenance'), t: tl('durée de vie de composants électroniques, planification des remplacements.') },
      { s: tl('Files d\'attente'), t: tl('temps entre deux arrivées de clients, de requêtes ou d\'appels.') },
      { s: 'Physique', t: tl('désintégration radioactive, demi-vie d\'un élément.') },
      { s: tl('Télécoms'), t: tl('durée d\'un appel, souvent approchée par une exponentielle.') }
    ],
    limit: tl('ne convient pas si le risque de panne augmente avec l\'âge (usure) : on utilise alors la loi gamma ou la loi de Weibull.')
  },
  normal: {
    problem: tl('Décrire une grandeur qui résulte de nombreux petits effets indépendants, et calculer la proportion de valeurs situées dans un intervalle.'),
    sectors: [
      { s: 'Industrie', t: tl('tolérances de fabrication, cartes de contrôle en maîtrise statistique des procédés.') },
      { s: tl('Santé'), t: tl('tailles, poids, tension artérielle ; intervalles de référence en biologie médicale.') },
      { s: tl('Éducation et psychologie'), t: tl('scores de tests (QI), étalonnage d\'examens.') },
      { s: 'Finance', t: tl('rendements journaliers dans les modèles classiques, calcul de la valeur à risque.') }
    ],
    limit: tl('ne convient pas pour des grandeurs strictement positives très asymétriques (revenus : loi log-normale) ni pour des phénomènes à valeurs extrêmes fréquentes (queues épaisses).')
  },
  lognormal: {
    problem: tl('Modéliser des grandeurs positives, très étalées vers les grandes valeurs, qui résultent d\'effets qui se multiplient.'),
    sectors: [
      { s: 'Finance', t: tl('cours d\'actions dans le modèle de Black-Scholes.') },
      { s: tl('Économie'), t: tl('répartition des revenus et des salaires.') },
      { s: 'Environnement', t: tl('concentrations de polluants, tailles de particules.') },
      { s: 'Maintenance', t: tl('durées de réparation, souvent courtes mais parfois très longues.') }
    ],
    limit: tl('ne convient pas si les valeurs peuvent être nulles ou négatives.')
  },
  gamma: {
    problem: tl('Modéliser un temps d\'attente cumulé ou une quantité positive asymétrique : temps pour obtenir <var>k</var> événements, montants cumulés.'),
    sectors: [
      { s: 'Assurance', t: tl('coût des sinistres, montants cumulés de remboursements.') },
      { s: tl('Météorologie'), t: tl('cumuls de précipitations sur une période.') },
      { s: tl('Files d\'attente'), t: tl('temps de service composé de plusieurs étapes successives.') },
      { s: tl('Fiabilité'), t: tl('durée de fonctionnement d\'un système avec des pièces de rechange.') }
    ],
    limit: tl('suppose un taux d\'arrivée des événements constant ; s\'il varie dans le temps, le modèle ne tient plus.')
  },
  beta: {
    problem: tl('Modéliser une proportion ou une probabilité inconnue, comprise entre 0 et 1, et la mettre à jour avec de nouvelles observations.'),
    sectors: [
      { s: tl('Statistique bayésienne'), t: tl('taux de conversion ou de réussite après observation de succès et d\'échecs (tests A/B).') },
      { s: tl('Gestion de projet'), t: tl('durée relative d\'une tâche (méthode PERT).') },
      { s: tl('Santé'), t: tl('proportion de patients répondant à un traitement, avant et après un essai.') },
      { s: 'Apprentissage automatique', t: tl('choisir entre plusieurs options en testant (échantillonnage de Thompson).') }
    ],
    limit: tl('ne décrit que des valeurs comprises entre 0 et 1 ; 0 et 1 exactement sont impossibles dans le modèle.')
  },
  chi2: {
    problem: tl('Tester si des données observées correspondent à un modèle, ou si deux critères sont indépendants ; estimer une variance.'),
    sectors: [
      { s: tl('Marketing et sociologie'), t: tl('lien entre le profil des clients et le produit choisi (tableaux de contingence).') },
      { s: tl('Génétique'), t: tl('conformité des proportions observées aux lois de Mendel.') },
      { s: tl('Contrôle qualité'), t: tl('intervalle de confiance sur la variabilité d\'un procédé.') },
      { s: tl('Jeux et simulation'), t: tl('tester l\'équilibre d\'un dé ou d\'un générateur aléatoire.') }
    ],
    limit: tl('le test du khi-deux demande des effectifs théoriques suffisants (au moins 5 par case).')
  },
  student: {
    problem: tl('Tirer des conclusions sur une moyenne quand l\'échantillon est petit et que l\'écart-type de la population est inconnu.'),
    sectors: [
      { s: tl('Santé'), t: tl('comparer l\'effet de deux traitements sur de petits groupes de patients.') },
      { s: 'Agriculture', t: tl('comparer les rendements de deux variétés avec peu de parcelles.') },
      { s: 'Industrie', t: tl('vérifier qu\'un lot respecte une valeur cible à partir de quelques mesures.') },
      { s: 'Recherche', t: tl('intervalles de confiance et tests sur des moyennes (test <var>t</var>), coefficients d\'une régression.') }
    ],
    limit: tl('suppose des données à peu près normales ; avec de très petits échantillons très asymétriques, préférer un test non paramétrique.')
  },
  fisher: {
    problem: tl('Comparer des variances, tester si plusieurs groupes ont la même moyenne (analyse de la variance) ou si un modèle de régression explique les données.'),
    sectors: [
      { s: 'Agronomie', t: tl('effet de plusieurs engrais sur le rendement (ANOVA).') },
      { s: 'Industrie', t: tl('comparer la régularité de deux machines par un rapport de variances.') },
      { s: tl('Économie et sciences sociales'), t: tl('test global d\'un modèle de régression.') },
      { s: tl('Médecine'), t: tl('comparer plusieurs traitements en un seul test.') }
    ],
    limit: tl('très sensible à l\'écart à la normalité : le test de comparaison de variances n\'est fiable que si les données sont proches d\'une loi normale.')
  }
};

// ---------- Aléatoire ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function withSeed(seed, fn) { const r = Math.random; Math.random = mulberry32(seed); try { return fn(); } finally { Math.random = r; } }
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const isCont = L => L.kind === 'continuous';

// ====================================================================
// Quiz
// ====================================================================
const QP = {
  bernoulli: () => ({ p: pick([0.2, 0.25, 0.3, 0.4, 0.6, 0.7]) }),
  binomial: () => ({ n: pick([6, 8, 10, 12, 15, 20]), p: pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]) }),
  geometric: () => ({ p: pick([0.1, 0.2, 0.25, 0.4, 0.5]) }),
  poisson: () => ({ lambda: pick([1, 1.5, 2, 3, 4, 5]) }),
  hypergeometric: () => ({ N: pick([20, 30, 40, 50]), K: pick([4, 5, 6, 8, 10]), n: pick([3, 4, 5, 6, 8]) }),
  uniform: () => { const a = pick([0, 1, 2]); return { a, b: a + pick([5, 7, 9, 11]) }; },
  pascal: () => ({ r: pick([2, 3, 4]), p: pick([0.3, 0.4, 0.5, 0.6]) }),
  cuniform: () => { const a = pick([0, 1, 2, 5]); return { a, b: a + pick([4, 6, 10, 20]) }; },
  exponential: () => ({ lambda: pick([0.25, 0.5, 1, 2]) }),
  normal: () => ({ mu: pick([0, 10, 50, 100]), sigma: pick([1, 2, 5, 10, 15]) }),
  lognormal: () => ({ mu: pick([0, 1, 2]), sigma: pick([0.25, 0.5, 1]) }),
  gamma: () => ({ k: pick([2, 3, 4, 5]), lambda: pick([0.5, 1, 2]) }),
  beta: () => ({ alpha: pick([2, 3, 5]), beta: pick([2, 3, 5]) }),
  chi2: () => ({ k: pick([2, 3, 4, 5, 6, 8, 10]) }),
  student: () => ({ k: pick([5, 6, 8, 10, 15]) }),
  fisher: () => ({ d1: pick([3, 4, 5, 8]), d2: pick([8, 10, 12, 20]) })
};

const GEN_SUPPORT = {
  bernoulli: '{0, 1}', binomial: '{0, 1, …, <var>n</var>}', geometric: 'ℕ* = {1, 2, 3, …}', poisson: 'ℕ = {0, 1, 2, …}',
  hypergeometric: '{max(0, <var>n</var> − (<var>N</var> − <var>K</var>)), …, min(<var>n</var>, <var>K</var>)}',
  uniform: '{<var>a</var>, <var>a</var> + 1, …, <var>b</var>}', pascal: '{<var>r</var>, <var>r</var> + 1, …}',
  cuniform: '[<var>a</var> ; <var>b</var>]', exponential: '[0 ; +∞[', normal: 'ℝ', lognormal: ']0 ; +∞[', gamma: '[0 ; +∞[', beta: '[0 ; 1]',
  chi2: '[0 ; +∞[', student: 'ℝ', fisher: '[0 ; +∞['
};

const SCEN = [
  ['bernoulli', tl('Un joueur tire une seule fois au penalty : il marque ou il rate. On note <var>X</var> = 1 s\'il marque.'), tl('Une seule épreuve à deux issues : c\'est la définition de la loi de Bernoulli.')],
  ['bernoulli', tl('On interroge un client au hasard : il est abonné (1) ou non (0). Que suit <var>X</var> ?'), tl('Une seule observation à deux issues : loi de Bernoulli.')],
  ['binomial', tl('Un élève répond au hasard à un QCM de 10 questions à 4 choix. <var>X</var> = nombre de bonnes réponses.'), tl('On compte les succès sur un nombre fixé d\'épreuves indépendantes de même probabilité : loi binomiale.')],
  ['binomial', tl('On lance 50 fois une pièce truquée qui tombe sur pile avec la probabilité 0,6. <var>X</var> = nombre de piles.'), tl('Nombre de succès sur 50 lancers indépendants identiques : loi binomiale 𝓑(50 ; 0,6).')],
  ['geometric', tl('On lance un dé jusqu\'à obtenir un 6. <var>X</var> = nombre de lancers nécessaires.'), tl('On attend le premier succès : le rang du premier succès suit une loi géométrique.')],
  ['geometric', tl('Un robot tente d\'ouvrir une porte, avec une chance sur 5 de réussir à chaque essai. <var>X</var> = nombre d\'essais jusqu\'à la première réussite.'), tl('Attente du premier succès avec <var>p</var> constante : loi géométrique 𝓖(1/5).')],
  ['poisson', tl('Un standard reçoit en moyenne 4 appels par minute, de façon indépendante. <var>X</var> = nombre d\'appels reçus en une minute.'), tl('Comptage d\'événements indépendants à rythme moyen constant dans un intervalle : loi de Poisson.')],
  ['poisson', tl('Sur un tronçon de route, il y a en moyenne 2 accidents par mois, indépendants les uns des autres. <var>X</var> = nombre d\'accidents en un mois.'), tl('Nombre d\'événements rares dans un intervalle de temps : loi de Poisson 𝓟(2).')],
  ['hypergeometric', tl('Une urne contient 20 boules dont 6 rouges. On en tire 5 d\'un coup, sans remise. <var>X</var> = nombre de boules rouges.'), tl('Tirage sans remise dans une population finie : loi hypergéométrique.')],
  ['hypergeometric', tl('Au loto, on coche 6 numéros parmi 49 ; 6 numéros gagnants sont tirés. <var>X</var> = nombre de bons numéros.'), tl('On compte les « bons » éléments dans un tirage sans remise : loi hypergéométrique 𝓗(49 ; 6 ; 6).')],
  ['uniform', tl('On lance un dé équilibré à 6 faces. <var>X</var> = résultat obtenu.'), tl('Six valeurs équiprobables : loi uniforme discrète sur {1, …, 6}.')],
  ['uniform', tl('On tire au hasard un billet numéroté de 1 à 100. <var>X</var> = numéro du billet.'), tl('Toutes les valeurs entières de 1 à 100 ont la même probabilité : loi uniforme discrète.')],
  ['pascal', tl('On lance un dé jusqu\'à obtenir 3 fois un 6. <var>X</var> = nombre total de lancers.'), tl('On attend le <var>r</var>-ième succès (ici <var>r</var> = 3) : loi de Pascal.')],
  ['pascal', tl('Une joueuse réussit chaque lancer franc avec la probabilité 0,7. <var>X</var> = nombre de lancers nécessaires pour en réussir 5.'), tl('Nombre d\'essais pour obtenir 5 succès : loi de Pascal (binomiale négative).')],
  ['cuniform', tl('Un bus passe toutes les 15 minutes et vous arrivez à un instant quelconque. <var>X</var> = temps d\'attente, en minutes.'), tl('L\'arrivée est « au hasard » dans l\'intervalle [0 ; 15] : loi uniforme continue.')],
  ['cuniform', tl('On choisit au hasard un nombre réel entre 0 et 1 (fonction random d\'un tableur). <var>X</var> = ce nombre.'), tl('Tous les sous-intervalles de même longueur sont équiprobables : loi uniforme continue sur [0 ; 1].')],
  ['exponential', tl('Un composant électronique tombe en panne sans jamais s\'user, avec une durée de vie moyenne de 8 ans. <var>X</var> = durée de vie.'), tl('Durée de vie sans usure (sans mémoire) : loi exponentielle.')],
  ['exponential', tl('Des clients arrivent à un guichet selon un processus de Poisson. <var>X</var> = temps entre deux arrivées consécutives.'), tl('Le temps entre deux événements d\'un processus de Poisson suit une loi exponentielle.')],
  ['normal', tl('La taille des adultes d\'une population se répartit en cloche, de façon symétrique autour de 170 cm. <var>X</var> = taille d\'une personne.'), tl('Grandeur en cloche symétrique, somme de nombreux petits effets : loi normale.')],
  ['normal', tl('On mesure plusieurs fois une même grandeur : l\'erreur de mesure est la somme de nombreux petits aléas indépendants. <var>X</var> = erreur.'), tl('Somme de nombreux petits effets indépendants : loi normale (théorème central limite).')],
  ['lognormal', tl('Les salaires d\'une entreprise sont très étalés vers la droite, et le logarithme du salaire suit une loi normale. <var>X</var> = salaire.'), tl('Grandeur positive dont le logarithme est normal : loi log-normale.')],
  ['lognormal', tl('Chaque jour, le cours d\'une action est multiplié par un petit facteur aléatoire positif, indépendant des autres jours. <var>X</var> = cours après de nombreux jours.'), tl('Effets qui se multiplient : le logarithme est une somme, donc normal ; la grandeur suit une loi log-normale.')],
  ['gamma', tl('Les clients arrivent au rythme de 2 par minute (processus de Poisson). <var>X</var> = instant d\'arrivée du 3<sup>e</sup> client.'), tl('Temps d\'attente du <var>k</var>-ième événement d\'un processus de Poisson : loi gamma (Erlang) Γ(3 ; 2).')],
  ['gamma', tl('Un composant a une durée de vie exponentielle et on dispose de 2 pièces de rechange identiques. <var>X</var> = durée totale de fonctionnement.'), tl('Somme de plusieurs durées exponentielles indépendantes : loi gamma.')],
  ['beta', tl('Après avoir observé 7 succès et 3 échecs, on modélise la probabilité inconnue de succès <var>p</var>. <var>X</var> = <var>p</var>.'), tl('Une probabilité inconnue comprise entre 0 et 1, mise à jour par les observations : loi bêta.')],
  ['beta', tl('<var>X</var> est la part du budget consommée par une tâche : toujours entre 0 et 1, avec des valeurs plutôt faibles.'), tl('Une proportion entre 0 et 1 à densité souple : loi bêta.')],
  ['chi2', tl('On additionne les carrés de 5 variables normales centrées réduites indépendantes. <var>X</var> = cette somme.'), tl('C\'est la définition de la loi du khi-deux à 5 degrés de liberté.')],
  ['chi2', tl('Pour tester l\'équilibre d\'un dé à 6 faces, on calcule la statistique de Pearson. <var>X</var> = cette statistique sous l\'hypothèse « dé équilibré ».'), tl('La statistique d\'un test d\'adéquation suit un khi-deux, avec 6 − 1 = 5 degrés de liberté.')],
  ['student', tl('On standardise la moyenne d\'un petit échantillon normal (<var>n</var> = 10) avec l\'écart-type estimé : <var>X</var> = (moyenne − μ) / (<var>s</var>/√<var>n</var>).'), tl('Moyenne standardisée avec un écart-type estimé sur un petit échantillon : loi de Student à 9 degrés de liberté.')],
  ['student', tl('On veut un intervalle de confiance sur une moyenne avec 9 observations et un écart-type inconnu. Quelle loi donne le coefficient multiplicateur ?'), tl('Écart-type inconnu et petit échantillon : on utilise la loi de Student.')],
  ['fisher', tl('On compare les variances de deux échantillons normaux indépendants en calculant le rapport <var>S</var>₁² / <var>S</var>₂².'), tl('Un rapport de deux variances d\'échantillons normaux suit une loi de Fisher.')],
  ['fisher', tl('Dans une analyse de la variance (ANOVA), on forme le rapport de deux carrés moyens. Quelle loi suit-il sous l\'hypothèse « mêmes moyennes » ?'), tl('Le rapport de deux carrés moyens suit une loi de Fisher.')]
];

const CONF = {
  bernoulli: ['binomial', 'uniform', 'geometric'], binomial: ['hypergeometric', 'poisson', 'pascal', 'bernoulli'], geometric: ['pascal', 'exponential', 'poisson', 'binomial'],
  poisson: ['binomial', 'exponential', 'gamma', 'geometric'], hypergeometric: ['binomial', 'uniform', 'pascal'], uniform: ['binomial', 'cuniform', 'geometric'],
  pascal: ['geometric', 'binomial', 'gamma'], cuniform: ['uniform', 'beta', 'exponential'], exponential: ['gamma', 'poisson', 'geometric', 'lognormal'],
  normal: ['student', 'lognormal', 'chi2'], lognormal: ['normal', 'gamma', 'exponential'], gamma: ['exponential', 'chi2', 'lognormal', 'poisson'],
  beta: ['cuniform', 'gamma', 'normal'], chi2: ['gamma', 'student', 'fisher', 'normal'], student: ['normal', 'chi2', 'fisher'], fisher: ['chi2', 'student', 'gamma']
};

const CONCEPTS = [
  { law: 'geometric', q: tl('Quelle loi discrète est <b>sans mémoire</b> (avoir déjà échoué ne change rien à l\'attente restante) ?'), good: tl('Géométrique'), bad: ['Binomiale', 'Poisson', tl('Hypergéométrique')], why: tl('P(<var>X</var> &gt; <var>m</var> + <var>n</var> | <var>X</var> &gt; <var>m</var>) = P(<var>X</var> &gt; <var>n</var>) : seule la loi géométrique a cette propriété parmi les lois discrètes.') },
  { law: 'exponential', q: tl('Quelle loi <b>continue</b> est sans mémoire ?'), good: 'Exponentielle', bad: ['Normale', 'Uniforme continue', 'Log-normale'], why: tl('La loi exponentielle est l\'unique loi continue sans mémoire : la durée de vie restante ne dépend pas de l\'âge.') },
  { law: 'poisson', q: tl('Que valent l\'espérance et la variance d\'une loi de Poisson 𝓟(λ) ?'), good: tl('Toutes deux égales à λ'), bad: [tl('E(X) = λ et V(X) = λ²'), tl('E(X) = λ et V(X) = √λ'), tl('E(X) = 1/λ et V(X) = 1/λ²')], why: tl('E(<var>X</var>) = V(<var>X</var>) = λ. Si la variance observée est bien plus grande que la moyenne, la loi de Poisson ne convient pas.') },
  { law: 'binomial', q: tl('Si <var>X</var> ∼ 𝓑(<var>n</var> ; <var>p</var>) et <var>Y</var> ∼ 𝓑(<var>m</var> ; <var>p</var>) sont indépendantes, que suit <var>X</var> + <var>Y</var> ?'), good: '𝓑(<var>n</var> + <var>m</var> ; <var>p</var>)', bad: ['𝓑(<var>n</var> × <var>m</var> ; <var>p</var>)', '𝓑(<var>n</var> + <var>m</var> ; 2<var>p</var>)', '𝓑(<var>n</var> ; <var>p</var> + <var>p</var>)'], why: tl('On additionne <var>n</var> + <var>m</var> épreuves de Bernoulli indépendantes de même probabilité <var>p</var>.') },
  { law: 'poisson', q: tl('Si <var>X</var> ∼ 𝓟(λ) et <var>Y</var> ∼ 𝓟(μ) sont indépendantes, que suit <var>X</var> + <var>Y</var> ?'), good: '𝓟(λ + μ)', bad: ['𝓟(λμ)', '𝓟(λ + μ)² ', '𝓟((λ + μ)/2)'], why: tl('Les taux d\'arrivée s\'additionnent : la somme suit une loi de Poisson de paramètre λ + μ.') },
  { law: 'binomial', q: tl('Pour <var>n</var> grand et <var>p</var> petit, la loi 𝓑(<var>n</var> ; <var>p</var>) est bien approchée par :'), good: tl('la loi de Poisson 𝓟(<var>np</var>)'), bad: [tl('la loi géométrique 𝓖(<var>p</var>)'), tl('la loi uniforme'), tl('la loi exponentielle 𝓔(<var>np</var>)')], why: tl('Règle usuelle : <var>n</var> ≥ 30 et <var>p</var> ≤ 0,1. Le paramètre de la loi de Poisson est λ = <var>np</var>.') },
  { law: 'normal', q: tl('Pour une loi continue, que vaut P(<var>X</var> = <var>x</var>) pour une valeur précise <var>x</var> ?'), good: '0', bad: ['f(x)', 'F(x)', '1/n'], why: tl('Pour une variable continue, seules les probabilités d\'intervalles sont non nulles : P(<var>X</var> = <var>x</var>) = 0 et P(<var>X</var> ≤ <var>x</var>) = P(<var>X</var> &lt; <var>x</var>).') },
  { law: 'normal', q: tl('Pour une loi normale, quelle part des valeurs se trouve dans [μ − 2σ ; μ + 2σ] ?'), good: 'Environ 95 %', bad: ['Environ 68 %', 'Environ 99,7 %', 'Environ 50 %'], why: tl('Règle 68-95-99,7 : 68 % à 1σ, 95 % à 2σ, 99,7 % à 3σ.') },
  { law: 'student', q: tl('Quand le nombre de degrés de liberté <var>k</var> devient très grand, la loi de Student tend vers :'), good: tl('la loi normale centrée réduite 𝓝(0 ; 1)'), bad: [tl('la loi du khi-deux'), tl('la loi uniforme'), tl('la loi de Cauchy')], why: tl('Les queues de la loi de Student s\'amincissent quand <var>k</var> augmente ; pour <var>k</var> ≥ 30 elle est presque normale.') },
  { law: 'chi2', q: tl('Si <var>Z</var> suit 𝓝(0 ; 1), que suit <var>Z</var>² ?'), good: tl('Un khi-deux à 1 degré de liberté'), bad: [tl('Une loi normale'), tl('Une loi exponentielle'), tl('Une loi de Student à 1 degré de liberté')], why: tl('Par définition, la somme de <var>k</var> carrés de normales centrées réduites indépendantes suit χ²(<var>k</var>) ; ici <var>k</var> = 1.') },
  { law: 'gamma', q: tl('La loi gamma Γ(1 ; λ) est en fait :'), good: tl('la loi exponentielle 𝓔(λ)'), bad: [tl('la loi de Poisson 𝓟(λ)'), tl('la loi normale 𝓝(λ ; λ)'), tl('la loi uniforme sur [0 ; λ]')], why: tl('Pour <var>k</var> = 1 la densité gamma devient λ e<sup>−λx</sup>, celle de l\'exponentielle.') },
  { law: 'hypergeometric', q: tl('Lequel de ces modèles correspond à un tirage <b>sans remise</b> dans une petite population ?'), good: tl('Hypergéométrique'), bad: ['Binomiale', 'Poisson', tl('Géométrique')], why: tl('Sans remise, les tirages ne sont pas indépendants : on utilise la loi hypergéométrique. La binomiale correspond au tirage avec remise.') },
  { law: 'pascal', q: tl('La loi de Pascal avec <var>r</var> = 1 est :'), good: tl('la loi géométrique'), bad: [tl('la loi de Bernoulli'), tl('la loi binomiale'), tl('la loi de Poisson')], why: tl('Attendre le 1<sup>er</sup> succès, c\'est la définition de la loi géométrique.') },
  { law: 'beta', q: tl('La loi bêta Bêta(1 ; 1) est :'), good: tl('la loi uniforme sur [0 ; 1]'), bad: [tl('la loi exponentielle'), tl('la loi normale centrée réduite'), tl('la loi de Bernoulli de paramètre 1/2')], why: tl('Avec α = β = 1 la densité vaut 1 sur [0 ; 1] : elle est constante.') },
  { law: 'fisher', q: tl('Quelle loi sert à comparer deux variances ?'), good: 'Fisher', bad: ['Student', 'Poisson', 'Exponentielle'], why: tl('Le rapport de deux variances d\'échantillons normaux suit une loi de Fisher.') },
  { law: 'lognormal', q: tl('Si <var>X</var> suit une loi log-normale, quelle variable suit une loi normale ?'), good: 'ln(<var>X</var>)', bad: ['e<sup>−X</sup>', '√<var>X</var>', '<var>X</var>²'], why: tl('Par définition, ln <var>X</var> ∼ 𝓝(μ ; σ²).') }
];

const evTxt = q => ({ eq: `P(X = ${q.a})`, le: `P(X ≤ ${q.a})`, lt: `P(X &lt; ${q.a})`, ge: `P(X ≥ ${q.a})`, gt: `P(X &gt; ${q.a})`, between: `P(${q.a} ≤ X ≤ ${q.b})` }[q.type]);

function distinctOptions(correct, pool, count, keyFn) {
  const seen = new Set([keyFn(correct)]); const out = [];
  for (const c of pool) { const k = keyFn(c); if (!seen.has(k)) { seen.add(k); out.push(c); if (out.length >= count) break; } }
  return out;
}
const numKey = (x, d = 4) => (Number.isFinite(x) ? fmt(x, d) : String(x));
function numOptions(correct, candidates, d = 4) {
  const key = x => numKey(x, d);
  const wrong = distinctOptions(correct, shuffle(candidates.filter(Number.isFinite)), 3, key);
  let extra = correct, tries = 0;
  const used = new Set([correct, ...wrong].map(key));
  while (wrong.length < 3 && tries++ < 40) { extra = extra * (1 + 0.37 * tries) + 0.1; if (!used.has(key(extra))) { used.add(key(extra)); wrong.push(extra); } }
  return shuffle([{ v: correct, ok: true }, ...wrong.map(v => ({ v, ok: false }))]);
}

function qProbDiscrete(L, P) {
  const T = table(L, P), s = L.support(P), m = L.mean(P);
  for (let tries = 0; tries < 30; tries++) {
    const hi = Number.isFinite(s.max) ? s.max : s.min + 40;
    const k = Math.min(Math.max(Math.round(m) + pick([-1, 0, 1]), s.min), hi);
    const type = pick(['eq', 'le', 'ge', 'lt', 'gt']);
    const q = { type, a: k }, v = prob(T, q);
    if (!(v > 0.01 && v < 0.99)) continue;
    const others = ['eq', 'le', 'lt', 'ge', 'gt'].filter(t => t !== type).map(t => prob(T, { type: t, a: k }));
    const cand = [...others, 1 - v, prob(T, { type, a: k + 1 }), prob(T, { type, a: k - 1 })].filter(x => x > 0 && x < 1);
    const opts = numOptions(v, cand);
    let how;
    if (type === 'eq') how = L.detail(k, P);
    else if (type === 'le') how = tlx`P(X ≤ ${k}) est la somme des P(X = j) pour j ≤ ${k}.`;
    else if (type === 'lt') how = tlx`P(X &lt; ${k}) = P(X ≤ ${k - 1}) : on s'arrête à ${k - 1}.`;
    else if (type === 'ge') how = tlx`P(X ≥ ${k}) = 1 − P(X ≤ ${k - 1}) : on passe par l'événement contraire.`;
    else how = tlx`P(X &gt; ${k}) = 1 − P(X ≤ ${k}) : on passe par l'événement contraire.`;
    return {
      html: tlx`Soit <var>X</var> ∼ ${L.notation(P)}. Quelle est la probabilité ${evTxt(q)} ?`,
      options: opts.map(o => ({ html: fmt(o.v, 4), ok: o.ok })),
      explain: `${evTxt(q)} = <b>${fmt(v, 4)}</b>. ${how}`
    };
  }
  return null;
}
function niceX(x) { const p = Number(Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toPrecision(2)); return p; }
function qProbContinuous(L, P) {
  const sd = Math.sqrt(L.variance(P)), m = L.mean(P);
  for (let tries = 0; tries < 30; tries++) {
    let x, x2;
    if (L.id === 'normal') { x = P.mu + P.sigma * pick([-1, -0.5, 0.5, 1, 1.5, 2]); x2 = x + P.sigma * pick([0.5, 1, 1.5]); }
    else { x = niceX(quantile(L, P, pick([0.2, 0.3, 0.5, 0.7]))); x2 = niceX(quantile(L, P, pick([0.8, 0.9, 0.95]))); }
    if (!(x2 > x)) continue;
    const type = pick(['le', 'ge', 'between']);
    const q = type === 'between' ? { type, a: x, b: x2 } : { type, a: x };
    const v = probC(L, P, q);
    if (!(v > 0.01 && v < 0.99)) continue;
    const dl = Number.isFinite(sd) ? sd / 2 : Math.abs(x) * 0.2 + 0.5;
    const cand = [1 - v, probC(L, P, { ...q, a: x + dl }), probC(L, P, { ...q, a: Math.max(x - dl, -1e9) }), probC(L, P, { type: 'le', a: x }), probC(L, P, { type: 'ge', a: x })].filter(t => t > 0 && t < 1);
    const opts = numOptions(v, cand);
    const how = type === 'le' ? tlx`P(X ≤ ${fmt(x)}) = F(${fmt(x)}), lu dans la table ou calculé.` : type === 'ge' ? tlx`P(X ≥ ${fmt(x)}) = 1 − F(${fmt(x)}), l'événement contraire de X ≤ ${fmt(x)}.` : `P(${fmt(x)} ≤ X ≤ ${fmt(x2)}) = F(${fmt(x2)}) − F(${fmt(x)}).`;
    const ev = type === 'le' ? `P(X ≤ ${fmt(x)})` : type === 'ge' ? `P(X ≥ ${fmt(x)})` : `P(${fmt(x)} ≤ X ≤ ${fmt(x2)})`;
    return { html: tlx`Soit <var>X</var> ∼ ${L.notation(P)}. Quelle est la probabilité ${ev} ?`, options: opts.map(o => ({ html: fmt(o.v, 4), ok: o.ok })), explain: `${ev} = <b>${fmt(v, 4)}</b>. ${how}` };
  }
  return null;
}
function qQuantile(L, P) {
  const alphas = [0.9, 0.95, 0.975, 0.99, 0.5, 0.75]; const a = pick([0.9, 0.95, 0.975, 0.99]);
  const val = al => quantile(L, P, al);
  const opts = numOptions(val(a), alphas.filter(x => x !== a).map(val), 3);
  return { html: tlx`Soit <var>X</var> ∼ ${L.notation(P)}. Quel est le quantile d'ordre ${fmt(a)}, c'est-à-dire la valeur <var>x</var> telle que P(<var>X</var> ≤ <var>x</var>) = ${fmt(a)} ?`, options: opts.map(o => ({ html: fmt(o.v, 3), ok: o.ok })), explain: tlx`Le quantile d'ordre ${fmt(a)} vaut <b>${fmt(val(a), 3)}</b> : ${fmt(a * 100, 1)} % des valeurs sont en dessous. Les autres propositions sont les quantiles d'autres ordres.` };
}
function qMoment(L, P) {
  const m = L.mean(P), v = L.variance(P), sd = Math.sqrt(v);
  const which = pick(['mean', 'variance', 'sd']);
  const target = which === 'mean' ? m : which === 'variance' ? v : sd;
  const label = which === 'mean' ? tl('l\'espérance E(<var>X</var>)') : which === 'variance' ? tl('la variance V(<var>X</var>)') : tl('l\'écart-type σ(<var>X</var>)');
  const cand = [m, v, sd, m * 2, m / 2, v + m, Math.sqrt(m), 1 / (m || 1)];
  const comp = (P.p !== undefined) ? [L.mean({ ...P, p: 1 - P.p }), L.variance({ ...P, p: 1 - P.p })] : [];
  const opts = numOptions(target, cand.concat(comp).filter(x => Number.isFinite(x) && x > 0));
  const formula = which === 'mean' ? L.F.mean : which === 'variance' ? L.F.variance : tl('σ = √V(X), la racine carrée de la variance.');
  return { html: tlx`Soit <var>X</var> ∼ ${L.notation(P)}. Que vaut ${label} ?`, options: opts.map(o => ({ html: fmt(o.v, 4), ok: o.ok })), explain: tlx`Valeur : <b>${fmt(target, 4)}</b>. Formule : ${formula}` };
}
function qFormula(L, all) {
  const cont = isCont(L);
  const kinds = [['mean', tl('l\'espérance')], ['variance', tl('la variance')], [cont ? 'pdf' : 'pmf', cont ? tl('la densité') : tl('la loi de probabilité P(X = k)')], ['support', tl('le support (les valeurs possibles)')]];
  const [key, name] = pick(kinds);
  const get = M => key === 'support' ? GEN_SUPPORT[M.id] : M.F[key];
  const pool = shuffle(all.filter(M => M.id !== L.id && isCont(M) === cont));
  const wrong = distinctOptions(L, pool, 3, M => get(M));
  const opts = shuffle([{ html: get(L), ok: true }, ...wrong.map(M => ({ html: get(M), ok: false }))]);
  const exp = tlx`Pour la ${lawTitle(L)}, ${name} est : ${get(L)}`;
  return { html: tlx`Quelle est l'expression correcte de ${name} pour la <b>${lawTitle(L)}</b> ?`, options: opts, explain: exp, formula: true };
}
function qScenario(L, all) {
  const items = SCEN.filter(s => s[0] === L.id); const [, text, why] = pick(items);
  const conf = (CONF[L.id] || []).map(id => all.find(M => M.id === id)).filter(Boolean);
  const rest = shuffle(all.filter(M => M.id !== L.id && isCont(M) === isCont(L) && !conf.includes(M)));
  const wrong = distinctOptions(L, [...shuffle(conf.slice()).slice(0, 2), ...rest], 3, M => M.name);
  const opts = shuffle([{ html: L.name, ok: true }, ...wrong.map(M => ({ html: M.name, ok: false }))]);
  return { html: tlx`Quelle loi modélise la variable <var>X</var> dans cette situation ?<blockquote>${text}</blockquote>`, options: opts, explain: `<b>${L.name}</b>. ${why}` };
}
function qApplication(L, all) {
  const U = USAGES[L.id]; const sec = pick(U.sectors);
  const far = shuffle(all.filter(M => M.id !== L.id && !(CONF[L.id] || []).includes(M.id)));
  const wrong = distinctOptions(L, far, 3, M => M.name);
  const opts = shuffle([{ html: L.name, ok: true }, ...wrong.map(M => ({ html: M.name, ok: false }))]);
  return { html: tlx`Dans le domaine « ${sec.s} », on s'intéresse à : <blockquote>${sec.t.replace(/^./, c => c.toUpperCase())}</blockquote>Quelle loi sert à modéliser cela ?`, options: opts, explain: `<b>${L.name}</b>. ${U.problem}` };
}
function qConcept(item) {
  const opts = shuffle([{ html: item.good, ok: true }, ...item.bad.map(h => ({ html: h, ok: false }))]);
  return { html: item.q, options: opts, explain: item.why };
}

const QUIZ_KINDS = { calc: tl('Calculs de probabilités et de quantiles'), moment: tl('Espérance, variance, écart-type'), formula: 'Formules', scenario: tl('Reconnaître la loi'), application: tl('Applications par secteur'), concept: tl('Propriétés et liens entre lois') };
function genQuestion(L, kind, all) {
  const cont = isCont(L); let q = null;
  for (let tries = 0; tries < 8 && !q; tries++) {
    const P = constrain(L, QP[L.id]());
    let k = kind;
    if (k === 'mix') k = pick(['calc', 'calc', 'moment', 'formula', 'scenario', 'application', 'concept']);
    if (k === 'calc') { q = (cont && Math.random() < 0.3) ? qQuantile(L, P) : (cont ? qProbContinuous(L, P) : qProbDiscrete(L, P)); if (q) q.kind = 'calc'; }
    else if (k === 'moment') { if (Number.isFinite(L.mean(P)) && Number.isFinite(L.variance(P))) { q = qMoment(L, P); q.kind = 'moment'; } }
    else if (k === 'formula') { q = qFormula(L, all); q.kind = 'formula'; }
    else if (k === 'scenario') { q = qScenario(L, all); q.kind = 'scenario'; }
    else if (k === 'application') { q = qApplication(L, all); q.kind = 'application'; }
    else if (k === 'concept') { const items = CONCEPTS.filter(c => c.law === L.id); if (items.length) { q = qConcept(pick(items)); q.kind = 'concept'; } else { kind = 'mix'; } }
  }
  if (!q) return null;
  q.law = L.id; return q;
}
function buildQuiz(laws, kind, n, all) {
  const out = [], seen = new Set(); let guard = 0;
  while (out.length < n && guard++ < n * 20) {
    const L = laws[Math.floor(Math.random() * laws.length)];
    const q = genQuestion(L, kind, all); if (!q) continue;
    if (seen.has(q.html)) continue; seen.add(q.html); out.push(q);
  }
  return out;
}
function weightedLaws(all, stats) {
  const w = all.map(L => { const s = stats[L.id] || { tries: 0, ok: 0 }; const rate = (s.ok + 1) / (s.tries + 2); return 1.6 - rate; });
  const pool = []; all.forEach((L, i) => { const copies = Math.round(w[i] * 4); for (let j = 0; j < copies; j++) pool.push(L); });
  return pool.length ? pool : all;
}

// ====================================================================
// Comparaison de deux lois
// ====================================================================
function lawEval(L, P) {
  if (isCont(L)) return { c: true, L, P };
  const T = table(L, P); return { c: false, L, P, T };
}
function cdfOfEval(e, x) {
  if (e.c) return e.L.cdf(x, e.P);
  const T = e.T; if (x < T.ks[0]) return 0;
  const i = Math.floor(x) - T.ks[0]; return i >= T.ks.length - 1 ? 1 : T.cs[i];
}
function summaryLaw(L, P) {
  if (isCont(L)) {
    const med = L.median ? L.median(P) : quantile(L, P, 0.5);
    const mo = L.mode(P);
    return { mean: L.mean(P), variance: L.variance(P), sd: Math.sqrt(L.variance(P)), median: med, mode: typeof mo === 'number' ? mo : NaN, modeTxt: typeof mo === 'number' ? null : mo, skew: L.skew(P), kurt: L.kurt(P) };
  }
  const T = table(L, P), S = stats(L, P, T);
  return { mean: S.mean, variance: S.variance, sd: S.sd, median: S.median, mode: S.modes[0], modeTxt: S.modes.length > 1 && S.modes.length === T.ks.length ? tl('toutes les valeurs') : (S.modes.length > 1 ? S.modes.join(' et ') : null), skew: S.skew, kurt: S.kurt };
}
function compareDistances(eA, eB, lo, hi) {
  const xs = []; for (let j = 0; j <= 600; j++) xs.push(lo + (hi - lo) * j / 600);
  for (const e of [eA, eB]) if (!e.c) for (const k of e.T.ks) { if (k >= lo && k <= hi) { xs.push(k); xs.push(k - 1e-9); } }
  let ks = 0; for (const x of xs) ks = Math.max(ks, Math.abs(cdfOfEval(eA, x) - cdfOfEval(eB, x)));
  let tv = null;
  if (!eA.c && !eB.c) {
    const lo2 = Math.min(eA.T.ks[0], eB.T.ks[0]); const hi2 = Math.max(eA.T.ks[eA.T.ks.length - 1], eB.T.ks[eB.T.ks.length - 1]);
    tv = 0; for (let k = lo2; k <= hi2; k++) tv += Math.abs(eA.L.pmf(k, eA.P) - eB.L.pmf(k, eB.P)); tv /= 2;
  }
  return { ks, tv };
}
const COMPARE_PRESETS = [
  { label: 'Binomiale ≈ Poisson', A: ['binomial', { n: 100, p: 0.03 }], B: ['poisson', { lambda: 3 }], note: tl('Avec <var>n</var> = 100 grand et <var>p</var> = 0,03 petit, 𝓑(100 ; 0,03) est presque confondue avec 𝓟(np) = 𝓟(3). C\'est l\'approximation des événements rares.') },
  { label: 'Binomiale ≈ Normale', A: ['binomial', { n: 40, p: 0.5 }], B: ['normal', { mu: 20, sigma: 3.162 }], note: tl('Quand <var>np</var> et <var>n</var>(1 − <var>p</var>) sont grands, 𝓑(<var>n</var> ; <var>p</var>) ressemble à 𝓝(<var>np</var> ; <var>np</var>(1 − <var>p</var>)). Ici la moyenne est 20 et la variance 10.') },
  { label: tl('Hypergéométrique ≈ Binomiale'), A: ['hypergeometric', { N: 200, K: 40, n: 10 }], B: ['binomial', { n: 10, p: 0.2 }], note: tl('Avec un échantillon (10) petit devant la population (200), tirer sans remise ou avec remise donne presque la même loi.') },
  { label: 'Poisson ≈ Normale', A: ['poisson', { lambda: 25 }], B: ['normal', { mu: 25, sigma: 5 }], note: tl('Pour λ grand, 𝓟(λ) est proche de 𝓝(λ ; λ). Ici la moyenne et la variance valent 25.') },
  { label: 'Student → Normale', A: ['student', { k: 3 }], B: ['normal', { mu: 0, sigma: 1 }], note: tl('Avec 3 degrés de liberté, les queues de Student sont bien plus épaisses que celles de 𝓝(0 ; 1). Augmentez <var>k</var> : l\'écart disparaît.') },
  { label: 'Gamma → Normale', A: ['gamma', { k: 30, lambda: 1 }], B: ['normal', { mu: 30, sigma: 5.477 }], note: tl('Quand le paramètre de forme <var>k</var> est grand, Γ(<var>k</var> ; λ) devient presque normale (moyenne 30, variance 30).') },
  { label: tl('Géométrique ~ Exponentielle'), A: ['geometric', { p: 0.1 }], B: ['exponential', { lambda: 0.1054 }], note: tl('La loi exponentielle est l\'analogue continu de la loi géométrique : les deux sont sans mémoire. Avec λ = −ln(1 − <var>p</var>), leurs fonctions de répartition coïncident aux entiers.') },
  { label: tl('Uniforme discrète ~ continue'), A: ['uniform', { a: 1, b: 6 }], B: ['cuniform', { a: 0.5, b: 6.5 }], note: tl('Le dé à 6 faces (𝓤{1,…,6}) et la loi uniforme continue sur [0,5 ; 6,5] ont la même moyenne et presque la même variance.') }
];

// ====================================================================
// Ajustement d'une loi à des données
// ====================================================================
function parseData(text) {
  const t = String(text || '').trim();
  if (!t) return { err: tl('Collez ou saisissez des valeurs.') };
  let tokens;
  if (/[;\s]/.test(t)) tokens = t.split(/[;\s]+/).map(s => s.replace(/,+$/, '').replace(',', '.')).filter(s => s !== '');
  else tokens = t.split(',').map(s => s.trim()).filter(s => s !== '');
  let skipped = 0;
  if (tokens.length && !Number.isFinite(Number(tokens[0]))) { tokens.shift(); skipped++; }
  const data = [];
  for (const s of tokens) { const x = Number(s); if (!Number.isFinite(x)) return { err: tlx`Valeur non numérique : « ${s.slice(0, 20)} ». Séparez les nombres par des espaces, des retours à la ligne ou des points-virgules.` }; data.push(x); }
  if (data.length > 200000) return { err: tl('Trop de valeurs (maximum 200 000).') };
  if (data.length < 5) return { err: tl('Il faut au moins 5 valeurs pour ajuster une loi.') };
  return { data, skipped };
}
function describe(data) {
  const n = data.length, s = data.slice().sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / n;
  const v = s.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1), sd = Math.sqrt(v);
  const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const m3 = s.reduce((a, b) => a + (b - mean) ** 3, 0) / n, skew = sd > 0 ? m3 / (Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / n) ** 3) : NaN;
  return { n, mean, variance: v, sd, min: s[0], max: s[n - 1], median: med, skew, sorted: s };
}
function isIntegerData(d) { return d.sorted.every(Number.isInteger) && d.max - d.min <= 400; }

function digamma(x) { let r = 0; while (x < 6) { r -= 1 / x; x++; } const f = 1 / (x * x); return r + Math.log(x) - 0.5 / x - f * (1 / 12 - f * (1 / 120 - f * (1 / 252))); }
function trigamma(x) { let r = 0; while (x < 6) { r += 1 / (x * x); x++; } const f = 1 / (x * x); return r + 1 / x + f / 2 + f / x * (1 / 6 - f * (1 / 30 - f / 42)); }

function chiSquareGOF(counts, expected, nParams) {
  // regroupe les classes de gauche à droite jusqu'à une espérance ≥ 5
  const bins = []; let o = 0, e = 0;
  for (let i = 0; i < expected.length; i++) { o += counts[i]; e += expected[i]; if (e >= 5) { bins.push([o, e]); o = 0; e = 0; } }
  if (e > 0 || o > 0) { if (bins.length) { bins[bins.length - 1][0] += o; bins[bins.length - 1][1] += e; } else bins.push([o, e]); }
  const stat = bins.reduce((a, [ob, ex]) => a + (ob - ex) ** 2 / ex, 0), df = bins.length - 1 - nParams;
  return { stat, df, p: df >= 1 ? Math.max(0, Math.min(1, 1 - gammaP(df / 2, stat / 2))) : NaN, bins: bins.length, name: 'Khi-deux' };
}
function ksTest(sorted, cdf) {
  const n = sorted.length; let D = 0;
  for (let i = 0; i < n; i++) { const F = cdf(sorted[i]); D = Math.max(D, (i + 1) / n - F, F - i / n); }
  const lam = (Math.sqrt(n) + 0.12 + 0.11 / Math.sqrt(n)) * D; let p = 0;
  for (let j = 1; j <= 100; j++) p += 2 * (j % 2 ? 1 : -1) * Math.exp(-2 * j * j * lam * lam);
  return { stat: D, df: null, p: Math.max(0, Math.min(1, p)), name: 'Kolmogorov-Smirnov' };
}

function fitDiscrete(d) {
  const { n, mean: m, variance: v, min: mn, max: mx, sorted } = d; const out = [];
  const counts = new Map(); sorted.forEach(x => counts.set(x, (counts.get(x) || 0) + 1));
  const add = (id, raw, k, note) => {
    const L = getLaw(id); let ll = 0;
    for (const x of sorted) { const p = L.pmf(x, raw); if (!(p > 0)) { ll = -Infinity; break; } ll += Math.log(p); }
    if (!Number.isFinite(ll)) return;
    const s = L.support(raw); const hiK = Number.isFinite(s.max) ? s.max : Math.max(mx, Math.ceil(m + 8 * Math.sqrt(Math.max(v, 1))) + 5);
    const exp = [], obs = []; let cum = 0;
    for (let k = s.min; k <= hiK; k++) { const p = L.pmf(k, raw); cum += p; exp.push(n * p); obs.push(counts.get(k) || 0); }
    if (!Number.isFinite(s.max)) exp[exp.length - 1] += n * Math.max(0, 1 - cum);
    for (const [x, c] of counts) if (x > hiK) obs[obs.length - 1] += c;
    out.push({ id, raw, k, ll, aic: 2 * k - 2 * ll, note, test: chiSquareGOF(obs, exp, k) });
  };
  if (sorted.every(x => x === 0 || x === 1) && m > 0 && m < 1) add('bernoulli', { p: m }, 1);
  if (mx >= 2 && m > 0 && v < m && mn >= 0) { const p0 = 1 - v / m; const nn = Math.max(mx, Math.round(m / p0)); add('binomial', { n: nn, p: m / nn }, 2, tl('n estimé par la méthode des moments')); }
  if (mn >= 0 && m > 0) add('poisson', { lambda: m }, 1);
  if (mn >= 1) add('geometric', { p: Math.min(1, 1 / m) }, 1);
  if (mn >= 2 && v > m) { const p0 = m / (m + v); const r = Math.max(2, Math.round(m * p0)); if (mn >= r) add('pascal', { r, p: Math.min(1, r / m) }, 2, tl('r estimé par la méthode des moments')); }
  if (mx > mn) add('uniform', { a: mn, b: mx }, 2);
  return out;
}
function fitContinuous(d) {
  const { n, mean: m, variance: v, min: mn, max: mx, sorted } = d; const out = [];
  const add = (id, raw, k, note) => {
    const L = getLaw(id); let ll = 0;
    for (const x of sorted) { const f = L.pdf(x, raw); if (!(f > 0) || !Number.isFinite(f)) { ll = -Infinity; break; } ll += Math.log(f); }
    if (!Number.isFinite(ll)) return;
    out.push({ id, raw, k, ll, aic: 2 * k - 2 * ll, note, test: ksTest(sorted, x => L.cdf(x, raw)) });
  };
  const mle = Math.sqrt(v * (n - 1) / n);
  if (mle > 0) add('normal', { mu: m, sigma: mle }, 2);
  if (mn > 0) {
    const ly = sorted.map(Math.log), my = ly.reduce((a, b) => a + b, 0) / n, sy = Math.sqrt(ly.reduce((a, b) => a + (b - my) ** 2, 0) / n);
    if (sy > 0) add('lognormal', { mu: my, sigma: sy }, 2);
    const s = Math.log(m) - my;
    if (s > 0) { let k = (3 - s + Math.sqrt((s - 3) ** 2 + 24 * s)) / (12 * s); for (let i = 0; i < 6; i++) k -= (Math.log(k) - digamma(k) - s) / (1 / k - trigamma(k)); if (k > 0 && Number.isFinite(k)) add('gamma', { k, lambda: k / m }, 2, tl('maximum de vraisemblance')); }
  }
  if (mn >= 0 && m > 0) { add('exponential', { lambda: 1 / m }, 1); const k = Math.max(1, Math.round(m)); add('chi2', { k }, 1, tl('degrés de liberté arrondis à l\'entier le plus proche de la moyenne')); }
  if (mn > 0 && mx < 1) { const c = m * (1 - m) / v - 1; if (c > 0) add('beta', { alpha: m * c, beta: (1 - m) * c }, 2, tl('méthode des moments')); }
  if (mx > mn) add('cuniform', { a: mn, b: mx }, 2);
  return out;
}
function fitAll(data, force) {
  const d = describe(data);
  const discrete = force === 'discrete' ? true : force === 'continuous' ? false : isIntegerData(d);
  let cands = discrete ? fitDiscrete(d) : fitContinuous(d);
  cands.sort((a, b) => a.aic - b.aic);
  if (cands.length) { const best = cands[0].aic; const w = cands.map(c => Math.exp(-(c.aic - best) / 2)), S = w.reduce((a, b) => a + b, 0); cands.forEach((c, i) => { c.delta = c.aic - best; c.weight = w[i] / S; }); }
  return { d, discrete, cands };
}
const FIT_EXAMPLES = [
  { id: 'poisson', label: tl('Appels reçus par minute (100 minutes)'), seed: 41, gen: () => getLaw('poisson').sample({ lambda: 3.2 }, null) },
  { id: 'binomial', label: tl('Pièces défectueuses sur 20 contrôlées (80 lots)'), seed: 61, gen: () => getLaw('binomial').sample({ n: 20, p: 0.08 }, null) },
  { id: 'exponential', label: tl('Durées d\'attente en minutes (60 clients)'), seed: 21, gen: () => +getLaw('exponential').sample({ lambda: 0.4 }, null).toFixed(2), n: 60 },
  { id: 'normal', label: tl('Tailles en cm de 150 adultes'), seed: 41, gen: () => +getLaw('normal').sample({ mu: 170, sigma: 8 }, null).toFixed(1), n: 150 },
  { id: 'lognormal', label: tl('Revenus mensuels en milliers d\'euros (120 foyers)'), seed: 41, gen: () => +getLaw('lognormal').sample({ mu: 0.9, sigma: 0.45 }, null).toFixed(2), n: 120 }
];
function exampleData(ex) { return withSeed(ex.seed, () => Array.from({ length: ex.n || (ex.id === 'poisson' ? 100 : 80) }, ex.gen)); }


// ---------- Traduction de la page statique et des données ----------
const INLINE_TAGS = new Set(['VAR', 'SPAN', 'B', 'SUP', 'SUB', 'I', 'SMALL', 'BR', 'EM', 'CODE']);
const IS_ID = s => /^[a-z0-9_]+$/.test(s);
const HAS_WORD = s => /[A-Za-zÀ-ÿ]{3}/.test(s.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' '));
function staticKeys(apply) {
  const keys = [];
  const attr = (el, a) => { const v = el.getAttribute(a); if (v && HAS_WORD(v)) { keys.push(v); if (apply && TR[v] !== undefined) el.setAttribute(a, TR[v]); } };
  document.querySelectorAll('body *').forEach(el => {
    if (!el.isConnected || el.closest('svg, script, style, .lang') || el.parentElement.closest('[data-i18n]')) return;
    ['placeholder', 'aria-label', 'title', 'label'].forEach(a => { if (el.hasAttribute(a)) attr(el, a); });
    if (el.children.length && ![...el.children].every(c => INLINE_TAGS.has(c.tagName))) return;
    const raw = el.innerHTML.replace(/\s+/g, ' ').trim();
    if (!raw || !HAS_WORD(raw)) return;
    keys.push(raw); el.setAttribute('data-i18n', ''); if (apply && TR[raw] !== undefined) el.innerHTML = TR[raw];
  });
  const mt = document.querySelector('meta[name=description]'); if (mt) { keys.push(mt.content); if (apply && TR[mt.content] !== undefined) mt.content = TR[mt.content]; }
  keys.push(document.title); if (apply && TR[document.title] !== undefined) document.title = TR[document.title];
  return keys;
}
function dataWalk(fn) {
  const seen = new Set();
  const walk = o => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { const r = fn(v); if (r !== undefined) o[k] = r; } else if (typeof v === 'object') walk(v); } };
  [LAWS, USAGES, SCEN, CONCEPTS, COMPARE_PRESETS, FIT_EXAMPLES, QUIZ_KINDS].forEach(walk);
}
function dataKeys() { const k = []; dataWalk(v => { if (HAS_WORD(v) && !IS_ID(v)) k.push(v); }); return k; }
if (typeof document === 'undefined') { /* tests Node */ } else {
if (window.__collect) window.__sk = staticKeys(false);
if (LANG !== 'fr') { dataWalk(v => (IS_ID(v) ? undefined : TR[v])); staticKeys(true); }
}

// ---------- Rendu de la section « Applications concrètes » ----------
function renderUsage(L) {
  const el = document.querySelector('#usage'); if (!el) return;
  const U = USAGES[L.id]; if (!U) { el.innerHTML = ''; return; }
  const ex = (L.examples || []).slice(0, 2).map(e => e.title).join(' · ');
  const cap = s => s.replace(/^./, c => c.toUpperCase());
  el.innerHTML = `<div class="usage-problem"><h3>${tl('Le problème que résout cette loi')}</h3><p>${U.problem}</p></div>
    <div class="usage-sectors">${U.sectors.map(s => `<div class="sector"><h4>${s.s}</h4><p>${cap(s.t)}</p></div>`).join('')}</div>
    <p class="usage-limit"><b>${tl('Limites :')}</b> ${U.limit}</p>
    ${ex ? `<p class="note">${tlx`Voir aussi, plus bas : les exemples chiffrés (${ex}).`}</p>` : ''}`;
}

