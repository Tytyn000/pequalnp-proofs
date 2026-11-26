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
