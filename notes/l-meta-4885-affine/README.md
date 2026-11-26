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

## Au moins quatre arêtes nécessitent deux ET

On exclut entièrement m = 33 pour un circuit exact à 43 portes. Supposons le contraire. Par les résultats précédents, les neuf ET productifs ont les neuf droites comme centres, les trois arêtes profondes occupent au moins deux droites, G est l’unique ET interne et |U| ≥ 41.

Pour chacune des arêtes profondes, on choisit le premier ET exposé E qui y est vrai. Si E est productif, au moins un de ses opérandes est faux lorsque tous les ET sont forcés à zéro. Sa valeur vraie provient donc de G par un chemin de OU, puisque les ET exposés antérieurs sont faux sur cette arête. Si tous les OU de ce chemin appartiennent à U, le calcul du nombre de OU de voisins pour le centre de E gagne une unité grâce au terminal vide G. Deux centres distincts apporteraient deux unités distinctes, car leurs OU comptés sont disjoints.

Si |U| ≥ 42, toutes les portes vivantes sont dans U ou égales à G. Tous les E choisis sont alors productifs et reçoivent G par des OU de U. Le cas de deux centres distincts donnerait |U| ≥ 43, puis au moins 44 portes en comptant G. Un seul centre est également impossible, car son opérande de centre est son entrée primaire de droite, et les trois arêtes profondes occupent plusieurs droites.

Il reste |U| = 41. Il y a une porte supplémentaire S dans le cône de sortie. En effet, sans elle, l’un des chemins précédents ferait passer |U| à 42. Pour chaque arête profonde, soit E est S et est non productif, soit E est productif et le chemin de OU depuis G jusqu’à l’opérande de E traverse S. Un chemin productif qui évite S donnerait |U| ≥ 42. En particulier, S est en aval de G. On utilisera aussi le fait qu’un OU compté dans U et non exposé ne peut lire directement G. Un tel OU est compté dans les voisins d’un centre, et son entrée G y serait un terminal vide supplémentaire, ce qui donnerait encore |U| ≥ 42.

Tout fil en amont de G a un support composé uniquement de points ou égal à un singleton droite. Les seules portes de support non vide possibles en amont sont les OU de voisins comptés dans U, dont les centres sont des droites. G est le premier ET vrai sur chacune des trois arêtes profondes. Si l’un de ses opérandes avait un support singleton droite, G ne pourrait être le premier ET vrai que sur les arêtes de cette droite. Les deux supports sont donc composés de points. Pour chaque arête profonde, son point q doit appartenir aux deux supports. **G est donc vrai sur le singleton q pour chacun des points des arêtes profondes.**

Si S est un ET exposé non productif, il est choisi comme E pour les trois arêtes. Pour chacune, au moins un de ses opérandes est vrai via G par un chemin de OU, puisque l’évaluation limitée échoue. Ce chemin est direct, car le premier OU qui lirait G serait compté dans U. L’autre opérande ne peut également être G, car l’ET exposé serait alors vrai sur un singleton q. Sur chaque arête profonde, cet autre opérande a la valeur déterminée par son support, car il ne peut recevoir G par un chemin de OU et aucun ET exposé antérieur n’est vrai. Un support composé de points le rendrait vrai sur le singleton q, ce qui ferait accepter ce singleton par S. Un support singleton droite obligerait les trois arêtes profondes à appartenir à la même droite. Les deux possibilités sont exclues.

Si S est un OU, son support contient au plus un singleton. Pour un chemin vers un opérande de centre, cela découle de l’inclusion des supports le long du chemin. Pour un chemin vers un opérande de voisins, le parcours de comptage inclurait S s’il avait un support d’au moins deux singletons, car tous les OU situés après S sur ce chemin sont comptés et ont donc un support d’au moins deux singletons. Le support de S ne peut pas être vide. En effet, l’opérande de centre ou de voisins a un support non vide. Si S avait un support vide, il faudrait au moins un OU après S sur le chemin vers cet opérande. Ces OU seraient tous comptés dans U, donc le chemin aboutirait à un opérande de voisins et S serait un terminal vide supplémentaire de son parcours de comptage.

- Si S a pour support une droite, il ne peut alimenter qu’un opérande de centre, car les voisins ont des supports constitués de points. Soit E un ET choisi sur une arête profonde. L’opérande de voisins ne peut recevoir G via S, puisqu’il contiendrait alors la droite du support de S. Il ne peut recevoir G en le contournant, car un OU compté ne peut lire directement G, et l’opérande de voisins de E a un support non vide. L’opérande de voisins est donc vrai grâce à l’entrée q sur cette arête. Sur le singleton q, G rend l’opérande de centre vrai et l’entrée q rend l’opérande de voisins vrai. Cela ferait accepter un singleton.
- Si S a pour support un point p, chaque ET choisi sur une arête profonde reçoit S par son opérande de voisins. Son opérande de centre est l’entrée primaire de sa droite L. Toutes les droites ainsi utilisées contiennent p, car p appartient à chacun des supports de voisins correspondants. Elles sont au moins deux, puisque les arêtes profondes occupent plusieurs droites. Pour chaque point q d’une arête profonde, G est vrai sur le singleton q et rend vrai l’opérande de voisins de tous ces ET. L’exactitude du circuit impose que q appartienne à toutes ces droites, car elles acceptent chacune la paire {L, q}. Or q est distinct de p, puisque l’arête entre p et sa propre droite aurait été acceptée par l’évaluation limitée. Deux droites distinctes auraient donc deux points communs.

Tous les cas sont exclus. Un circuit exact à 43 portes doit avoir au moins quatre arêtes profondes.

```sh
AFFINE_MIN_DEEP_EDGES=4 node frontiere.cjs build affine43-quatre-profondes-global.cnf 43 197 ordered
AFFINE_MIN_DEEP_EDGES=4 AFFINE_EDIT_BASE=reparation-affine-43.json AFFINE_EDIT_BUDGET=3 node frontiere.cjs build affine43-quatre-profondes-proche.cnf 43 197 plain
AFFINE_MIN_DEEP_EDGES=4 AFFINE_EDIT_BASE=reparation-affine-43-structure.json AFFINE_EDIT_BUDGET=4 node frontiere.cjs build affine43-quatre-profondes-structure.cnf 43 197 plain
for case in global proche structure; do
  kissat --time=55 "affine43-quatre-profondes-$case.cnf"
done
```

Les trois essais ont donné UNKNOWN après 55 secondes chacun. L’existence d’un circuit à 43 portes reste ouverte. Les recherches de la section précédente sur exactement trois arêtes profondes sont conservées pour reproduire les essais antérieurs.

## Cas de quatre arêtes profondes

Avec exactement quatre arêtes profondes, m = 32. La borne m + t + h ≤ 43, avec t ≥ 8 et h ≥ 1, donne 8 ≤ t ≤ 10 et 1 ≤ h ≤ 11 − t. Le comptage initial mobilise au moins m + t − 1 portes, dont t ET. Les portes comptées sont donc au moins m − 1 OU et t ET. Le circuit entier contient ainsi au plus 43 − (32 − 1) = 12 ET.

Il faut au moins huit centres distincts, puisqu’un centre couvre au plus quatre arêtes. Avec exactement huit centres distincts, les huit doivent être des droites et couvrent chacun les quatre incidences de leur droite. Les quatre arêtes profondes sont alors les quatre incidences de la neuvième droite. Cela vaut aussi quand plusieurs termes productifs ont le même centre. En particulier, si les quatre arêtes profondes occupent plusieurs droites, il y a au moins neuf centres et au plus deux ET internes.

Avec neuf centres distincts, il y a au plus un centre point. Supposons qu’il y ait r centres points. Il reste r droites sans centre, dont au moins 4r − 4 arêtes sont acceptées par l’évaluation limitée. Seuls les r centres points peuvent fournir ces arêtes. Chacun a degré trois, d’où 4r − 4 ≤ 3r et r ≤ 4.

- Pour r = 2, fournir les quatre arêtes requises obligerait les deux points à appartenir aux deux droites sans centre.
- Pour r = 3, fournir les huit arêtes requises exigerait au moins deux droites sans centre qui contiennent chacune les trois points.
- Pour r = 4, fournir les douze arêtes requises exigerait que chacun des quatre points appartienne à trois des quatre droites sans centre. Deux de ces points partageraient au moins deux droites.

Cela contredit dans les trois cas l’absence de cycle de longueur quatre. Avec neuf centres distincts dont un point, la seule droite sans centre contient au moins trois des quatre arêtes profondes.

Avec dix centres distincts, il y a entre un et trois centres points. En effet, pour r centres points, il reste r − 1 droites sans centre et il faut couvrir au moins 4r − 8 de leurs arêtes par les r points. La borne de degré 3r donne r ≤ 8. Si d est le nombre de ces points sur une droite sans centre, les paires de points qu’on y trouve ne peuvent figurer sur aucune autre droite. Or, pour tout entier d, C(d, 2) ≥ 3d − 6, avec égalité seulement pour d = 3 ou 4. La somme sur les droites sans centre donne donc au moins 6r − 18 paires, parmi les C(r, 2) disponibles. Pour r de 5 à 8, 6r − 18 > C(r, 2). Pour r = 4, l’égalité impose que chacune des trois droites contienne au moins trois des quatre points et qu’il y ait exactement huit incidences, ce qui est impossible. Il faut au moins un centre point, puisqu’il n’y a que neuf droites.

Le générateur peut maintenant imposer exactement quatre arêtes profondes, au plus trois ET internes et au plus douze ET en tout. L’option `AFFINE_DEEP_LINE_PATTERN=single` fixe les quatre arêtes sur la première droite. Le générateur vérifie la transitivité des automorphismes sur les neuf droites avant de faire ce choix. Cette recherche particulière englobe le cas à huit centres distincts.

```sh
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 node frontiere.cjs build affine43-exactement-quatre-general.cnf 43 197 ordered
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEEP_LINE_PATTERN=single node frontiere.cjs build affine43-exactement-quatre-single.cnf 43 197 ordered
kissat --time=70 affine43-exactement-quatre-general.cnf
kissat --time=70 affine43-exactement-quatre-single.cnf
```

Pour régénérer à l’identique les anciens encodages d’exactement trois arêtes profondes, utiliser le générateur du commit `3636d26`.

Les deux recherches ont rendu UNKNOWN après 70 secondes chacune. En portant temporairement le seuil à 45 portes, le mode sur une seule droite a accepté le témoin exact à 45 portes dont quatre arêtes profondes sont sur la première droite. Il a rejeté le témoin exact à 44 portes, qui n’a aucune arête profonde.

## Quatre arêtes profondes et dix ET productifs

Si m = 32 et t = 10, alors h = 1, et l’ensemble U des portes du comptage initial contient au moins 41 portes. Ce cas impose deux conditions supplémentaires. Les arêtes profondes doivent occuper plusieurs droites, et au moins un ET productif doit avoir un support de voisins contenant deux droites ou plus, donc avoir nécessairement un point pour centre.

### Plusieurs droites sont nécessaires

Supposons que les quatre arêtes profondes soient toutes sur une droite L, et appelons Q ses quatre points. L ne peut pas être un centre productif, puisque aucune de ses incidences n’est acceptée par l’évaluation limitée.

On reprend le raisonnement par chemins de OU depuis l’unique ET interne G jusqu’au premier ET exposé E vrai sur une arête profonde. Quand E est productif, un chemin qui traverse uniquement des OU de U ajoute un terminal vide au comptage de son centre. Si |U| ≥ 42, aucune autre porte que G n’est disponible hors de U et au plus un centre peut recevoir G. Son opérande de centre est alors une entrée primaire. Une droite autre que L est inactive sur les quatre arêtes, et un point ne peut couvrir qu’une seule d’entre elles. Ce cas est impossible.

Il reste |U| = 41 et une porte S hors de U autre que G. Pour chaque arête profonde, ou bien E est S et est non productif, ou bien E est productif et reçoit G par un chemin de OU passant par S. Un OU de U non exposé ne peut lire directement G, car il introduirait un terminal vide dans son propre comptage. Si S est un OU, il a un support singleton. Un support plus grand impliquerait que S lui-même est compté dans U sur le chemin vers E. Un support vide ferait de S un terminal vide du parcours de comptage des voisins.

Chaque fil vivant a au plus un point de Q dans son support. Pour les OU de voisins d’un centre point, le support ne contient que des droites. Pour ceux d’un centre droite, ce centre est différent de L, donc au plus un de ses points est dans Q. Les autres portes ont des supports vides ou singletons. G est le premier ET vrai sur chacune des quatre arêtes profondes. Chacun de ses deux opérandes doit donc, par son support, rencontrer chacune des quatre paires {L, q}. Les deux supports contiennent L, donc G est vrai sur le singleton L.

- Si S est l’ET exposé non productif, il doit accepter les quatre arêtes. Pour chacune, l’un de ses opérandes est faux sur le singleton L et vrai sur la paire {L, q}. En remontant par des OU, cette valeur vraie ne peut provenir que de q. Les autres sources possibles sont l’entrée L, G et les ET exposés antérieurs. Les deux premières sont déjà vraies sur le singleton L, et les ET exposés antérieurs sont faux sur la paire. Seul l’opérande de support non vide de S peut donc fournir q. Il ne peut en fournir qu’un.
- Si S est un OU de support {p} pour un point p, il peut atteindre l’opérande de voisins d’un centre droite, ou l’opérande de centre d’un terme centré sur p. Dans le premier cas, l’entrée primaire de la droite est inactive sur les paires considérées. Dans le second, l’opérande de voisins est vrai grâce à l’entrée L. Il ne peut recevoir G via S car son support ne contient que des droites. Il ne peut non plus recevoir G en contournant S, puisqu’aucun OU de U non exposé ne lit G directement et qu’un opérande productif a un support non vide. L’ET serait donc vrai sur le singleton L, puisque son autre opérande y reçoit G.
- Si S est un OU de support {A} pour une droite A, il peut atteindre l’opérande de voisins d’un centre point q, ou l’opérande de centre d’un terme centré sur A. Dans le premier cas, le centre est une entrée primaire, donc q appartient à Q, et le support de voisins impose que q appartienne à A. Dans le second, l’opérande de voisins ne peut recevoir G via S, car son support ne contient que des points, ni en contournant S. Il doit être vrai grâce à l’entrée q, et q appartient là encore à A. La droite A est distincte de L, puisque L ne peut être ni un centre productif ni un voisin peu profond d’un q de Q. Ces termes ne peuvent donc fournir que l’unique point éventuel d’intersection de A et L.

Dans les trois cas, S permet au plus une des quatre arêtes, ce qui est impossible.

### Un centre point est nécessaire

Supposons qu’on puisse orienter les dix termes productifs de sorte qu’ils soient tous centrés sur des droites. Le raisonnement de la section sur m = 33, pour des arêtes réparties sur plusieurs droites, s’applique sans changement de budget. Il utilise |U| ≥ 41, un unique ET interne G et des supports de voisins formés uniquement de points.

Si |U| ≥ 42, au plus un centre peut recevoir G et toutes les arêtes profondes seraient sur sa droite. Sinon, l’unique porte S restante est en aval de G et chaque arête profonde en dépend. En amont de G, tout support est composé uniquement de points ou est un singleton droite. Comme les arêtes occupent plusieurs droites et que G est le premier ET vrai sur chacune, les deux supports de G sont composés de points et G est vrai sur le singleton q de chaque arête profonde.

Un S non productif accepterait un singleton q, sauf si l’un de ses opérandes a pour support une droite, auquel cas les arêtes profondes seraient toutes sur cette droite. Un S qui calcule un centre droite ne peut faire accepter une arête profonde sans que le terme accepte aussi le singleton q. Un S de support singleton point p ne peut alimenter que les opérandes de voisins. Toutes les droites ainsi atteintes contiennent à la fois p et chaque point profond q, qui est distinct de p. Elles seraient donc la même droite. Ces arguments autorisent plusieurs termes pour un même centre. Les conclusions reposent sur le nombre de droites distinctes, ou sur le rejet des singletons.

Il existe donc un terme impossible à centrer sur une droite. Pour un biclique non vide sans cycle de longueur quatre, cela signifie que son opérande de voisins a au moins deux droites dans son support et que son centre est un point.

### Encodage SAT

`AFFINE_DEPTH_TIGHT=1` exige au moins dix ET productifs et un terme dont l’opérande de voisins contient au moins deux droites dans son support. Le nombre de termes est alors exactement dix à 43 portes, par le comptage précédent. `AFFINE_DEEP_LINE_PATTERN=split` exige que les arêtes profondes occupent plusieurs droites.

```sh
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEPTH_TIGHT=1 AFFINE_DEEP_LINE_PATTERN=split \
  node frontiere.cjs build affine43-dix-productifs-split.cnf 43 197 ordered
kissat --time=60 affine43-dix-productifs-split.cnf
```

L’essai a rendu UNKNOWN après 60 secondes. Deux essais antérieurs, avec le même seuil de dix ET productifs et la même condition de centre point, avaient aussi rendu UNKNOWN après 65 secondes. Le premier ne fixait aucune répartition, le second imposait une seule droite, cas ensuite exclu par la démonstration.

Pour contrôler la polarité des options, le seuil de taille a été temporairement porté à 47 portes. Le circuit de contrôle gardait quatre arêtes profondes sur la première droite en recopiant son ET de tête. Deux arêtes auparavant couvertes par des termes centrés sur leurs droites ont été regroupées sous leur point commun. Un autre terme centré sur une droite a été scindé. Le circuit résultant est exact sur la frontière et a dix ET productifs. Le mode `single` l’a accepté et le mode `split` l’a rejeté.
