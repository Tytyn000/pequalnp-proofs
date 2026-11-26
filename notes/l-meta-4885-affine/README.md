# L-meta-4885 · Sous-problème affine

La [réduction étudiée dans la PR nº 10128](https://github.com/open-goat/pequalnp-proofs/pull/10128) conduit à la fonction d’incidence du plan affine d’ordre 3. Le sous-problème porte sur 21 entrées, 36 incidences et des portes ET et OU binaires. Le meilleur circuit exact connu ici a 44 portes. L’existence d’un circuit exact à 43 portes reste ouverte.

La fonction est vraie si les entrées actives contiennent une arête d’incidence. Pour vérifier un circuit monotone, il suffit donc de vérifier les 36 arêtes minimales et les 197 ensembles indépendants maximaux. Le script `verifier-temoin.cjs` vérifie aussi le témoin à 44 portes sur les 2 097 152 entrées sans utiliser cette réduction.

## Évaluation limitée à un ET

On associe deux valeurs à chaque fil. Dans la première évaluation, on remplace tous les ET par zéro. Dans la seconde, un ET lit les premières valeurs de ses opérandes et un OU lit leurs secondes valeurs. Une arête minimale acceptée par la seconde évaluation a une dérivation qui rencontre au plus un ET sur chaque chemin. Appelons m le nombre de telles arêtes.

On remonte de la sortie à travers les seuls OU. Les ET atteints ainsi sont appelés exposés. Sur un circuit exact, leurs sorties sont des sous-fonctions de l’incidence et rejettent tous les singletons. Un ET exposé contribue à l’évaluation limitée quand les deux disjonctions obtenues en remplaçant les ET en amont par zéro ont chacune un support non vide. Les supports sont disjoints et forment un biclique du graphe affine. Il n’y a pas de cycle de longueur quatre, donc au moins un côté est un singleton. Son sommet est le centre du terme.

Soit t le nombre de ces ET productifs. Chaque terme couvre au plus quatre arêtes, donc t ≥ ⌈m/4⌉. Pour un même centre, supposons que t_x termes couvrent k_x voisins distincts. En partant de leurs opérandes de voisins, on remonte à travers les OU dont la première valeur accepte au moins deux singletons. Avec q portes et au plus t_x racines, on visite au plus 2q + t_x fils, dont au moins k_x terminaux distincts en plus des q portes. Donc q ≥ k_x − t_x. Deux centres ne peuvent partager une porte comptée de cette façon, car ils auraient deux voisins communs. Ces OU sont distincts des OU exposés, dont le support est vide. Compter les t portes productives et au moins t − 1 OU exposés donne au moins m + t − 1 portes en tout.
## Au moins trois arêtes nécessitent deux ET

On reprend les notations m et t du comptage précédent. Pour chaque fil, son support désigne ici l’ensemble des singletons acceptés après remplacement de tous les ET par zéro. Une porte est exposée si elle atteint la sortie par des OU seulement, sans compter la porte elle-même. Notons h le nombre d’ET non exposés qui appartiennent au cône de sortie.

Si m < 36, fixons une arête non acceptée par l’évaluation limitée à un ET. Le premier ET vrai dans le cône de sortie est nécessairement non exposé. Ses opérandes ont la même valeur lorsque tous les ET antérieurs sont forcés à zéro, donc s’il était exposé l’arête serait acceptée sous la limite d’un ET. Ainsi h ≥ 1. Il faut également compter une porte supplémentaire, ou augmenter d’une unité le comptage des OU d’un centre.

En effet, considérons le premier ET exposé E vrai sur cette arête. Il existe puisque la sortie accepte l’arête, et qu’une entrée primaire reliée à la sortie uniquement par des OU ferait accepter un singleton. Si E n’est pas productif dans l’évaluation limitée, c’est la porte supplémentaire, distincte des h ET non exposés. Sinon, ses deux opérandes sont vrais sur l’arête et au moins l’un des deux est faux après remplacement de tous les ET par zéro. En remontant de cet opérande à travers des OU vrais, on rencontre un ET vrai G. Aucun terminal primaire ne peut expliquer la valeur sur ce chemin, car l’opérande serait alors vrai même en forçant les ET à zéro. G est antérieur à E et non exposé, par le choix de E.

Si un OU intermédiaire sur ce chemin est extérieur au comptage précédent, c’est la porte supplémentaire. Dans le cas contraire, chaque OU intermédiaire est compté dans les disjonctions de voisins, car aucun ne peut être exposé sans exposer G. Ces OU ont donc chacun un support d’au moins deux singletons. Il y a au moins un OU intermédiaire puisque l’opérande choisi de E a un support non vide et que G a un support vide. Cet opérande est celui des voisins, car l’autre côté a un support singleton. Le parcours de ses OU jusqu’à G fait donc partie du comptage associé au centre de E. Le fil G, de support vide, y ajoute un terminal distinct des k_x terminaux qui fournissent les voisins. Pour ce centre, on obtient q ≥ k_x + 1 − t_x.

Le total est donc au moins m + t + h dès que m < 36. Si m vaut 34 ou 35, ce total est au moins 34 + 9 + 1 = 44. Si m vaut 36, le comptage précédent donne aussi 44. Tout circuit exact à 43 portes doit donc avoir au moins trois arêtes qui nécessitent deux ET sur un chemin.

Si m = 33 avec 43 portes, on obtient t = 9 et h = 1. Le comptage initial mobilise au moins 41 portes, auxquelles s’ajoute l’ET non exposé. Il reste au plus une porte pour un éventuel ET exposé non productif. En particulier, un circuit de taille 43 dont toutes les portes sont vivantes et dont exactement trois arêtes nécessitent deux ET a 10 ou 11 ET au total.

Les neuf centres sont distincts, car huit centres couvrent au plus 32 arêtes. Au plus un de ces centres est un point. En effet, avec r centres points on laisse r droites sans centre. Leurs 4r arêtes peuvent être couvertes uniquement par ces r points, qui ont chacun degré trois. Avec au plus trois arêtes non couvertes, cela donne r ≤ 3. Pour r = 2, les deux points ne peuvent couvrir que trois des huit arêtes des deux droites sans centre, sinon ils auraient deux droites communes. Pour r = 3, couvrir au moins neuf arêtes sur les trois droites sans centre imposerait que les trois points soient incidents à chacune de ces droites, ce qui est également impossible.

`AFFINE_MIN_DEEP_EDGES=3` impose trois arêtes distinctes rejetées par l’évaluation limitée. En ajoutant `AFFINE_DEPTH_EQUALITY=1`, on impose exactement ces trois rejets, un seul ET non exposé et au plus 11 ET. La seconde recherche exige que toutes les portes appartiennent au cône de sortie.

    AFFINE_MIN_DEEP_EDGES=3 node frontiere.cjs build affine43-trois-profondes-global.cnf 43 197 ordered
    AFFINE_MIN_DEEP_EDGES=3 AFFINE_EDIT_BASE=reparation-affine-43.json AFFINE_EDIT_BUDGET=3 node frontiere.cjs build affine43-trois-profondes-proche.cnf 43 197 plain
    AFFINE_MIN_DEEP_EDGES=3 AFFINE_EDIT_BASE=reparation-affine-43-structure.json AFFINE_EDIT_BUDGET=4 node frontiere.cjs build affine43-trois-profondes-structure.cnf 43 197 plain
    AFFINE_MIN_DEEP_EDGES=3 AFFINE_DEPTH_EQUALITY=1 node frontiere.cjs build affine43-egalite-profondeur.cnf 43 197 ordered

Kissat a donné UNKNOWN pour les quatre recherches. Les trois premières ont eu chacune 65 secondes, et le cas d’égalité 75 secondes. Ces essais ne tranchent pas l’existence d’un circuit à 43 portes.

### Vérifier et reproduire

Depuis ce dossier, avec Node.js et Kissat 4.0.4 :

```sh
node verifier-temoin.cjs
node profil-profondeur-affine.cjs witness-affine-44-complet.json reparation-affine-43.json reparation-affine-43-structure.json
kissat --time=65 affine43-trois-profondes-global.cnf
kissat --time=65 affine43-trois-profondes-proche.cnf
kissat --time=65 affine43-trois-profondes-structure.cnf
kissat --time=75 affine43-egalite-profondeur.cnf
```

Les commandes `kissat` utilisent les CNF générés juste au-dessus. Les candidats locaux à 43 portes sont les points de départ des recherches par distance de réécriture. Ils ont respectivement une et deux arêtes minimales manquantes.

## Répartition des trois arêtes profondes

Dans le cas d’égalité (43 portes et m = 33), les trois arêtes rejetées par l’évaluation limitée se répartissent sur au moins deux droites. Les neuf centres productifs sont alors les neuf droites.

Soit U l’ensemble des portes déjà comptées dans la borne m + t − 1. Il contient les ET productifs, les OU exposés et les OU traversés dans les disjonctions de voisins. On a |U| ≥ 41. L’unique ET non exposé G est hors de U. Il reste donc au plus une autre porte hors de U dans le cône de sortie.

Supposons que les trois arêtes profondes relient une même droite L à trois points distincts Q. Aucun point de Q n’est centre. En effet, s’il existe un centre point p, il n’y en a qu’un, et il y a exactement une droite sans centre. Au moins trois arêtes de cette droite sont profondes, puisque seul p peut y fournir une arête par un ET productif. Cette droite est donc L, et sa quatrième arête, celle qui la relie à p, est acceptée par l’évaluation limitée.

**Le support de tout fil vivant contient au plus un point de Q.** C’est immédiat pour les entrées primaires, les ET et les OU exposés. Pour un OU de voisins compté dans U, un centre point n’a que des droites pour voisins. Un centre droite différent de L ne rencontre L qu’en un point au plus. Un OU de voisins centré sur L ne peut contenir aucun des points Q, puisque l’arête correspondante serait alors acceptée par l’évaluation limitée.

Pour examiner une éventuelle porte restante hors de U et différente de G, reprenons le chemin jusqu’au premier ET exposé E vrai sur une arête profonde. Si E est non productif, c’est cette porte restante et son support est vide. Sinon, on remonte d’un opérande de E faux après remplacement des ET par zéro jusqu’à G en suivant uniquement des OU. Si tous ces OU sont comptés dans U, le terminal vide supplémentaire du comptage précédent donne |U| ≥ 42 et il ne reste aucune porte. S’il existe un OU hors de U sur ce chemin, il est unique et son support contient au plus un singleton. En effet, pour un opérande de centre, tous les supports en amont sur le chemin sont inclus dans le support singleton de cet opérande. Pour un opérande de voisins, le premier OU hors de U rencontré en remontant doit avoir un support de taille au plus un, puisque le parcours de comptage inclut tout OU de support de taille au moins deux tant qu’il ne s’est pas arrêté. Cela termine la preuve de la propriété des supports.

Pour chaque arête entre L et un point q de Q, le premier ET vrai dans le cône de sortie est G. Chacun de ses deux opérandes est donc vrai sur cette arête même en forçant les ET précédents à zéro. Un support qui intersecte chacune des trois paires {L, q} et contient au plus un point de Q doit contenir L. Les deux supports contiennent donc L, et G est vrai sur le singleton L.

Sur chaque paire {L, q}, considérons de nouveau le premier ET exposé E qui est vrai. Au moins un opérande de E est faux sur le singleton L, puisque E est exposé et que la sortie rejette ce singleton. Cet opérande est vrai sur la paire. En remontant à travers des OU, sa valeur vraie ne peut provenir ni de G ni de l’entrée L, qui sont tous deux vrais sur le singleton L. Elle ne peut provenir d’un ET exposé antérieur, qui est faux sur la paire. Elle provient donc de l’entrée q, et le support de cet opérande contient q.

- Si E est non productif, il est la seule porte hors de U autre que G. Seul son opérande de support non vide peut fournir le point q. Il en fournit au plus un.
- Si E est productif, son centre ne peut être L. Dans ce cas, son opérande de centre serait vrai sur le singleton L et l’autre opérande aurait q dans son support, ce qui ferait accepter l’arête par l’évaluation limitée. Comme son centre n’appartient pas non plus à Q, son opérande de centre vaut zéro après remplacement des ET par zéro sur la paire. Cet opérande est donc vrai par un chemin de OU depuis G. Il s’agit d’un OU de support singleton hors de U. Il est unique et ne peut servir d’opérande de centre à deux ET productifs, dont les centres sont distincts. Vrai sur le singleton L, il oblige l’opérande de voisins à fournir q. Cet opérande peut fournir au plus un point de Q.

Ces deux possibilités utilisent chacune la seule place hors de U qui reste après avoir compté G. Elles sont incompatibles entre elles, et chacune permet au plus une arête profonde sur L, ce qui contredit l’hypothèse des trois arêtes.

Si un centre était un point, les trois arêtes profondes seraient sur la droite sans centre, ce qui vient d’être exclu. Les neuf centres sont donc des droites. Au moins huit des neuf ET productifs lisent directement leur entrée de centre, car tout opérande de centre calculé est un OU de support singleton hors de U et il y a au plus une telle porte.

### Recherches SAT séparées

Les deux modes ci-dessous séparent les arêtes profondes selon qu’elles occupent deux ou trois droites. Chacun impose aussi qu’au moins huit entrées de droites alimentent directement des ET exposés.

```sh
for pattern in two-plus-one distinct; do
  AFFINE_MIN_DEEP_EDGES=3 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEEP_LINE_PATTERN="$pattern" \
    node frontiere.cjs build "affine43-egalite-$pattern.cnf" 43 197 ordered
  kissat --time=50 "affine43-egalite-$pattern.cnf"
done
```

Les deux essais ont donné UNKNOWN après 50 secondes de calcul chacun. Ils couvrent le cas où exactement trois arêtes sont profondes. Les circuits qui en ont davantage ne sont pas soumis à cette partition.
