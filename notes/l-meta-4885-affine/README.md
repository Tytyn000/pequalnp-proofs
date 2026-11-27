# L-meta-4885 · Sous-problème affine

La [réduction étudiée dans la PR nº 10128](https://github.com/open-goat/pequalnp-proofs/pull/10128) conduit à la fonction d’incidence du plan affine d’ordre 3. Le sous-problème porte sur 21 entrées, 36 incidences et des portes ET et OU binaires. Le meilleur circuit exact connu ici a 44 portes. L’existence d’un circuit exact à 43 portes reste ouverte. Un tel circuit devrait avoir au moins six arêtes qui nécessitent deux ET sur un même chemin.

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

## Orbites des quatre arêtes profondes

Les 58 905 ensembles de quatre arêtes se regroupent en **173 orbites** sous les 432 automorphismes de l’incidence affine. Chaque orbite contient les ensembles obtenus par renumérotation des points et des droites. La répartition par droite est conservée.

| Arêtes profondes par droite | Ensembles | Orbites |
| --- | ---: | ---: |
| 4 | 9 | 1 |
| 3 + 1 | 1 152 | 5 |
| 2 + 2 | 1 296 | 6 |
| 2 + 1 + 1 | 24 192 | 66 |
| 1 + 1 + 1 + 1 | 32 256 | 95 |
| **Total** | **58 905** | **173** |

Le programme énumère les permutations des neuf droites qui préservent les voisinages. Chacune induit une permutation des douze points, leurs voisinages étant distincts. Les représentants sont les premiers quadruplets d’indices d’arêtes dans l’ordre lexicographique, avec les quatre indices triés. Les chiffres ont été vérifiés indépendamment avec les 432 applications affines inversibles de F₃², en utilisant les coordonnées du plan dual.

Avec dix ET productifs, seules les 172 orbites à plusieurs droites restent possibles. On peut aussi borner le nombre de centres points en fonction de la répartition. Un terme à une seule incidence peut être orienté sur l’un ou l’autre de ses sommets, et les bornes ci-dessous valent pour chaque choix d’orientation.

| Arêtes profondes par droite | Centres distincts | Centres points distincts |
| --- | --- | --- |
| 3 + 1 | 9 ou 10 | 1 à 3 |
| 2 + 2 | 10 | 1 à 3 |
| 2 + 1 + 1 | 10 | 1 ou 2 |
| 1 + 1 + 1 + 1 | 10 | 1 |

En effet, neuf centres dont au moins un point imposent trois arêtes profondes sur la seule droite sans centre. Avec dix centres et deux points, la seule droite sans centre ne peut avoir que deux arêtes peu profondes au plus. Avec trois points, les deux droites sans centre reçoivent au plus quatre incidences de ces points, car elles ont au plus un point commun. Elles portent alors les quatre arêtes profondes. Comme aucune ne peut recevoir plus de trois incidences peu profondes, seules les répartitions 3 + 1 et 2 + 2 subsistent dans ce cas.

L’option `AFFINE_DEEP_ORBIT=all` limite les quatre arêtes aux représentants. Une valeur numérique sélectionne une orbite. Le même circuit peut être renuméroté pour prendre le représentant de son orbite, et l’ordre topologique des portes peut ensuite être choisi selon les règles de `ordered`. Ce quotient conserve donc l’existence d’une solution. Les essais avec un numéro donné couvrent uniquement cette orbite.

```sh
node frontiere.cjs four-deep-orbits
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEEP_ORBIT=all \
  node frontiere.cjs build affine43-orbites-quatre-all.cnf 43 197 ordered
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEPTH_TIGHT=1 AFFINE_DEEP_LINE_PATTERN=split AFFINE_DEEP_ORBIT=all \
  node frontiere.cjs build affine43-orbites-quatre-dix.cnf 43 197 ordered
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEEP_ORBIT=1 \
  node frontiere.cjs build affine43-orbites-quatre-representant-1.cnf 43 197 ordered
AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 AFFINE_DEEP_ORBIT=173 \
  node frontiere.cjs build affine43-orbites-quatre-concentre.cnf 43 197 ordered
```

Le représentant 173 est l’unique orbite où les quatre arêtes sont sur une même droite.

Les quatre essais ont rendu UNKNOWN après 65 secondes chacun avec Kissat. Pour contrôler l’option numérique, le seuil a été temporairement porté à 45 portes. Le circuit exact à 45 portes obtenu en recopiant un ET de tête a été accepté avec le représentant 173 et rejeté avec le représentant 1. Les quatre arêtes profondes de ce témoin appartiennent à la première droite.

## Le cas à dix ET productifs est impossible

**Avec quatre arêtes profondes et 43 portes, il y a huit ou neuf ET productifs et au plus onze ET en tout.** Cela complète les contraintes précédentes sur dix ET productifs en excluant ce cas.

Notons u le nombre d’ET exposés non productifs. Le parcours depuis la sortie traverse au moins t + u − 1 OU, puisqu’il atteint les t + u ET exposés. Le comptage des disjonctions de voisins donne au moins m − t OU supplémentaires. Il faut compter aussi les t + u ET exposés et les h ET internes. On obtient

```text
s ≥ m + t + h + 2u − 1.
```

Pour m = 32 et s = 43, la borne antérieure m + t + h ≤ s donne t + h ≤ 11, tandis que le nouveau comptage donne t + h + 2u ≤ 12. Si u = 0, il y a au plus onze ET. Si u ≥ 1, il y en a au plus 12 − u ≤ 11.

Supposons t = 10. Alors h = 1 et u = 0. Notons G l’ET interne. Les quatre arêtes profondes occupent plusieurs droites, d’après le résultat précédent. Elles utilisent aussi plusieurs points, car un seul point n’a que trois incidences.

Sur chaque arête profonde, soit E le premier ET exposé qui est vrai. Il est productif puisque u = 0. Au moins un de ses opérandes est vrai par un chemin de OU depuis G et faux après remplacement des ET par zéro. Si ce chemin ne traverse que des OU de U, le comptage gagne un terminal vide dans les voisins du centre de E, comme précédemment. Si |U| ≥ 42, toutes les portes vivantes sont dans U ou égales à G. Au plus un centre pourrait alors recevoir G, et tous les E choisis auraient pour opérande de centre une même entrée primaire. Une droite ne convient pas puisque plusieurs droites sont représentées. Un point ne convient pas puisqu’il n’a que trois incidences.

On a donc |U| = 41 et une seule porte supplémentaire S. Chaque E choisi reçoit G par un chemin de OU passant par S. Tout OU de U qui lirait directement G ajouterait un terminal vide, donc un tel lecteur n’existe pas. Comme dans le cas à trois arêtes, S a un support singleton. Un support plus grand ferait compter S dans U sur le parcours de voisins. Un support vide ferait de S un terminal vide de ce parcours.

Soient Q l’ensemble des points des arêtes profondes et R l’ensemble de leurs droites. Chaque support en amont de G est contenu dans une seule part du graphe. Les supports des OU de U sont vides ou contenus dans les voisins d’un centre unique. Les entrées primaires sont des singletons et S est en aval de G. Comme G est le premier ET vrai sur chacune des arêtes profondes, chacun de ses opérandes est vrai sur chacune de ces arêtes avec tous les ET précédents forcés à zéro. Si le support d’un opérande est formé de points, il contient donc tout Q. S’il est formé de droites, il contient tout R. Par conséquent G est vrai sur **toute paire de Q × R**, y compris celles qui ne sont pas des incidences.

Si le support de S est un point, il ne peut alimenter qu’un opérande de centre point ou un opérande de voisins de centre droite. Dans les deux cas, l’autre opérande de E a un support formé de droites. Sur une arête profonde {q, L} acceptée par E, cet autre opérande doit recevoir sa valeur vraie de l’entrée L. Il ne peut la recevoir de G. Un chemin depuis G devrait traverser S, auquel cas son support contiendrait un point. Il ne peut pas la recevoir d’un ET exposé antérieur, puisque E est le premier ET exposé vrai. Ainsi, pour chaque L de R, le circuit accepte toute paire qui active L et G. Le même argument avec les deux parts échangées montre que, si le support de S est une droite, pour chaque q de Q le circuit accepte toute paire qui active q et G.

Dans les deux cas, le circuit accepte tout Q × R. Comme |Q| ≥ 2 et |R| ≥ 2, cela donnerait un cycle d’incidence de longueur quatre. Le graphe n’en a aucun, donc t = 10 est impossible.

Il en découle que, lorsque les quatre arêtes profondes occupent plusieurs droites, les neuf ET productifs ont neuf centres distincts. Le seul cas qui puisse alors avoir un centre point est la répartition 3 + 1.

### Raffinements intermédiaires et comptage des gardes

Avant l’exclusion complète de t = 10, le cas |U| = 41 avait fourni deux autres restrictions. L’égalité |U| = m + t − 1 exige que les voisins couverts par des centres distincts ne se recouvrent pas sur une arête. Pour un même centre, l’égalité dans le comptage q ≥ k_x − t_x exige t_x racines distinctes, exactement k_x terminaux avec un singleton distinct chacun, et exactement un arc entrant par sommet hors racine dans le parcours depuis les racines. Les parcours issus des différentes racines sont donc disjoints. Les dix termes productifs auraient ainsi couvert chaque arête peu profonde exactement une fois.

Le support singleton de S donnait aussi une restriction géométrique. Si c’est un point p, toutes les droites profondes contiennent p et aucun de leurs points profonds n’est p. En effet, S se trouve soit dans les disjonctions de voisins de ces droites, soit dans un opérande de centre p dont les voisins comprennent les droites profondes concernées. Si S a pour support une droite A, tous les points profonds sont sur A et leurs droites profondes sont différentes de A. Il ne restait que onze orbites parmi les 172 orbites réparties sur plusieurs droites. La preuve ci-dessus exclut aussi celles-ci.

## Encodages SAT compacts

`AFFINE_COMPACT_ROWS=1` encode une ligne positive par des sous-estimations booléennes des valeurs des fils. Il suffit d’exiger que la sortie sous-estimée soit vraie. Pour une ligne négative, l’encodage utilise des surestimations et exige que la sortie surestimée soit fausse. L’induction de porte en porte est valide par monotonie de ET et OU. Réciproquement, les valeurs exactes satisfont toutes les implications si le circuit est correct. Le remplacement conserve donc la satisfiabilité sur la frontière complète.

`AFFINE_COMPACT_DEPTH=1` partage l’évaluation à zéro ET sur les 21 singletons. La valeur d’un opérande avec deux entrées actives est le OU de ses deux valeurs singletons. Une arête est peu profonde exactement quand au moins un ET exposé combine deux opérandes ainsi vrais. Cette définition remplace les évaluations répétées à un ET. `AFFINE_DEPTH_MAX_NINE=1` impose la nouvelle borne de neuf ET productifs et onze ET au total pour exactement quatre arêtes profondes.

Pour le problème global à 43 portes, le nombre de clauses passe de 1 866 772 à 995 119. Pour le cas d’égalité et l’ensemble des représentants, les deux compactions donnent 1 114 945 clauses, contre 2 410 854 dans la version précédente. Les contrôles ont accepté le témoin exact à 44 portes, rejeté un candidat qui manque seulement un positif minimal et rejeté un témoin modifié qui accepte des négatifs maximaux tout en conservant tous les positifs. La variante de profondeur a aussi accepté le témoin à 45 portes dans son orbite et l’a rejeté dans l’orbite 1.

```sh
AFFINE_COMPACT_ROWS=1 AFFINE_MIN_DEEP_EDGES=4 \
  node frontiere.cjs build affine43-compact-global.cnf 43 197 ordered
AFFINE_COMPACT_ROWS=1 AFFINE_COMPACT_DEPTH=1 AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 \
  AFFINE_DEEP_ORBIT=all AFFINE_DEPTH_MAX_NINE=1 \
  node frontiere.cjs build affine43-neuf-productifs-onze-et.cnf 43 197 ordered
```

Kissat a rendu UNKNOWN pour les quinze essais compacts, avec des limites allant de 70 à 150 secondes. Les deux commandes ci-dessus ont utilisé les limites de 150 et 80 secondes respectivement. Les essais `neuf-productifs-all` et `neuf-productifs-concentre` ont précédé la borne de onze ET et utilisaient encore douze comme plafond. Le circuit exact à 45 portes a passé le contrôle du plafond de neuf termes productifs. Un circuit exact à 47 portes ayant quatre arêtes profondes et dix termes productifs a été rejeté lorsque ce plafond a été appliqué indépendamment du plafond du nombre total d’ET.

## Deux ET internes lorsque les neuf centres sont des droites

Supposons qu’un circuit exact à 43 portes ait exactement quatre arêtes profondes réparties sur plusieurs droites. S’il a neuf centres droites, il a **exactement deux ET internes et onze ET en tout**. Le seul cas à plusieurs droites qui peut échapper à cette conclusion est la répartition 3 + 1 avec un centre point.

On sait déjà que t = 9, puis que 1 ≤ h ≤ 2. Supposons h = 1 et appelons G l’unique ET interne. L’ensemble U du comptage initial contient au moins 40 portes. Pour chaque arête profonde, G est le premier ET vrai. Appelons E le premier ET exposé vrai sur cette arête. À l’évaluation exacte, tout opérande de E se rend vrai par une entrée primaire ou G, en remontant par des OU. Les ET exposés antérieurs sont faux sur cette paire. Au moins un de ces opérandes doit recevoir G, puisque l’évaluation limitée échoue.

### Aucun fil calculé hors de U en amont de G

Les supports des opérandes de G sont alors composés uniquement de points, ou sont des singletons droites. Un support singleton droite ne peut pas rencontrer toutes les paires profondes, puisqu’elles se répartissent sur plusieurs droites. Pour chaque point profond q, les deux supports contiennent donc q et G est vrai sur le singleton q.

Pour chaque arête profonde {q, L}, au moins un opérande de E est faux sur le singleton q, puisque le circuit rejette ce singleton. Sa valeur vraie sur la paire vient de l’entrée L. Elle ne peut pas venir de G, qui est déjà vrai sur le singleton q, ni de q lui-même. L’autre opérande reçoit G, car sinon l’arête serait acceptée par l’évaluation limitée. Par conséquent, pour chaque droite profonde L, G suffit à faire accepter n’importe quelle paire contenant L. Le circuit accepterait toutes les paires entre les points profonds et les droites profondes. Il y a au moins deux points profonds et deux droites profondes, ce qui est incompatible avec l’absence de cycle de longueur quatre.

### Un fil calculé hors de U en amont de G

Soit S₁ une porte hors de U en amont de G. Si |U| ≥ 41, les seules portes hors de U sont S₁ et G. Aucun E choisi ne peut être S₁, puisque G est le premier ET vrai. Tous les E sont donc productifs et reçoivent G par des OU de U dans leurs disjonctions de voisins. Chacun des centres ainsi atteints ajoute un terminal vide dans son comptage. Comme |U| ≤ 41 dans ce cas, il ne peut y avoir qu’un seul centre atteint. Son opérande de centre est une entrée primaire droite, ou une porte de support singleton droite en amont de G. Dans les deux cas il est vrai sur une arête profonde uniquement si cette droite est active. Or les arêtes profondes occupent plusieurs droites.

Il reste |U| = 40. On a au plus une porte supplémentaire S₂. Il n’y a aucun ET exposé non productif, car cela demanderait un OU exposé supplémentaire et ferait monter |U| à 41. Chaque E reçoit G par un chemin de OU qui doit traverser S₂, faute de quoi le comptage gagnerait un terminal vide. La porte S₂ est donc un OU en aval de G. Comme précédemment, son support est un singleton. Un support plus grand ferait compter S₂ dans U, et un support vide constituerait un terminal vide dans un parcours de voisins. Aucun OU de U ne lit directement G, puisque cela ferait aussi monter |U| à 41.

S₁ est un OU, car le seul ET non exposé est G, et les ET exposés sont tous productifs et dans U. Les supports de ses deux opérandes sont vides, composés de points, ou des singletons droites. En amont de G, S₁ est donc le seul fil qui puisse avoir un support mixte, avec des points et une seule droite L₀.

- Si les deux opérandes de G ont des supports contenus chacun dans une seule part du graphe, G est vrai sur toutes les paires entre points profonds et droites profondes. En effet, chaque support contient tous les sommets profonds de sa part. Si le support de S₂ est un point, S₂ ne peut atteindre que des disjonctions de voisins et, sur chaque paire profonde, l’autre opérande de E reçoit l’entrée droite. Si le support de S₂ est une droite, il ne peut atteindre qu’un opérande de centre, et l’autre opérande reçoit l’entrée point. Dans les deux cas, l’autre opérande ne peut recevoir G via S₂, qui ajouterait un sommet de la mauvaise part à son support, ni en contournant S₂. Le circuit accepterait donc toutes ces paires, ce qui est impossible.
- Si un opérande a pour support mixte celui de S₁, considérons une arête profonde {q, L} avec L distincte de L₀. Cet opérande est vrai grâce à q. L’autre opérande est lui aussi vrai grâce à q, soit parce qu’il est également mixte, soit parce qu’il ne contient que des points. Un singleton droite ne peut pas convenir sur toutes les arêtes profondes. Ainsi G est vrai sur le singleton q. Si S₂ a pour support un point p, toutes les droites profondes contiennent p et q est distinct de p, puisque l’arête de q est profonde. Sur chaque droite profonde L', l’ET choisi reçoit S₂ dans sa disjonction de voisins et l’autre opérande reçoit l’entrée L'. Il accepte donc {q, L'}. Deux droites auraient ainsi deux points communs. Si S₂ a pour support une droite, il alimente un opérande de centre et l’autre opérande reçoit q sur l’arête {q, L}. E accepterait alors le singleton q.

Il n’existe donc pas de circuit de ce type avec h = 1. Avec h = 2, on a t + h = 11, et la borne t + h + 2u ≤ 12 force u = 0. Le circuit a exactement onze ET.

L’option `AFFINE_LINEAR_SPLIT=1` fixe deux ET internes et exige un ET productif centré sur chacune des neuf droites. L’option `AFFINE_EXCLUDE_DEEP_TRIPLE=1` retire la répartition 3 + 1. Les 167 orbites restantes à plusieurs droites auront toutes neuf centres droites si elles sont réalisables.

```sh
AFFINE_COMPACT_ROWS=1 AFFINE_COMPACT_DEPTH=1 AFFINE_MIN_DEEP_EDGES=4 AFFINE_DEPTH_EQUALITY=1 \
  AFFINE_DEPTH_MAX_NINE=1 AFFINE_DEEP_ORBIT=all AFFINE_DEEP_LINE_PATTERN=split \
  AFFINE_LINEAR_SPLIT=1 AFFINE_EXCLUDE_DEEP_TRIPLE=1 \
  node frontiere.cjs build affine43-deux-et-internes-sans-triple.cnf 43 197 ordered
kissat --time=85 affine43-deux-et-internes-sans-triple.cnf
```

En retirant `AFFINE_EXCLUDE_DEEP_TRIPLE=1`, on inclut aussi les cinq orbites 3 + 1 avec neuf centres droites.

## Au moins cinq arêtes nécessitent deux ET

On exclut maintenant le cas de quatre arêtes profondes. On reprend m = 32, s = 43, t ∈ {8, 9} et les bornes

```text
t + h ≤ 11
t + h + 2u ≤ 12
|U| ≥ 31 + t + u
```

Ici U contient les t ET productifs, les OU exposés et les OU comptés dans leurs voisins. Il ne contient ni les h ET internes ni les u ET exposés non productifs. Pour chaque arête profonde, on regarde le premier ET exposé E vrai sur cette arête. En amont de E, les ET exposés sont faux sur l’arête. Les chemins de OU qui y apportent une valeur vraie peuvent donc être suivis jusqu’à une entrée primaire ou un ET interne.

Deux observations seront utilisées pour les arêtes profondes toutes situées sur une même droite L. Aucun ET productif n’a alors L pour centre, et, en notant Q les quatre points de L, tout support en U contient au plus un point de Q. Cela vaut pour les gardes de centres points, qui contiennent des droites, et pour les gardes des autres centres droites, qui rencontrent L au plus en un point. Une entrée primaire a la même propriété. Ainsi deux OU supplémentaires peuvent réunir au plus trois points de Q dans un support. Par ailleurs, si un E centré sur une droite A ≠ L accepte une arête profonde, son opérande de centre doit être un OU hors de U, de support singleton A et vrai grâce à un ET interne. L’entrée primaire A est inactive sur cette arête.

### Neuf ET productifs et deux ET internes

Dans ce cas u = 0. Si |U| ≥ 41, toutes les portes sont dans U ou sont les deux ET internes. Un chemin de OU depuis un ET interne vers un opérande de E doit passer par des OU de U, tous de support de taille au moins deux. Il aboutit donc dans les voisins, où il ajoute un terminal vide à leur comptage. Deux centres ainsi atteints donneraient |U| ≥ 42, puis au moins 44 portes. Un seul centre ne peut expliquer les quatre arêtes. Son opérande de centre est une entrée primaire. Pour plusieurs droites profondes, aucune droite ne convient, et un point n’a que trois incidences. Pour une seule droite profonde L, L n’est pas un centre.

Il reste |U| = 40 et un unique OU S hors de U. Aucun OU de U ne peut lire directement un ET interne, car cela ajouterait un terminal vide et ferait passer |U| à 41. Tout chemin d’activation d’un opérande productif depuis un ET interne passe donc par S. Comme précédemment, S a un support singleton. Un support de taille au moins deux ferait compter S parmi les voisins. Un support vide ferait ajouter un terminal vide, puisque l’opérande atteint a un support non vide.

Soit H le dernier ET interne dans l’ordre topologique et K l’autre ET interne. H doit être lu directement par S. Il a un lecteur puisque la porte est vivante. Aucun OU de U ne peut le lire, et un ET exposé qui le lit directement serait non productif, car son support est vide. Pour que S ait un support singleton, son autre opérande doit être une entrée primaire. Les OU comptés dans U ont des supports vides ou de taille au moins deux. K doit donc être lu directement par H. Ses autres lecteurs possibles étaient S, les OU de U et les ET exposés productifs, et aucun ne convient.

H doit être vrai sur les quatre arêtes profondes, car S transmet sa valeur vers les E et ces arêtes échouent quand on force les ET internes à zéro. K est alors vrai sur ces quatre arêtes. Les supports en amont de K et de l’autre opérande de H, si celui-ci est distinct de K, sont contenus chacun dans une seule part du graphe. La porte S est en aval, et les seuls autres OU sont ceux de U. Sur les quatre arêtes, les valeurs utiles de ces opérandes s’obtiennent en forçant les ET précédents à zéro. Les ET exposés antérieurs au premier E sont faux et aucun OU de U ne lit K directement. Chaque support doit donc contenir tous les sommets profonds de sa part. H est ainsi vrai sur toute paire formée d’un point profond et d’une droite profonde.

Pour plusieurs droites, cette dernière propriété donne une contradiction. Si S a pour support un point, il atteint un opérande de centre point ou un opérande de voisins de centre droite. L’autre opérande est vrai grâce à la droite profonde L. Il ne peut recevoir un ET interne via S, car son support est fait de droites, ni en contournant S. Donc H vrai avec L suffit à faire accepter la paire en sortie. Si S a pour support une droite, l’argument est symétrique avec le point profond. Toutes les paires entre points et droites profonds seraient acceptées, alors que les deux ensembles ont au moins deux éléments et que le graphe est sans cycle de longueur quatre.

Pour une seule droite profonde L, S ne peut avoir pour support un point p. Sur chacune des quatre arêtes {q, L}, l’ET atteint via S est centré soit sur p soit sur L. L n’est pas un centre. Dans le premier cas, L figure parmi les voisins peu profonds de p, mais cela est impossible puisque les quatre incidences de L sont profondes. Si S a pour support une droite A, chaque point profond q doit être incident à A par un terme peu profond. Si S atteint un opérande de centre A, l’autre opérande contient q. Si S atteint la garde d’un centre point, ce centre doit être q. Les quatre points de L devraient alors appartenir à une droite A distincte de L, ce qui est impossible.

### Neuf ET productifs et un ET interne

Notons G l’unique ET interne. Pour plusieurs droites profondes, le cas de neuf centres droites a déjà été exclu. Le centre point, s’il existe, est unique. La droite L sans centre porte trois des quatre arêtes profondes, et la quatrième est sur une droite M. Les supports des portes de U et des entrées primaires contiennent chacun au plus un des trois points profonds de L. Aucune garde de centre droite ne peut en contenir davantage car L n’est pas un centre.

Si toutes les portes en amont de G sont dans U, à part les entrées primaires, les deux supports des opérandes de G contiennent L. Chacun doit rencontrer les trois paires profondes de L et ne peut contenir leurs trois points. Ces supports sont donc formés uniquement de droites et contiennent aussi M, puisque G est vrai sur l’arête profonde de M. Ainsi G est vrai sur les singletons L et M. Sur une arête profonde {q, L}, l’un des opérandes de E est faux sur le singleton L et reçoit donc q sur la paire. L’autre reçoit G, car l’arête ne passe pas l’évaluation limitée. E accepte alors aussi {q, M}. Les trois points profonds de L seraient tous incidents à M, ce qui est impossible.

S’il existe une porte S₁ hors de U en amont de G, le raisonnement de budget utilisé pour les neuf centres droites s’applique. Pour |U| ≥ 41, au plus un centre peut recevoir G. Son centre est une entrée primaire ou un singleton calculé avant G, vrai sur les arêtes profondes seulement lorsque son sommet est actif. Il ne peut expliquer les quatre arêtes. Pour |U| = 40, u = 0 et une unique porte S₂ en aval de G transmet G vers les E. Elle est un OU de support singleton. S₁ est un OU et son support contient au plus deux des trois points profonds de L. Chaque opérande de G doit donc encore contenir L, et G est vrai sur le singleton L. Si le support de S₂ est un point, sur chaque arête profonde de L l’autre opérande de E reçoit L, ce qui ferait accepter le singleton L. Si le support de S₂ est une droite A, toute arête profonde {q, L} impose une incidence peu profonde {q, A}, en examinant si S₂ atteint un opérande de centre ou de voisins. Il faudrait que les trois points profonds de L appartiennent à une droite A distincte de L.

Pour quatre arêtes profondes sur une seule droite L, chacun des opérandes de G contient L. Même avec deux OU supplémentaires en amont de G, un support ne peut contenir que trois des quatre points de L. Comme G est le premier ET vrai sur chacune des quatre arêtes, ses deux supports doivent rencontrer les quatre paires, donc G est vrai sur le singleton L. Chaque E centré sur une droite A ≠ L demande un OU de centre calculé hors de U. Son opérande de voisins doit alors recevoir q sur toute arête profonde qu’il accepte. Il ne peut recevoir G, car cela ferait accepter le singleton L, ni L lui-même. Ce terme couvre au plus l’unique point de A sur L. Un centre point éventuel ne couvre aussi qu’un point profond. En effet, s’il est hors de L, un opérande de centre rendu vrai par G demanderait à la garde de recevoir L et ferait accepter le singleton L. S’il est sur L, L est absent de la garde peu profonde, qui doit donc recevoir G. Son opérande de centre doit alors recevoir q et ne peut être vrai que pour son propre point.

Si u = 0, il y a au plus deux OU hors de U en plus de G. Les termes à centre droite couvrent donc au plus deux points, et l’unique centre point au plus un. Si u = 1, |U| ≥ 41 et l’ET exposé non productif occupe la dernière porte hors de U. Aucun centre droite calculé ne peut intervenir. L’ET non productif peut couvrir au plus un point. Son opérande faux sur le singleton L doit recevoir q par son support, et seul l’opérande de support non vide peut le faire. Les quatre points ne sont donc pas couverts.

### Huit ET productifs

Les huit centres sont les huit droites autres que L. Toutes les arêtes profondes sont sur L et tout terme productif qui en accepte une demande un centre calculé. On a |U| ≥ 39 et h est compris entre un et trois.

- **Un ET interne G.** Si u = 0, au moins un OU de centre hors de U est en aval de G, donc au plus deux autres portes hors de U sont en amont de G. Si u = 1, |U| ≥ 40 et, après avoir compté G et l’ET non productif, il reste au plus un OU hors de U. Dans les deux cas, chaque support d’opérande de G rencontre les quatre paires et contient au plus trois points de L, donc il contient L. G est vrai sur le singleton L. Chaque terme productif atteint reçoit q dans son support de voisins et ne couvre qu’un point profond. Avec u = 0, il y a au plus trois OU de centre. Avec u = 1, l’ET non productif couvre au plus deux points grâce à son unique opérande de support non vide, puisqu’il reste au plus un OU hors de U. Au plus un centre calculé peut fournir un autre point. On ne couvre jamais quatre points.
- **Trois ET internes.** On a u = 0 et au plus un OU de centre. Il en faut un, donc |U| = 39. Aucun OU de U ne lit directement un ET interne, puisque le terminal vide supplémentaire ferait monter |U| à 40. L’opérande de voisins du seul terme à centre calculé ne peut recevoir un ET interne par ce centre, car son support est composé de points et celui du centre est une droite. Comme il ne peut pas non plus le recevoir en contournant le centre, il ne couvre qu’un point de L.
- **Deux ET internes et u = 1.** On a |U| = 40 et l’ET non productif est la seule porte hors de U en plus des deux ET internes. Aucun centre calculé n’existe, et aucun OU de U ne lit directement un ET interne, car |U| monterait à 41. Les quatre arêtes sont donc acceptées par l’ET non productif. Pour ses opérandes qui sont des ET internes, on peut remonter encore à travers les ET internes. Tous les autres opérandes doivent être vrais sur les quatre paires grâce à leurs supports, qui contiennent au plus un point de L. Les ET exposés antérieurs sont faux sur les quatre paires, puisque le seul E possible est l’ET non productif. Tous les supports employés contiennent L. En réévaluant les ET internes en ordre topologique, on voit que l’ET non productif est vrai sur le singleton L.
- **Deux ET internes et u = 0.** Si |U| = 39, aucun OU de U ne lit directement un ET interne. Au plus deux centres calculés peuvent aider, chacun avec une garde qui ne reçoit la valeur vraie que par une entrée de point sur l’arête profonde. Une garde ne peut lire un centre calculé de support singleton droite par un chemin de OU, puisque son support est constitué de points. Au plus deux points sont donc couverts. Si |U| ≥ 40, le seul OU hors de U doit être un centre calculé S, et |U| = 40. Il n’y a qu’un terme E avec ce centre. Il accepte les quatre arêtes et est le premier ET exposé vrai sur chacune. La porte S lit directement un ET interne H et une entrée primaire droite. Aucun OU de U ne peut transmettre H vers S par un chemin de OU, puisque les seuls OU non exposés de U ont des supports de taille au moins deux. L’autre ET interne est noté K.

Dans ce dernier cas H est vrai sur les quatre arêtes. Montrons qu’il est vrai sur le singleton L. Pour un fil faux sur ce singleton, une trace de OU peut apporter la valeur vraie sur {q, L} par q ou par un ET interne également faux sur le singleton L. Les ET exposés antérieurs à E sont faux sur toutes ces paires. Si K précède H et est faux sur le singleton L, un de ses opérandes y est faux. Cet opérande ne peut encore recevoir aucune valeur d’un ET interne. Son support contient au plus un point de L, donc K est vrai sur au plus une des quatre paires. Si K est vrai sur le singleton L, aucune trace de OU depuis K ne peut atteindre un opérande faux sur le singleton L. Par conséquent, si H était faux sur le singleton L, son opérande faux ne pourrait être vrai que sur au plus deux paires, une grâce à son support et une grâce à K. Si K est en aval de H, il ne peut même pas fournir cette deuxième paire. Cela contredit la valeur vraie de H sur les quatre paires.

La porte S est donc vraie sur le singleton L, et la garde de E est fausse sur ce singleton. Elle peut recevoir au plus un point de L par son support. Elle ne peut recevoir ni H ni S par un chemin de OU, puisque ces deux fils sont déjà vrais sur le singleton L. Si K la rejoint et est faux sur le singleton L, il est vrai sur au plus une paire, que K soit en amont de H ou en aval. Dans le second cas, on prend un opérande de K faux sur le singleton L, qui ne peut recevoir H ni S par un chemin de OU. Dans les deux cas cet opérande est vrai par son support sur au plus une paire. La garde de E ne peut donc être vraie que sur au plus deux des quatre paires.

Toutes les possibilités pour huit ou neuf ET productifs sont exclues. **Un circuit affine exact à 43 portes doit avoir au moins cinq des 36 arêtes profondes.**

### Vérification et recherches à cinq arêtes profondes

Les deux essais historiques avec neuf centres droites ont rendu UNKNOWN après 85 secondes. Avant l’exclusion complète de quatre arêtes, l’encodage correspondant a été contrôlé à l’aide d’un circuit exact à 46 portes avec deux ET internes et quatre arêtes profondes réparties 2 + 2. Il l’a accepté. Il a rejeté une copie exacte à 47 portes avec le même profil d’arêtes profondes mais trois ET internes, même en relevant temporairement le plafond du nombre total d’ET pour isoler ce contrôle.

```sh
AFFINE_COMPACT_ROWS=1 AFFINE_MIN_DEEP_EDGES=5 \
  node frontiere.cjs build affine43-compact-cinq-global.cnf 43 197 ordered
AFFINE_COMPACT_ROWS=1 AFFINE_MIN_DEEP_EDGES=5 AFFINE_EDIT_BASE=reparation-affine-43.json AFFINE_EDIT_BUDGET=3 \
  node frontiere.cjs build affine43-compact-cinq-proche.cnf 43 197 plain
AFFINE_COMPACT_ROWS=1 AFFINE_MIN_DEEP_EDGES=5 AFFINE_EDIT_BASE=reparation-affine-43-structure.json AFFINE_EDIT_BUDGET=4 \
  node frontiere.cjs build affine43-compact-cinq-structure.cnf 43 197 plain
for name in global proche structure; do
  kissat --time=75 "affine43-compact-cinq-$name.cnf"
done
```

Ces trois essais ont rendu UNKNOWN après 75 secondes chacun. Pour contrôler le nouveau filtre, on a conservé les quatre arêtes profondes du témoin exact à 45 portes et rendu une incidence supplémentaire profonde dans une deuxième étoile, en plaçant son ET avant le OU de voisins. Le circuit résultant à 46 portes est exact sur la frontière et a cinq arêtes profondes. Le filtre a accepté celui-ci et rejeté le témoin exact à quatre arêtes profondes.

## Cas de cinq arêtes profondes

Avec exactement cinq arêtes profondes et 43 portes, il y a **huit ou neuf ET productifs, au plus trois ET internes et au plus onze ET en tout**. Huit centres distincts imposent la répartition 4 + 1. Les autres répartitions exigent exactement neuf ET productifs.

### Une unité supplémentaire dans le comptage

Pour un circuit exact à 43 portes avec au moins cinq arêtes profondes, on a m + t + h ≤ 42. En effet, supposons m + t + h = 43, le maximum admis par le comptage précédent. Alors u = 0 par s ≥ m + t + h + 2u − 1. Il y a au plus une porte hors de U en plus des h ET internes. Notons Q l’ensemble des points profonds et R celui des droites profondes. Chacun a au moins deux éléments puisqu’aucun sommet n’a cinq incidences.

Si |U| ≥ m + t, aucun troisième type de porte n’est disponible. Sur chaque arête profonde, le premier ET exposé vrai est productif et reçoit un ET interne par des OU comptés. Chaque centre ainsi atteint ajoute un terminal vide dans son comptage. Comme |U| ≤ m + t, un seul centre peut être atteint. Ses termes ont pour opérande de centre l’entrée primaire correspondante. Ils ne peuvent pas expliquer cinq arêtes profondes.

On a donc |U| = m + t − 1 et un OU S hors de U. Aucun OU de U ne lit directement un ET interne, car il ajouterait un terminal vide. Tout chemin de OU qui fait parvenir la valeur d’un ET interne à un ET productif traverse S. Comme précédemment, S a un support singleton. Un support plus grand ferait compter S parmi les voisins. Un support vide ajouterait un terminal vide au comptage d’un opérande productif.

Le dernier ET interne H doit être lu directement par S. Un OU de U ne peut le lire et un ET exposé qui le lirait directement serait non productif. L’autre opérande de S est l’entrée primaire de son support singleton, puisque tous les autres OU ont des supports vides ou de taille au moins deux. Les autres ET internes doivent alimenter H à travers des ET internes, puisqu’ils sont vivants et n’ont pas d’autre lecteur disponible. Ainsi H est la conjonction de signaux dont chacun est une entrée primaire ou un fil en U. Tous ces signaux sont vrais sur toutes les arêtes profondes. Les ET exposés antérieurs au premier ET exposé vrai sont faux sur chacune de ces arêtes, et aucun OU de U ne reçoit directement un ET interne. Les signaux d’entrée de cette conjonction sont donc vrais grâce à leurs supports. Chaque support est contenu dans une part du graphe et doit contenir tous les sommets profonds de sa part. H est vrai sur toutes les paires Q × R.

Si S a pour support un point, pour chaque droite L de R, il existe un ET productif qui accepte une arête profonde sur L avec un opérande rendu vrai par S et l’autre grâce à l’entrée L. Cet autre opérande a un support de droites et ne peut recevoir un ET interne via S ou en le contournant. H vrai avec L suffit donc à faire accepter la paire. Si S a pour support une droite, l’argument est symétrique pour chaque point de Q. Dans les deux cas le circuit accepte Q × R, qui contient une non-incidence car le graphe est sans cycle de longueur quatre. Cela exclut m + t + h = 43.

### Nombre total de ET pour exactement cinq arêtes profondes

Pour m = 31, on obtient t + h ≤ 11, t ≥ 8 et t + h + 2u ≤ 13. On a donc h ≤ 3. Si le nombre total de ET dépasse onze, il faut u = 1 et t + h = 11. Ce cas impose |U| = m + t + u − 1 et aucune porte en plus des portes de U, des ET internes et du seul ET exposé non productif E. Aucun OU de U ne peut lire directement un ET interne, car le terminal vide supplémentaire ferait dépasser le budget.

Aucun ET productif ne peut alors être le premier ET exposé vrai sur une arête profonde. Il devrait recevoir un ET interne par un chemin de OU, alors qu’un opérande productif a un support non vide. Donc E est le premier ET exposé vrai sur chacune des cinq arêtes. En remontant ses opérandes à travers les ET internes, on obtient une conjonction de signaux qui, sur chacune des cinq arêtes, sont vrais grâce à des supports contenus dans une seule part. Chaque support contient tous les sommets profonds de sa part. Comme dans le cas précédent, le circuit accepterait Q × R. Il y a donc au plus onze ET au total.

### Dix termes productifs sont impossibles

Supposons t = 10. Alors h = 1 et u = 0 d’après la borne sur le nombre total de ET. Appelons G l’unique ET interne. Il reste |U| ≥ 40 et au plus deux portes hors de U en plus de G.

Supposons d’abord qu’une porte S₁ hors de U soit en amont de G. Si |U| ≥ 41, il ne reste aucune porte en aval pour transmettre G. Au plus un centre peut recevoir G par ses voisins, car chacun ajoute un terminal vide. Son signal de centre est vrai sur une arête profonde seulement si son sommet est actif, puisque c’est une entrée primaire ou un singleton calculé en amont du premier ET vrai G. Il ne peut couvrir cinq arêtes.

Si |U| = 40, une unique porte supplémentaire S₂ en aval de G doit transmettre G par des OU vers les ET exposés. Un chemin qui contournait S₂ ajouterait un terminal vide. S₂ est un OU de support singleton par le même comptage que précédemment. Si son support est un point p, toutes les droites profondes contiennent p et aucun point profond n’est p. En effet, S₂ entre soit dans un opérande de centre p, soit dans les voisins d’un centre droite. L’autre opérande doit être vrai grâce à la droite de l’arête, et le terme correspondant accepte p et cette droite dans l’évaluation limitée. Chaque point profond est alors incident à une seule droite profonde, puisque deux droites profondes ont déjà p comme point commun. Sur toutes les paires Q × R, G vrai avec une droite profonde suffit à faire accepter la paire. Pour chaque sommet de Q ou R, G doit donc être faux sur son singleton. Pour une droite, sinon le singleton serait accepté directement. Pour un point, sinon une paire avec une autre droite profonde non incidente serait acceptée. Si le support de S₂ est une droite, le raisonnement est symétrique. Tous les points profonds lui appartiennent, les droites profondes en sont différentes et chacune ne contient qu’un point profond.

Sur les paires profondes et les singletons, G calcule la conjonction de ses deux opérandes évalués sans ET précédents. Il est le premier ET vrai sur chaque paire profonde et les ET exposés rejettent tous les singletons. Les supports de ses opérandes, restreints à Q et R, sont disjoints, puisqu’il est faux sur tous ces singletons. Au plus un fil, S₁, peut avoir un support contenant à la fois un point et une droite. Si les deux opérandes étaient ce même fil, leurs supports ne pourraient pas être disjoints tout en acceptant les paires profondes. Au moins un opérande a donc son support dans une seule part. Pour rencontrer toutes les arêtes profondes, il doit contenir tous les sommets profonds de sa part. Par disjonction des supports, l’autre contient tous les sommets profonds de l’autre part. G est alors vrai sur Q × R, ce qui est interdit avec un seul singleton de transmission S₂.

Il ne reste donc aucune porte hors de U en amont de G. Les deux supports, contenus chacun dans une part, font que G est vrai sur Q × R. Sur chaque paire profonde, le premier ET exposé vrai reçoit G par au moins un opérande via des OU. Il ne peut le recevoir par les deux, car il accepterait alors tout Q × R. L’autre opérande reçoit une entrée x active sur la paire, et x avec G suffit à faire accepter la paire. Ainsi chaque arête profonde a au moins un sommet incident à tous les sommets profonds de l’autre part. Appelons ces sommets universels dans Q × R.

Il existe un point universel et une droite universelle. S’il n’y en avait que dans une part, l’absence de cycle de longueur quatre en autoriserait au plus un, dont le degré est inférieur à cinq. Pour la même raison de degré, on a besoin d’un ET exposé qui impose un point universel comme entrée x, et d’un autre qui impose une droite universelle. G doit donc être faux sur un singleton de chaque part, sinon l’un de ces ET exposés accepterait ce singleton. Ses deux supports ne peuvent être tous deux formés de points ou tous deux de droites, car G serait alors vrai sur tous les singletons profonds de cette part. Ils sont de parts opposées.

Le support de points de G contient tout Q. Comme Q a au moins deux éléments, ce support appartient à un OU compté dans les voisins d’un centre droite A. La droite A est incidente à tout Q. Elle doit coïncider avec la droite universelle, car deux droites ne peuvent avoir deux points communs. Or le support du OU compté ne contient que des voisins peu profonds de A. La droite universelle porte au moins une arête profonde. Son point appartient à Q, donc au support de ce OU. Contradiction.

### Centres et orbites

Il faut au moins huit centres distincts pour couvrir 31 arêtes. Avec huit centres dont au moins deux points, la somme de leurs degrés est au plus 30. Avec sept centres droites et un centre point, les deux droites sans centre n’ont au plus que deux arêtes peu profondes fournies par ce point. Elles porteraient au moins six arêtes profondes. Avec huit centres, il faut donc huit droites, et la droite sans centre porte quatre arêtes profondes. Cela impose la répartition 4 + 1.

Avec neuf centres distincts, si r sont des points, les r droites sans centre doivent recevoir au moins 4r − 5 incidences des points centres. Le degré trois des points impose r ≤ 5. Chaque droite sans centre portant d points centres fournit C(d, 2) paires distinctes. Puisque C(d, 2) ≥ 2d − 3 pour tout entier d, il faut au moins 5r − 10 paires parmi les C(r, 2) disponibles. Cela exclut r = 3, 4, 5. Pour r = 2, les deux droites sans centre reçoivent au plus trois incidences des deux points, faute de cycle de longueur quatre. On doit réaliser ces trois incidences, donnant deux arêtes profondes sur une droite et trois sur l’autre. Avec un seul centre point, la droite sans centre porte au moins trois arêtes profondes. Les répartitions dont le maximum est deux imposent donc neuf centres droites.

Les 376 992 ensembles de cinq arêtes se réduisent à 964 orbites sous les 432 automorphismes de l’incidence affine. Une énumération indépendante par applications affines inversibles sur F₃² donne les mêmes totaux.

| Arêtes profondes par droite | Ensembles | Orbites |
| --- | ---: | ---: |
| 4 + 1 | 288 | 2 |
| 3 + 2 | 1 728 | 6 |
| 3 + 1 + 1 | 16 128 | 47 |
| 2 + 2 + 1 | 36 288 | 97 |
| 2 + 1 + 1 + 1 | 193 536 | 472 |
| 1 + 1 + 1 + 1 + 1 | 129 024 | 340 |
| **Total** | **376 992** | **964** |

Le catalogue indique aussi les orbites où chaque arête a un sommet universel dans Q × R. Il n’y en a que trois. C’était une restriction intermédiaire pour dix ET productifs, avant l’exclusion complète de ce cas.

```sh
node frontiere.cjs five-deep-orbits
AFFINE_COMPACT_ROWS=1 AFFINE_COMPACT_DEPTH=1 AFFINE_MIN_DEEP_EDGES=5 AFFINE_DEPTH_EQUALITY=1 \
  AFFINE_DEPTH_MAX_NINE=1 AFFINE_DEEP_ORBIT=all \
  node frontiere.cjs build affine43-cinq-neuf-productifs-all.cnf 43 197 ordered
kissat --time=80 affine43-cinq-neuf-productifs-all.cnf
```

`AFFINE_DEEP_PARTITION=4+1` ou `AFFINE_DEEP_PARTITION=3+2` limite la recherche aux orbites de cette répartition. Avec les orbites activées, le générateur impose au moins neuf ET productifs pour chaque répartition autre que 4 + 1.

Les trois premiers essais sur exactement cinq arêtes profondes ont rendu UNKNOWN après 85 secondes, avec toutes les orbites puis avec les seules répartitions 4 + 1 et 3 + 2. Les trois essais avec le plafond de neuf ET productifs ont donné le même verdict après 80 secondes. Le contrôle à 46 portes, exact et à cinq arêtes profondes, a été accepté. En scindant deux termes peu profonds, on obtient un témoin exact à 48 portes avec le même profil et dix ET productifs. Il a été accepté avec les plafonds relâchés, puis rejeté lorsque le seul plafond de neuf ET productifs a été rétabli.

## Cinq arêtes profondes, au plus deux par droite

Dans les répartitions 2 + 2 + 1, 2 + 1 + 1 + 1 et 1 + 1 + 1 + 1 + 1, les neuf ET productifs ont pour centres les neuf droites. Cette section montre qu’il y a **exactement deux ET internes et aucun ET exposé non productif**. Il y a donc onze ET au total dans ces 909 orbites.

On a m = 31, t = 9 et t + h ≤ 11. Il suffit d’exclure h = 1. Notons G l’unique ET interne. L’ensemble U contient au moins 39 + u portes. Les supports des fils dans U sont vides ou constitués seulement de points. Les seuls supports de droites auxquels on peut accéder sans porte hors de U sont les entrées primaires, chacune avec un singleton. Pour chaque arête profonde, G est le premier ET vrai. Le premier ET exposé vrai E reçoit G par un chemin de OU sur au moins un opérande, faute de quoi l’arête serait peu profonde. L’autre opérande reçoit G ou l’une des deux entrées actives. Les ET exposés antérieurs sont faux sur cette paire.

Si G est vrai sur le singleton q d’une arête profonde {q, L}, alors E reçoit L sur l’autre opérande. En effet, E est faux sur le singleton q. Son opérande qui y est faux ne peut recevoir ni G, ni q par un chemin de OU. Il reçoit donc L sur la paire. Par conséquent, pour toute droite L d’une telle arête, G avec L suffit à faire accepter la paire.

### Aucune porte OU hors de U en amont de G

Dans ce cas, les deux opérandes de G ont des supports faits de points. Un support singleton droite ne pourrait pas rencontrer les arêtes de plusieurs droites. Chaque support contient tous les points des arêtes profondes. G est vrai sur chacun de leurs singletons. Le circuit accepterait alors toutes les paires formées d’un point profond et d’une droite profonde, par l’observation sur E. Il y a au moins deux sommets de chaque part et ce graphe est sans C₄.

### Un ET exposé non productif

On a u ≤ 1 d’après la borne sur le nombre total de ET. Si u = 1 et qu’il y a au moins un OU hors de U en amont de G, le budget impose |U| = 40 et un seul tel OU S₁. Il ne reste aucune place pour un OU qui transmette G en aval en dehors de U. Un OU de U ne peut lire G directement, puisqu’il ajouterait un terminal vide au budget de ses voisins, déjà saturé. Aucun ET productif ne peut donc recevoir G sur une arête profonde. L’unique ET exposé non productif doit accepter les cinq arêtes profondes et lire directement G.

Le support de S₁ contient au plus deux droites, puisqu’il ne peut réunir que deux signaux issus de U ou d’entrées primaires. On prend une arête profonde {q, L} dont la droite L est en dehors de ce support. Une telle arête existe car les cinq arêtes occupent au moins trois droites. Les opérandes de G doivent être vrais sur les cinq paires par leurs supports. Aucun ne peut être une entrée primaire droite, donc chacun est vrai sur le singleton q, qu’il provienne d’un support de points ou de S₁. De même le second opérande de l’ET exposé non productif est vrai sur le singleton q. S’il est G, cela vient de ce qu’on vient de montrer. Sinon son support doit rencontrer toutes les arêtes profondes et n’est pas le singleton d’une droite. Sur {q, L}, sa valeur vraie vient donc de q. Le singleton est accepté par l’ET exposé, ce qui est impossible.

### Deux OU hors de U en amont de G

On est désormais dans u = 0. Si deux portes hors de U sont en amont de G, au plus une troisième porte hors de U reste disponible en aval. Si |U| ≥ 40, G doit être transmis par les gardes comptées dans U. À cause du budget après les deux portes en amont et G, une seule garde de centre peut gagner un terminal vide. Un seul centre ne couvre pas les cinq arêtes profondes. On a donc |U| = 39, avec un unique OU S en aval de G qui transmet G aux ET productifs. Tous les chemins de OU utiles doivent passer par S, qui a un support singleton. Un support plus grand ferait compter S dans U. Un support vide ajouterait un terminal vide dans un parcours des voisins.

Ce singleton impose à G d’être faux sur tous les singletons profonds des deux parts. Si S a pour support un point p, il alimente les gardes des centres droites, donc toutes les droites profondes contiennent p, qui est distinct de leurs points profonds. Sur toutes les paires, G vrai avec une droite profonde suffit à faire accepter la paire. G est donc faux sur le singleton de chaque droite profonde. G doit aussi être faux sur le singleton de chaque point profond, car ce point n’est incident qu’à une des droites profondes. Si S a pour support une droite A, il alimente un opérande de centre A et les points des arêtes profondes sont sur A. Leurs propres droites sont différentes de A, car le support de voisins du terme centré sur A donne des arêtes peu profondes sur A. L’argument précédent s’applique en échangeant les points et les droites.

Évalué sur les arêtes profondes ou sur leurs singletons, G est la conjonction de ses supports d’opérandes. Si les deux supports sont homogènes, chacun contient tous les sommets profonds de sa part. Leur conjonction est vraie sur toutes les paires entre points et droites profonds, ce qui est interdit avec le seul signal de transmission S. Supposons donc qu’il y ait un support mixte parmi les deux. Aucun opérande de G ne peut alors contenir seulement des droites. Il lui faudrait au moins trois droites, ce qui demanderait déjà les deux OU hors de U pour réunir trois entrées primaires droites, sans produire de support mixte. Les deux supports d’opérandes de G contiennent ensemble au plus deux droites. En effet, avec deux OU supplémentaires on peut joindre un support de points à deux entrées droites, ou créer deux supports mixtes comportant une droite chacun. Sur une arête profonde {q, L} où L n’est dans aucun des deux supports, G est donc vrai sur le singleton q. Cela contredit la contrainte imposée par S.

### Un seul OU hors de U en amont de G, sans ET exposé non productif

Soit S₁ cet OU. Il ne peut y avoir en amont un support fait uniquement de droites et contenant les au moins trois droites profondes. Si G n’a aucun opérande de support mixte, ses deux supports contiennent donc tous les points profonds, et le cas sans OU en amont a déjà donné la contradiction. Un support mixte, celui de S₁, contient des points et une unique droite L₀.

Soient Q' et R' les ensembles de points et de droites des arêtes profondes hors de L₀. Sur ces arêtes, les deux opérandes de G doivent être vrais grâce à q, donc G est vrai sur chaque singleton de Q'. Comme E doit recevoir la valeur de sa droite sur l’opérande qui ne reçoit pas G, le circuit accepterait toutes les paires Q' × R'. On a |R'| ≥ 2. L’absence de C₄ donne Q' = {p} pour un certain point p. Comme chaque droite porte au plus deux arêtes profondes, au moins trois arêtes sont hors de L₀. Elles sont toutes incidentes à p, qui est de degré trois, donc il y en a exactement trois, sur trois droites distinctes. Les deux autres arêtes profondes sont sur L₀.

Si un seul opérande de G est S₁, l’autre provient d’une entrée primaire ou d’un garde compté de centre droite. Son support de points devrait contenir les deux points profonds de L₀. Une telle garde ne peut contenir deux points de L₀ que si son centre est L₀, auquel cas ces deux arêtes seraient peu profondes. L’entrée primaire seule ne peut pas non plus fournir les deux points.

Il reste le cas où les deux opérandes de G sont S₁. G est alors vrai sur le singleton L₀. Sur chacune des deux arêtes profondes de L₀, E doit obtenir son point q d’un opérande faux sur le singleton L₀, et G via l’autre. Un terme centré sur L₀ ne convient pas. L’opérande de centre y serait vrai sur le singleton L₀, et l’obligation de recevoir q dans le support de voisins rendrait l’arête peu profonde. Il faut donc deux centres calculés de support singleton droite, distincts puisque deux points de L₀ ne peuvent pas être voisins d’une même autre droite. Ces deux OU épuisent les portes disponibles. Ainsi |U| = 39 et aucun OU de U ne peut lire G directement, car ce serait un terminal vide supplémentaire.

Considérons maintenant une arête profonde hors de L₀. Son point est p et G est vrai sur le singleton p. Le premier E doit donc recevoir son entrée droite sur un opérande et G sur l’autre. Comme les centres sont tous des droites, il doit recevoir G dans la garde constituée de points. Ni les OU comptés dans U ni les deux OU de centre de support droite ne peuvent lui transmettre G. Cette dernière possibilité est exclue.

Ainsi h = 2. Le nombre total de ET étant au plus onze, les neuf ET productifs et ces deux ET internes utilisent tout ce budget.

```sh
AFFINE_COMPACT_ROWS=1 AFFINE_COMPACT_DEPTH=1 AFFINE_MIN_DEEP_EDGES=5 AFFINE_DEPTH_EQUALITY=1 \
  AFFINE_DEPTH_MAX_NINE=1 AFFINE_DEEP_ORBIT=all AFFINE_FIVE_WIDE=1 \
  node frontiere.cjs build affine43-cinq-deux-internes-all.cnf 43 197 ordered
kissat --time=85 affine43-cinq-deux-internes-all.cnf
```

L’option `AFFINE_FIVE_WIDE=1` sélectionne les orbites où chaque droite porte au plus deux arêtes profondes. Elle impose deux ET internes et un ET productif centré sur chacune des neuf droites. On peut la combiner avec `AFFINE_DEEP_PARTITION` pour cibler une répartition.

Les trois essais ont donné UNKNOWN avec une limite de 85 secondes chacun. Ils couvrent l’ensemble des 909 orbites, puis séparément les répartitions sur trois et cinq droites. Pour le contrôle, un circuit exact à 48 portes a été construit avec un ET interne commun à trois arêtes autour d’un point et un autre ET interne pour deux arêtes sur une quatrième droite. Après renumérotation sur son orbite, il a été accepté. En recopiant un ET interne, on obtient un circuit exact à 49 portes avec le même profil d’arêtes, mais trois ET internes. Il a été rejeté même en relâchant les plafonds du nombre total de ET et de t + h.

## Exclusion certifiée de neuf centres droites

Une [projection SAT et ses certificats vérifiés](PROJECTION_CINQ.md) excluent les 909 orbites de cinq arêtes profondes où chaque droite porte au plus deux de ces arêtes. Elle exclut aussi les neuf centres droites pour les répartitions 3 + 2 et 3 + 1 + 1. Il reste 55 orbites pour exactement cinq arêtes profondes. Les 53 orbites de types 3 + 2 et 3 + 1 + 1 exigent au moins un centre point. Le cas à 43 portes reste ouvert.

## Au moins six arêtes profondes

La [projection SAT étendue](PROJECTION_CINQ.md) couvre les 55 dernières orbites de cinq arêtes profondes, y compris les centres points et les centres répétés. Les 18 nouvelles formules sont insatisfiables et chacune a un certificat DRAT vérifié. Avec les exclusions antérieures, **un circuit affine exact à 43 portes doit avoir au moins six arêtes profondes parmi les 36**. Le premier essai SAT avec cette borne a donné UNKNOWN après 75 secondes. Le circuit exact à 44 portes reste le meilleur témoin disponible.

## Cas de six arêtes profondes

Avec exactement six arêtes profondes, m = 30. Le comptage d’une unité supplémentaire donne t + h ≤ 12 et t ≥ 8. En comptant aussi les ET exposés non productifs, on a t + h + 2u ≤ 14. Il en résulte h ≤ 4 et **au plus douze ET au total**.

En effet, pour dépasser douze ET, il faudrait u = 1 et t + h = 12. À 43 portes, le comptage sature alors le budget. Il ne laisse aucun OU projeté hors du comptage de la sortie et des gardes. Aucun OU compté dans une garde ne peut lire un ET interne. Si c’était le cas, un terminal de support vide ajouterait une porte au comptage. Aucun ET productif ne peut donc être le premier ET exposé vrai sur une arête profonde, puisqu’un tel terme devrait recevoir la valeur d’un ET interne par un chemin de OU. L’unique ET exposé non productif est le premier ET exposé vrai sur chacune des six arêtes profondes.

Après suppression des ET exposés en amont, on remonte ses opérandes à travers les ET internes. Le résultat est une conjonction de signaux dont chacun est une entrée primaire ou un OU compté. Les OU exposés réduits à zéro ne peuvent fournir aucun des signaux vrais de cette conjonction. Les autres OU ne reçoivent aucun ET interne. Chacun des signaux est donc vrai sur les six arêtes grâce à son support, qui appartient à une seule part. Il s’ensuit qu’il contient tous les sommets profonds de sa part. Le circuit accepterait toutes les paires formées d’un point profond et d’une droite profonde. Les deux parts ont au moins deux sommets profonds puisque le degré maximal est quatre. Le graphe est sans cycle de longueur quatre, d’où la contradiction.

Le catalogue des six arêtes contient 4 740 orbites sous les 432 automorphismes de l’incidence affine. Une construction indépendante avec les applications affines inversibles de F₃² a donné les mêmes tailles d’orbites pour chaque répartition.

| Arêtes profondes par droite | Ensembles | Orbites |
| --- | ---: | ---: |
| 4 + 2 | 432 | 2 |
| 4 + 1 + 1 | 4 032 | 14 |
| 3 + 3 | 576 | 4 |
| 3 + 2 + 1 | 48 384 | 116 |
| 3 + 1 + 1 + 1 | 129 024 | 324 |
| 2 + 2 + 2 | 18 144 | 58 |
| 2 + 2 + 1 + 1 | 435 456 | 1 056 |
| 2 + 1 + 1 + 1 + 1 | 967 680 | 2 302 |
| 1 + 1 + 1 + 1 + 1 + 1 | 344 064 | 864 |
| **Total** | **1 947 792** | **4 740** |

### Projection avec neuf termes centrés sur des droites

Dans ce sous-cas t = 9 et chaque terme est centré sur une droite distincte. La garde de chaque droite contient donc exactement ses voisins peu profonds. Le même raisonnement que pour la [projection à cinq arêtes](PROJECTION_CINQ.md) donne un budget de 5 − h − 2u pour la somme du nombre de OU projetés et du nombre de terminaux vides comptés par centre. Les répartitions qui contiennent un 4 sont impossibles dans ce sous-cas, car une droite sans incidence peu profonde ne peut centrer un terme productif. Les 4 724 autres orbites sont prises en charge par le sélecteur `all` du générateur de projection lorsqu’il reçoit le catalogue à six arêtes.

Le générateur de projection est conservé sous son nom historique. Le nombre d’arêtes est lu dans le catalogue. Les modes à centres points ou répétés restent spécifiques au catalogue de cinq arêtes. Pour le contrôle positif à six arêtes, deux ET internes calculent les deux groupes de trois incidences profondes, avec quatre OU projetés. Chacune des deux gardes concernées reçoit l’un des ET comme terminal de support vide. Le contrôle avec un budget de six est satisfaisable.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
node projection-cinq.cjs orbites-six.json 3+3 projection-33-h2.cnf 3 2 0
kissat --time=45 projection-33-h2.cnf projection-33-h2.drat
drat-trim projection-33-h2.cnf projection-33-h2.drat
```

Les trois arguments après le nom du CNF sont le budget, le nombre de ET internes h et le nombre de ET exposés non productifs u. Pour reproduire un lot de la répartition 2 + 2 + 2, filtrer les représentants du catalogue sur cette répartition, puis prendre les huit entrées consécutives du lot dans l’ordre du catalogue, ou les deux dernières pour le lot 8. Écrire ces entrées dans un objet JSON dont la clé est `representatives`. Le lot utilise le budget 3 avec h = 2 et u = 0.

### Quand huit centres distincts sont possibles

Il faut au moins huit centres distincts pour couvrir les 30 arêtes peu profondes. Avec huit centres dont r points, la somme des degrés vaut 32 − r, donc r ≤ 2. Si r = 2, il y a trois droites sans centre. Elles portent au total douze incidences, dont au moins six doivent être couvertes par les deux points centres. Ces deux points devraient appartenir à chacune des trois droites, ce qui est impossible.

Si r = 1, les deux droites sans centre ont chacune au moins trois arêtes profondes. Les six arêtes profondes sont donc réparties 3 + 3, et les deux incidences peu profondes passent par l’unique point centre. Si r = 0, l’unique droite sans centre porte quatre arêtes profondes. La répartition est nécessairement 4 + 2 ou 4 + 1 + 1. **En dehors de ces trois répartitions, il faut au moins neuf centres distincts.**

### Résultats certifiés à six arêtes

Les 29 essais et leurs empreintes figurent dans le [registre de projection](certificats-projection-six.tsv). Les 21 verdicts UNSAT ont chacun un certificat DRAT vérifié. Les huit autres recherches ont atteint leur limite de temps. Les formules de groupe ont utilisé 45 secondes, et les lots de 2 + 2 + 2 ont utilisé 55 secondes.

- Parmi les 4 724 orbites compatibles avec neuf centres droites, les six couples (h, u) autres que (2, 0) sont exclus par les certificats de groupe. Il faut donc exactement deux ET internes et aucun ET exposé non productif dans ce sous-cas.
- La formule de groupe pour (2, 0) a donné UNKNOWN. Les quatre orbites 3 + 3 sont néanmoins exclues par leur formule dédiée. Dans la répartition 2 + 2 + 2, les lots 2 et 8 certifient l’exclusion de dix des 58 orbites. Les six autres lots, soit 48 orbites, restent sans verdict dans ce profil.
- Les autres arrangements des centres doivent encore être traités. Le seuil de 43 portes reste ouvert.

Les 28 CNF des certificats antérieurs à cinq arêtes gardent exactement les mêmes empreintes après cette extension.

### Au moins un OU projeté pour la répartition 2 + 2 + 2

On reste dans le sous-cas avec neuf centres droites, deux ET internes et aucun ET exposé non productif. Pour la répartition 2 + 2 + 2, il faut **au moins un OU projeté** parmi les portes qui échappent au comptage des gardes et de la sortie.

Supposons qu’il n’y en ait aucun. Chaque opérande de centre est alors son entrée primaire de droite. Après la suppression des ET exposés, chaque fil est une entrée primaire, un des deux ET internes, ou un OU déjà compté. Les OU exposés s’annulent. Un OU de garde s’aplatit en un OU d’entrées primaires de points et d’éventuels ET internes antérieurs. En particulier, le seul moyen de lire une entrée primaire droite dans un ET interne est de la prendre directement comme opérande.

Appelons G puis H les ET internes dans l’ordre topologique. Sur les affectations formées d’un point et d’une droite, le profil de G est soit le même sur toutes les droites, soit nul en dehors d’une seule droite. Cela vient du fait que chaque opérande de G est une disjonction de points, une entrée droite ou zéro. Pour H, un opérande qui est directement une entrée droite donne aussi un profil nul en dehors d’une droite. Sinon, ses deux opérandes sont des fonctions du point et de G seulement. Le profil de H est constant d’une droite à l’autre si celui de G l’est. Si G est nul en dehors d’une droite L, le profil de H est constant en dehors de L, et son ensemble de points acceptés sur L contient l’ensemble de points accepté sur chacune des autres droites, par monotonie. Ainsi, pour chaque ET interne, les ensembles de points acceptés sur deux droites quelconques sont comparables par inclusion.

Les trois droites portant des arêtes profondes doivent chacune lire au moins un ET interne dans leur garde. En effet, une garde qui n’en reçoit aucun ne peut que lire ses points peu profonds. Les ET internes ont un support vide. Les trois lectures épuisent donc les trois unités du budget des terminaux vides, et chacune des trois gardes reçoit exactement un des ET internes. L’un de ces deux ET doit servir deux droites. Sur chacune il doit fournir les deux points profonds. Les deux ensembles de points qu’il rend vrais sont comparables, et chacun doit être inclus dans les points de la droite correspondante pour que le circuit soit exact. Le plus petit des deux ensembles contient donc au moins deux points communs à ces droites. Le graphe affine exclut cette possibilité. Il faut donc au moins un OU projeté.

L’option `AFFINE_PROJECTED_OR_MIN=1` impose cette contrainte dans la projection. Par défaut elle est désactivée, ce qui conserve les formules historiques. Elle doit être utilisée uniquement dans un sous-cas où la borne est démontrée.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
AFFINE_PROJECTED_OR_MIN=1 node projection-cinq.cjs orbites-six.json 2+2+2 projection-222.cnf 3 2 0
kissat --time=60 projection-222.cnf projection-222.drat
```

On peut aussi fixer exactement un OU projeté avec `AFFINE_PROJECTED_OR_MIN=1 AFFINE_PROJECTED_OR_MAX=1`, ou examiner le cas complémentaire avec `AFFINE_PROJECTED_OR_MIN=2`. Ces deux recherches sont des sous-cas complémentaires de la formule précédente.

### Rejouer les projections à orbite fixée

Le script de vérification accepte maintenant `--six` pour la répartition 2 + 2 + 2, avec deux ET internes, aucun ET exposé non productif et un budget de trois.

```sh
python3 verifier-projection-cinq.py /chemin/kissat --six --jobs 8 --time 60 \
  --checker /chemin/drat-trim --certify all
```

Sans argument `--orbits`, cette commande examine les 58 représentants. Pour ne rejouer que certains cas, passer leurs numéros du catalogue séparés par des virgules à `--orbits`. La numérotation commence à un.

Les 48 représentants laissés ouverts par les lots de la recherche précédente ont chacun donné UNSAT à orbite fixée et leur trace DRAT a été vérifiée. Deux représentants ont nécessité un second essai, avec une limite de 85 secondes après les 22 secondes du premier passage. Les dix autres représentants étaient déjà exclus par les lots 2 et 8. La répartition 2 + 2 + 2 est donc entièrement exclue pour neuf centres droites. Avec les quatre orbites 3 + 3 exclues précédemment, cela laisse **4 662 des 4 724 orbites** dans ce sous-cas.

Les options de projection, les limites, les numéros d’orbite et les empreintes figurent dans le [registre de cette recherche](certificats-projection-six-222.tsv). Les empreintes CNF des 48 formules à orbite fixée ont été contrôlées par régénération.

Les deux formules groupées, avec exactement un OU projeté puis avec au moins deux, ont aussi donné UNSAT avec des traces DRAT vérifiées. Ces deux certificats et la preuve qui exclut zéro OU projeté forment une seconde vérification de l’exclusion des 58 orbites. La formule groupée initiale qui imposait seulement au moins un OU a atteint sa limite de temps.

Le cas à 43 portes reste ouvert, notamment pour les autres répartitions et pour les circuits dont les centres diffèrent de ce sous-cas.

### Un OU projeté est aussi nécessaire dans les répartitions restantes

On garde les neuf centres droites, les deux ET internes G et H et le budget de trois. Sans OU projeté, chaque centre lit sa droite primaire et chaque droite profonde doit dépenser au moins une unité de budget pour un ET interne dans sa garde. Quatre droites profondes ou plus sont donc incompatibles avec zéro OU projeté.

Dans la répartition 3 + 2 + 1, chacune des trois droites doit utiliser exactement un ET interne. Appelons G le premier selon l’ordre topologique. Avec zéro OU projeté, G a le même ensemble de points acceptés sur chaque droite ou vaut zéro en dehors d’une droite L. Si G est constant d’une droite à l’autre, H est lui aussi constant d’une droite à l’autre ou limité à une seule droite. Puisque le graphe n’a pas de cycle de longueur quatre, un signal constant pouvant servir deux droites contient au plus un point accepté. Deux ET internes ne peuvent alors servir trois droites dès lors que deux de ces droites ont plusieurs arêtes profondes.

Si G est limité à L, le seul partage possible entre droites est celui de H. Si H ne lit pas directement d’entrée droite, ses profils sur les droites autres que L sont identiques, et celui sur L les contient. S’il lit directement une entrée droite, il ne peut servir qu’une droite. Deux gardes distinctes sur des droites autres que L ne peuvent partager un profil identique avec plusieurs points. Elles ne peuvent pas non plus toutes les deux n’exiger qu’un point profond, car la répartition ne comporte qu’une droite de ce type. Le partage devrait donc impliquer L, alors que le troisième terme ne peut recevoir que G, qui ne sert aucune autre droite. Cela exclut zéro OU projeté.

On peut donc lancer, pour chaque répartition restante dans ce sous-cas, deux recherches exhaustives dans la projection. La première impose un OU projeté, la seconde en impose au moins deux.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
AFFINE_PROJECTED_OR_MIN=1 AFFINE_PROJECTED_OR_MAX=1 \
  node projection-cinq.cjs orbites-six.json 3+2+1 projection-321-un.cnf 3 2 0
AFFINE_PROJECTED_OR_MIN=2 \
  node projection-cinq.cjs orbites-six.json 3+2+1 projection-321-plusieurs.cnf 3 2 0
```

L’option facultative `AFFINE_PROJECTED_CANONICAL=1` place les emplacements désactivés à la fin et ordonne les deux catégories d’opérandes d’une porte projetée. Un emplacement désactivé vaut zéro. On peut remplacer toute lecture de cet emplacement par zéro puis déplacer les emplacements désactivés après les portes actives. L’ordre des catégories d’opérandes se fait ensuite par commutativité. Ces contraintes préservent la satisfiabilité de la projection.

### Nombre de termes productifs et choix des centres

Avec six arêtes profondes, il y a au plus dix ET productifs. En effet, t + h ≤ 12 et h ≥ 1 donnent t ≤ 11. Si t = 11, on aurait h = 1 et u = 0 puisque le nombre total de ET est au plus douze. Le niveau de budget est alors exactement celui de la preuve dans [Dix termes productifs sont impossibles](#dix-termes-productifs-sont-impossibles), pour cinq arêtes profondes. Cette preuve utilise m + t = 41, h = 1, u = 0, et un nombre d’arêtes profondes supérieur au degré maximal. Elle s’applique donc ici avec m = 30 et t = 11. En détail, les deux parts des sommets profonds ont encore chacune au moins deux éléments, un seul centre ne couvre encore pas toutes les arêtes profondes, et un seul sommet universel ne peut les couvrir non plus. Les contradictions par cycle de longueur quatre et par support de voisins peu profonds sont inchangées.

Si le circuit a exactement neuf ET productifs et si la répartition est 2 + 2 + 1 + 1, 2 + 1 + 1 + 1 + 1 ou 1 + 1 + 1 + 1 + 1 + 1, ses centres sont nécessairement les neuf droites. En effet, le résultat sur huit centres impose au moins neuf centres distincts pour ces répartitions. Supposons que r d’entre eux soient des points. Les r droites sans centre portent au moins 4r − 6 arêtes peu profondes, fournies par ces points. Comme chaque point fournit au plus trois arêtes, on a r ≤ 6. Sur une droite qui contient d des points centres, il y a C(d, 2) paires parmi ces points. Les paires comptées sont disjointes d’une droite à l’autre. En utilisant C(d, 2) ≥ 2d − 3, il faut donc au moins 5r − 12 paires, parmi C(r, 2) possibles. Pour r = 4, 5 ou 6, c’est impossible.

Si r = 3, l’égalité dans le comptage impose exactement six incidences peu profondes sur les trois droites sans centre. Comme chacune porte au plus deux arêtes profondes, il faut deux arêtes profondes sur chacune. Cela donne 2 + 2 + 2. Si r = 2, deux droites sans centre ne peuvent recevoir que trois incidences des deux points centres, sinon elles partageraient deux points. L’une doit donc porter au moins trois arêtes profondes. Si r = 1, la seule droite sans centre porte au moins trois arêtes profondes. Ces cas excluent tout centre point pour les trois répartitions annoncées.

### Dix centres distincts pour six droites profondes

Lorsque chaque arête profonde occupe une droite différente et que dix termes ont des centres distincts, le nombre r de centres points appartient à {1, 9, 10}. Cette contrainte est purement géométrique.

Les r − 1 droites sans centre portent chacune au moins trois arêtes peu profondes, donc contiennent au moins trois points centres. Elles nécessitent au moins 3(r − 1) paires différentes de points centres parmi C(r, 2). Cela exclut r de 2 à 5. Pour r = 6, on aurait exactement trois points centres sur chacune des cinq droites sans centre et toutes les paires y apparaîtraient. Pour chaque point centre, ses cinq partenaires devraient alors être distribués en groupes de deux, ce qui est impossible. Le cas r = 0 est impossible avec dix centres distincts et neuf droites.

Posons q = 12 − r, le nombre de points sans centre. Comme chacun de ces points est de degré trois, au moins 3q − 6 de leurs incidences doivent aboutir à une droite centre. Il y en a q − 2. Pour r = 7 ou 8, deux telles droites se partagent au plus un point. Par conséquent, un total d’incidences sur ces droites ne peut dépasser q + C(q − 2, 2). En effet, chaque occurrence répétée d’un point correspond à au moins une paire de droites le contenant. Pour q = 5 ou 4, cette borne est inférieure à 3q − 6. Pour r = 9, les trois points sans centre appartiennent tous à l’unique droite centre, puisqu’il faut au moins trois incidences de ce type. Pour r = 10, les deux points sans centre n’ont aucune droite en commun, faute de quoi cette droite aurait deux arêtes profondes.

### Exclusion des neuf centres droites à six arêtes

Les certificats par répartition excluent les 116 orbites 3 + 2 + 1, les 324 orbites 3 + 1 + 1 + 1, les 1 056 orbites 2 + 2 + 1 + 1, les 2 302 orbites 2 + 1 + 1 + 1 + 1 et les 864 orbites 1 + 1 + 1 + 1 + 1 + 1 dans le profil à deux ET internes et aucun ET exposé non productif. Avec les exclusions antérieures, cela ferme **les 4 724 orbites possibles avec neuf centres droites**. Les 16 autres orbites ont une droite sans incidence peu profonde, donc ne peuvent avoir les neuf droites pour centres.

Pour les répartitions 2 + 2 + 1 + 1, 2 + 1 + 1 + 1 + 1 et 1 + 1 + 1 + 1 + 1 + 1, on en déduit qu’un circuit exact à 43 portes devrait avoir **exactement dix ET productifs**. Avec exactement une arête profonde par droite, ces dix termes doivent soit avoir neuf centres droites dont un répété, soit avoir dix centres distincts dont un, neuf ou dix points.

Le [registre des formules et des traces](certificats-projection-six-repartitions.tsv) indique pour chaque essai la répartition, le nombre d’orbites, les bornes du nombre de OU projetés et les empreintes. Chaque formule utilise un budget de trois avec deux ET internes et aucun ET exposé non productif. Le contrôle à budget relâché de la répartition 3 + 3 reste satisfaisable avec l’option canonique, après échange des opérandes pour suivre l’ordre imposé. Les déclarations d’insatisfiabilité des cinq nouvelles répartitions couvrent les deux tranches du nombre de OU et ont chacune été soutenues par une trace DRAT vérifiée.

Les onze certificats par répartition suffisent à cette exclusion. Le registre conserve aussi un essai global redondant sur la tranche à au moins deux OU projetés. Kissat y a rendu UNSAT, et son certificat est indiqué séparément s’il a été vérifié.

### Six arêtes sur six droites et dix ET productifs

On considère seulement la répartition 1 + 1 + 1 + 1 + 1 + 1. La nécessité de dix termes productifs a aussi été démontrée pour 2 + 2 + 1 + 1 et 2 + 1 + 1 + 1 + 1. Elle ne s’étend pas à toutes les répartitions sur quatre droites. En particulier, le cas 3 + 1 + 1 + 1 avec neuf centres dont un point reste à traiter.

Les dix termes ont au moins neuf centres distincts. Avec neuf, ce sont les neuf droites, et l’une est le centre de deux termes. Avec dix, les centres comprennent un, neuf ou dix points. Ces quatre cas sont pris en charge par les modes `ten-repeat`, `ten-one`, `ten-nine` et `ten-points` de la projection. S’il y a une droite répétée, les deux termes peuvent avoir des gardes et des opérandes de centre différents. Comme dans la projection précédente, le calcul des gardes compte une seule fois, pour cette droite, un terminal de support vide qu’elles partagent.

Pour t = 10, on a t + h ≤ 12, h ≥ 1 et t + h + u ≤ 12. Il reste donc trois couples (h, u). Le budget disponible pour les OU projetés et les terminaux vides est 4 − h − 2u. Le calcul reprend le parcours de gardes par centre avec m = 30. Il s’applique aussi à la droite répétée en prenant ensemble ses deux racines.

| ET internes h | ET exposés non productifs u | Budget |
| ---: | ---: | ---: |
| 1 | 0 | 3 |
| 1 | 1 | 1 |
| 2 | 0 | 2 |

L’option `AFFINE_TEN_EXPLICIT_LAYOUT=1` peut réduire le catalogue pour les modes à neuf ou dix centres points. Dans `ten-nine`, les trois points sans centre sont sur l’unique droite centre. Leurs six incidences aux autres droites sont profondes. Le profil profond fixe donc ces trois points et la droite centre. Dans `ten-points`, le profil profond est l’union exacte des deux étoiles des points sans centre. Puisque les six incidences occupent des droites distinctes, ces deux points n’ont aucune droite commune. Dans les deux cas, la projection peut éliminer les représentants incompatibles et déduire les centres à partir du profil profond. Le catalogue laisse exactement une orbite dans chacun de ces deux modes.

Dans le mode `ten-repeat` avec u = 0, aucun circuit ne peut avoir zéro OU projeté. Tous les opérandes de centre seraient alors les entrées primaires de leurs droites. Chacune des six droites profondes devrait atteindre au moins un terminal de support vide dans une garde, alors que le budget est au plus trois. Une droite répétée ne réduit pas le nombre de droites distinctes à servir. Cela justifie la partition complémentaire sur le nombre de OU projetés lorsque u = 0.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
AFFINE_PROJECTED_CANONICAL=1 node projection-cinq.cjs orbites-six.json \
  1+1+1+1+1+1 projection-dix-repete.cnf 2 2 0 ten-repeat
kissat --time=125 projection-dix-repete.cnf projection-dix-repete.drat
drat-trim projection-dix-repete.cnf projection-dix-repete.drat
```

Les autres budgets, couples et modes peuvent être passés aux mêmes positions. Pour reproduire un essai limité à un nombre précis de OU projetés, définir `AFFINE_PROJECTED_OR_MIN` et `AFFINE_PROJECTED_OR_MAX` à ce nombre. Le contrôle à budget relâché accepte une projection avec dix centres points et deux termes exposés non productifs qui recopient les étoiles des deux points sans centre.

### Préfiltre géométrique pour les dix centres distincts

On a aussi énuméré les C(21, 10) ensembles de dix centres distincts, sans imposer le câblage. Pour chaque ensemble, on retire les incidences touchant au moins un de ses sommets, puis on compte les incidences restantes sur chaque droite. Le vecteur trié de ces nombres doit être dominé terme à terme par la répartition profonde triée, prolongée par des zéros. Cette condition est nécessaire puisqu’aucune arête peu profonde ne peut être couverte si ses deux sommets sont absents. Elle laisse les effectifs suivants, sans quotient par symétrie.

| Répartition | Centres points et nombre d’ensembles |
| --- | --- |
| 2 + 2 + 1 + 1 | 1 : 12, 2 : 54, 3 : 324, 4 : 432, 5 : 756 |
| 2 + 1 + 1 + 1 + 1 | 1 : 12, 2 : 54, 6 : 54, 10 : 54 |
| 1 + 1 + 1 + 1 + 1 + 1 | 1 : 12, 9 : 36, 10 : 12 |

Pour neuf centres distincts, la même condition ne laisse que l’ensemble des neuf droites dans chacune des trois répartitions. Ce préfiltre n’exige pas qu’un terme soit actif pour chaque centre sélectionné, ni que toutes les gardes puissent être calculés dans le budget. Ces effectifs concernent donc uniquement la géométrie des centres.

### Résultats certifiés avec dix termes

Les douze formules de base couvrant les quatre modes et les trois couples (h, u) sur les 864 orbites sont insatisfiables, avec leurs certificats DRAT vérifiés. Cela exclut tout circuit affine exact à 43 portes qui aurait **exactement six arêtes profondes sur six droites distinctes**.

Le [registre des preuves](certificats-projection-six-dix-termes.tsv) donne les verdicts et les empreintes pour 29 formules, dont 29 avec certificat DRAT vérifié. Chaque formule a été reproduite à l’identique. Les contrôles à budget relâché pour les modes `ten-points` et `ten-repeat` ont donné SAT. Le premier utilise deux ET exposés supplémentaires pour les deux étoiles des points sans centre. Le second utilise un terminal de support vide pour chaque droite profonde.

Pour 2 + 2 + 1 + 1, les trois certificats du mode à droite répétée sont vérifiés. Il faut donc dix centres distincts dans cette répartition.

Pour 2 + 1 + 1 + 1 + 1, les trois certificats du mode à droite répétée sont vérifiés. Il faut donc dix centres distincts dans cette répartition.

Les autres possibilités pour six arêtes profondes restent à examiner, et le cas général à 43 portes reste ouvert.

### Dix centres distincts avec six arêtes sur quatre ou cinq droites

Il reste à examiner les dix termes productifs de centres distincts dans les répartitions 2 + 2 + 1 + 1 et 2 + 1 + 1 + 1 + 1. La projection reprend le budget 4 − h − 2u et les trois couples (h, u) disponibles. Elle utilise un préfiltre par orbite pour contraindre les centres.

Pour un ensemble C de dix centres et un représentant D des six arêtes profondes, on vérifie deux conditions. Toute arête dont les deux extrémités sont hors de C doit appartenir à D. Chaque sommet de C doit aussi avoir au moins une incidence hors de D, car il doit centrer un terme productif. La routine `compatibleCenterSets` énumère les ensembles C satisfaisant ces conditions pour chaque nombre de centres points. Le générateur supprime les représentants sans ensemble compatible. Pour chaque représentant restant, il impose l’un de ses ensembles de centres compatibles. Cela conserve tous les circuits du sous-cas. Les autres contraintes de projection vérifient ensuite les gardes, les ET et le budget.

| Répartition | Centres points possibles | Orbites compatibles dans l’ordre |
| --- | --- | --- |
| 2 + 2 + 1 + 1 | 1, 2, 3, 4, 5 | 1 056, 1 056, 273, 28, 3 |
| 2 + 1 + 1 + 1 + 1 | 1, 2, 6, 10 | 2 302, 2 302, 1, 1 |

Une orbite peut être compatible avec plusieurs nombres de centres points. Ces nombres et effectifs ont été contrôlés par une seconde énumération indépendante des ensembles de centres.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
node projection-cinq.cjs orbites-six.json 2+1+1+1+1 --center-catalog
AFFINE_PROJECTED_CANONICAL=1 node projection-cinq.cjs orbites-six.json \
  2+1+1+1+1 projection-cinq-droites.cnf 2 2 0 ten-two
kissat --time=110 projection-cinq-droites.cnf projection-cinq-droites.drat
drat-trim projection-cinq-droites.cnf projection-cinq-droites.drat
```

Les modes `ten-one`, `ten-two`, `ten-three`, `ten-four`, `ten-five`, `ten-six` et `ten-points` fixent respectivement un, deux, trois, quatre, cinq, six et dix centres points, selon les modes compatibles du tableau. Le contrôle à budget relâché couvre une configuration avec dix centres points. Deux ET internes calculent les étoiles des points hors de C et deux ET exposés non productifs transmettent leurs sorties. Les six arêtes profondes occupent cinq droites, dont une partagée par les deux points. Ce contrôle a donné SAT.

Le cas de deux centres points se lit directement sur l’incidence. Il y a une droite sans centre. Ses incidences peu profondes ne peuvent provenir que de ces deux points. La droite doit donc porter exactement deux arêtes profondes, et les deux points centres sont les deux autres points de cette droite. Dans 2 + 1 + 1 + 1 + 1, cela fixe l’ensemble des centres à partir du représentant. Dans 2 + 2 + 1 + 1, chacune des deux droites doubles est candidate. Avec trois centres points dans 2 + 2 + 1 + 1, les deux droites sans centre reçoivent au plus quatre incidences des trois points centres, car elles partagent au plus un point. Ce sont donc les deux droites doubles, et leurs deux ensembles de voisins peu profonds partagent exactement un des trois points centres.

Pour la répartition 3 + 1 + 1 + 1, le même catalogue donne 324 orbites avec un centre point, 324 avec deux et 159 avec trois lorsqu’il y a dix centres distincts. Si l’on prend neuf termes productifs, leurs centres sont distincts, et un seul doit être un point. En effet, neuf centres droites ont déjà été exclus. Avec deux centres points, les deux droites sans centre devraient porter ensemble au moins cinq arêtes profondes, alors que le total des deux plus grandes parts est quatre. Avec trois centres points, l’égalité dans le comptage des paires impose deux arêtes profondes sur chacune des trois droites sans centre. Les nombres de centres points supérieurs à trois sont exclus par ce même comptage. Ainsi, avec neuf termes, la droite sans centre est celle qui porte trois arêtes profondes, et le point centre est son unique voisin peu profond.

### Exclusion des deux répartitions à dix centres distincts

Les 27 formules couvrant les neuf modes compatibles du tableau et les trois couples (h, u) sont insatisfiables. Chacune a un certificat DRAT vérifié. Le [registre des vérifications](certificats-projection-six-centres-distincts.tsv) indique le mode, le budget, le nombre de représentants et les empreintes. Toutes les formules du registre utilisent `AFFINE_PROJECTED_CANONICAL=1`. Les 29 formules de la recherche précédente gardent leurs empreintes.

Avec les exclusions antérieures des neuf termes et des centres répétés, **les répartitions 2 + 2 + 1 + 1 et 2 + 1 + 1 + 1 + 1 sont exclues** à 43 portes. Un circuit qui aurait exactement six arêtes profondes devrait les répartir sur au plus quatre droites. Sur quatre droites, seule la répartition 3 + 1 + 1 + 1 reste à examiner. Le seuil de 43 portes demeure ouvert.

### Répartition 3 + 1 + 1 + 1

Les 324 orbites doivent être réparties entre trois types de circuits. Avec neuf termes productifs, les neuf centres sont distincts. Le centre point est l’unique voisin peu profond de la droite triple, et les huit autres droites sont les autres centres. Avec dix termes et neuf centres distincts, cette même configuration est utilisée, mais un des neuf centres peut servir deux termes. Avec dix centres distincts, un, deux ou trois peuvent être des points, ce qui conserve respectivement 324, 324 et 159 orbites dans le préfiltre d’incidence.

Le générateur de projection utilise les modes `nine-one`, `ten-repeat-one`, `ten-one`, `ten-two` et `ten-three`. Dans le mode avec une répétition, la copie peut désigner une droite ou le point, et les deux gardes sont choisies séparément. Un terminal de support vide commun aux deux gardes n’est compté qu’une fois. La formule impose un budget de 14 − t − h − 2u, où t compte les ET productifs, h les ET internes et u les ET exposés non productifs.

| Termes productifs | Couples (h, u) |
| --- | --- |
| 9 | (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (3, 0) |
| 10 | (1, 0), (1, 1), (2, 0) |

Quand u = 0 et que le circuit a neuf centres distincts, il faut au moins un centre calculé. En effet, chacune des trois arêtes profondes de la droite triple a ses deux extrémités hors de l’ensemble des centres. Sur cette affectation, si tous les centres étaient des entrées primaires, aucun terme de sortie ne pourrait être vrai. On peut imposer cette condition avec `AFFINE_PROJECTED_COMPUTED_CENTER=1` pour les modes `nine-one` et `ten-repeat-one`.

```sh
node frontiere.cjs six-deep-orbits > orbites-six.json
AFFINE_PROJECTED_CANONICAL=1 node projection-cinq.cjs orbites-six.json \
  3+1+1+1 projection-3111.cnf 2 2 0 ten-repeat-one
kissat --time=240 projection-3111.cnf projection-3111.drat
drat-trim projection-3111.cnf projection-3111.drat
```

### Recherche globale par ajout de contre-exemples

Les projections par répartition ne couvrent que les circuits à exactement six arêtes profondes. La recherche directe à 43 portes repart de la frontière entière de 36 positifs minimaux et 197 maximaux négatifs, ainsi que de la condition nécessaire d’au moins six arêtes profondes. Elle ne fixe ni le nombre exact d’arêtes profondes ni leur répartition.

Le script `raffiner-affine.py` utilise cette même formulation avec un sous-ensemble de maximaux négatifs. Son échantillon initial couvre chaque paire de sommets qui n’est pas une incidence. Chaque modèle trouvé est décodé puis testé sur la frontière entière. Les maximaux négatifs violés sont ajoutés à l’itération suivante. Un candidat ne devient témoin que s’il passe toute la frontière. Cette recherche peut aussi omettre la contrainte de profondeur avec `--deep 0`, ce qui relâche la formule. Le contrôle avec le témoin fixé à 44 portes a donné SAT et zéro erreur sur la frontière entière.

```sh
python3 raffiner-affine.py /chemin/kissat sortie-raffinement --initial 24 --time 65 --rounds 4 --seed 23
```

Le dossier de sortie neuf contient les échantillons, les formules et les éventuels modèles. Un verdict UNKNOWN signifie que l’itération a atteint sa limite de temps. Lorsque Kissat rend UNSAT, le script le signale, mais ne produit pas lui-même de certificat.

Les contrôles de la projection 3 + 1 + 1 + 1 ont donné SAT pour neuf centres distincts et pour la répétition du centre point, avec un budget relâché. Les 27 empreintes des formules des deux répartitions précédentes sont inchangées.

### Comparaison des recherches directes

Le solveur sur la frontière complète, avec au moins six arêtes profondes et la graine 17, a donné UNKNOWN après 190 secondes. Les premiers essais par raffinement avec 24 et 14 négatifs ont aussi rendu UNKNOWN dès la première itération. L’essai à 14 négatifs sans contrainte de profondeur a eu le même résultat.

En désactivant la couverture initiale des paires avec `--skip-pair-cover`, le solveur a produit un modèle pour les 36 positifs et quatre négatifs. Après décodage, ce modèle échouait sur tous les 193 autres maximaux négatifs. L’ajout de ces contre-exemples est donc revenu directement à la frontière entière. L’itération suivante a donné UNKNOWN. Cette comparaison ne fournit ni un circuit exact à 43 portes ni une exclusion globale. La recherche par répartition a produit des exclusions certifiables là où ces recherches directes n’ont pas convergé.

```sh
AFFINE_MIN_DEEP_EDGES=6 AFFINE_COMPACT_ROWS=1 \
  node frontiere.cjs build global-43.cnf 43 197 ordered
kissat --time=190 --seed=17 global-43.cnf
python3 raffiner-affine.py /chemin/kissat sortie-quatre --initial 4 --time 55 --rounds 2 \
  --seed 9 --skip-pair-cover
```

### Un seul ET interne exige un OU en amont

Dans 3 + 1 + 1 + 1, un circuit à un seul ET interne G doit avoir au moins un OU projeté en amont de G. En effet, G est le premier ET vrai sur chacune des six arêtes profondes. Sans OU projeté en amont, chacun de ses deux opérandes a un support inclus dans une seule part du graphe. Une garde de points comptée contient au plus un des trois points profonds de la droite triple. Si son centre est cette droite, elle ne contient aucun de ces points. Si son centre est une autre droite, elle partage au plus un point avec la droite triple. Une entrée primaire point ne suffit pas non plus. Les deux opérandes de G doivent donc avoir des supports de droites. Chacun doit contenir toutes les droites profondes.

Ainsi G serait vrai sur chaque singleton d’une droite profonde. Sur une paire profonde (q, L), le premier ET exposé vrai doit recevoir G par un chemin de OU. Comme il rejette le singleton L, son autre opérande doit recevoir le point q sans passer par G. Les ET exposés antérieurs sont faux par choix de ce terme. Le circuit accepterait alors (q, L') pour toute droite profonde L', ce qui est impossible puisque les points ont degré trois et qu’il y a quatre droites profondes. La contrainte nécessaire est encodée par `AFFINE_PROJECTED_UPSTREAM_OR=1`, qui exige une porte OU projetée avant G dans l’ordre topologique.

### Résultats vérifiés pour 3 + 1 + 1 + 1

Les certificats excluent tous les cas avec au moins un ET exposé non productif. Ils excluent aussi trois ET internes avec neuf termes productifs. Avec neuf termes, la formule imposant un centre calculé a un certificat vérifié pour un seul ET interne. Un circuit de cette répartition à neuf termes devrait donc avoir exactement deux ET internes et aucun ET exposé non productif.

Le [registre des projections](verdicts-projection-six-3111.tsv) distingue les verdicts du solveur des traces effectivement vérifiées. Le [registre des recherches directes](verdicts-recherche-directe.tsv) donne les limites, graines et nombres de clauses. L’interruption initiale liée au dossier temporaire plein a conduit à régénérer les projections avant les essais du registre.

Un essai supplémentaire à neuf termes avec un ET interne, un centre calculé et un OU projeté en amont a donné UNKNOWN après 90 secondes. L’exclusion de ce profil repose sur le certificat de la formule plus générale qui impose seulement un centre calculé.

Les douze certificats des profils à dix termes sont vérifiés. Si un circuit à 43 portes réalise la répartition 3 + 1 + 1 + 1, il doit donc avoir neuf termes productifs et deux ET internes, sans ET exposé non productif. Kissat a rendu UNSAT aussi dans ce dernier profil, dont la trace n’était pas encore vérifiée à la publication.
