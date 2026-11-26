# Exclusion certifiée des circuits à exactement cinq arêtes profondes

Les **964 orbites** de circuits à exactement cinq arêtes profondes sont exclues à 43 portes. La première projection couvre les neuf centres droites. Son extension aux centres points et aux centres répétés couvre les 55 orbites qui restaient, à l’aide de dix-huit nouveaux certificats DRAT vérifiés.

La borne précédente excluait déjà quatre arêtes profondes ou moins. Tout circuit exact à 43 portes doit donc avoir **au moins six arêtes profondes**.

## Pourquoi la projection suffit pour l’exclusion

On utilise les notations et les contraintes démontrées dans le [README](README.md). Supposons que les neuf termes productifs aient chacun une droite distincte pour centre. Chaque terme se décompose en un opérande de centre de support singleton L et un opérande de voisins. Le support du second opérande est exactement l’ensemble des points peu profonds de L. Chaque droite a au moins une incidence peu profonde.

Sur une affectation, on évalue les opérandes de chaque ET exposé en remplaçant tous les ET exposés en amont par zéro. On prend ensuite le OU des valeurs obtenues pour les ET exposés. Le résultat est égal à celui du circuit initial. En effet, si le circuit accepte, le premier ET exposé vrai dans l’ordre topologique voit exactement les mêmes valeurs avec cette suppression. Réciproquement, remplacer des fils par zéro ne peut augmenter aucune valeur dans un circuit monotone. Les OU exposés se ramènent à zéro après cette suppression, puisqu’une entrée primaire reliée uniquement par des OU à la sortie ferait accepter un singleton.

On projette le circuit sur les ET internes et les OU qui échappent au comptage des gardes et de la sortie. Le nombre de ces OU est borné. Chaque opérande d’une porte projetée peut désigner une entrée primaire, zéro, une porte projetée antérieure ou un agrégat de voisins d’un centre droite. Un agrégat est un OU d’un sous-ensemble des points peu profonds de cette droite et de terminaux projetés de sa garde. Ce dernier choix représente tout fil d’un OU compté dans cette garde. En remontant depuis un tel OU, on aplatit tous les OU de support de taille au moins deux et on s’arrête aux entrées ou aux autres terminaux. Les fils exposés supprimés valent zéro. Les autres terminaux dynamiques sont des portes projetées. La projection permet de choisir les sous-ensembles de cet agrégat librement, ce qui peut autoriser des circuits supplémentaires et suffit pour une preuve d’insatisfiabilité.

La garde complète d’une droite est le OU de ses points peu profonds et de ses terminaux projetés. Ajouter ces points même quand ils sont fournis par un signal de support singleton ne change pas la valeur, par monotonie. Chaque terminal projeté a un support vide ou un singleton point parmi les voisins peu profonds. Le centre est soit l’entrée de droite, soit un OU projeté de support singleton de cette droite. Pour une garde de support singleton, un éventuel OU calculant toute la garde apparaît lui-même comme terminal projeté. Le modèle autorise la même écriture aplatie dans ce cas.

Soit k le nombre de points peu profonds d’une droite et e le nombre de terminaux projetés distincts de support vide utilisés dans sa garde. En remontant les OU de support d’au moins deux, on atteint au moins k + e terminaux distincts. Il en faut k pour les k points, auxquels s’ajoutent les e terminaux de support vide. Avec q OU traversés et une seule racine, il y a au plus 2q + 1 fils distincts atteints, donc q ≥ k + e − 1. Pour un support singleton, la même inégalité vaut pour le circuit extrait, car un tel opérande ne traverse aucun OU et n’a pas de terminal de support vide dans le parcours qui s’arrête à sa racine. Les OU des différentes gardes de support d’au moins deux sont disjoints, puisque deux droites ont au plus un point commun.

Il y a au moins 22 OU de voisins puisque k se somme à 31 sur les neuf droites. Il y a neuf ET productifs et au moins huit OU exposés. Chaque ET exposé non productif ajoute aussi au moins un OU exposé. Pour h ET internes et u ET exposés non productifs, il reste donc un budget de 43 − (39 + h + 2u) pour le nombre de OU projetés **plus** le nombre de terminaux de support vide comptés par ligne. La formule impose ce budget. Si u = 1, elle ajoute un terme ET exposé dont au moins un opérande a un support vide. Les autres ET exposés restent supprimés pendant le calcul des opérandes.

La cible doit accepter chacune des cinq arêtes profondes et rejeter les 197 ensembles indépendants maximaux. Les 31 autres arêtes sont acceptées par construction des neuf termes. Tout modèle est monotone, donc ces tests couvrent la frontière de la fonction. On ne déduit aucune existence à partir d’un modèle satisfaisant de cette relaxation. Une formule insatisfiable exclut les circuits originaux représentés.

## Formules et vérification

Le générateur peut fixer une orbite ou choisir symboliquement l’une des orbites d’un groupe. Dans une formule de groupe, l’encodage admet au plus cinq arêtes profondes et impose les cinq arêtes d’au moins un représentant admissible. Cela fixe exactement les cinq arêtes. Le calcul des supports évalue les signaux projetés sur les 21 singletons en supprimant aussi les ET internes.

Les trois répartitions dont le maximum par droite est deux ont neuf centres droites, deux ET internes et aucun ET exposé non productif, d’après le README. La formule commune `all` contient **32 085 variables et 173 278 clauses** et couvre leurs 909 orbites. Les trois formules par répartition et la formule commune sont insatisfiables. Leurs certificats ont été vérifiés indépendamment avec drat-trim. En outre, les 909 formules à orbite fixée ont chacune donné UNSATISFIABLE, et six de leurs certificats ont aussi été vérifiés.

Pour les types 3 + 2 et 3 + 1 + 1, si les neuf centres sont des droites, il faut considérer les couples (h, u) = (2, 0), (1, 0) et (1, 1). Les plafonds précédents excluent tout autre couple. Les six formules correspondantes sont insatisfiables avec certificats vérifiés.

Le contrôle positif fixe les deux ET internes à des recopies de deux points distincts. Sur les cinq droites profondes du représentant 1, le point profond est fourni par la recopie correspondant à son point. Cela décrit un circuit connu qui accepte exactement la frontière. La projection avec ces choix imposés est satisfaisable avec un budget de cinq terminaux vides et insatisfiable si ce budget est ramené à quatre.

### Reproduction

Les commandes ci-dessous doivent être lancées dans ce dossier avec Node.js, Kissat 4.0.4 et drat-trim.

```sh
node frontiere.cjs five-deep-orbits > orbites-cinq.json
node projection-cinq.cjs orbites-cinq.json all projection-all.cnf
kissat --time=180 projection-all.cnf projection-all.drat
drat-trim projection-all.cnf projection-all.drat
```

La réponse attendue du vérificateur est `s VERIFIED`. Pour les trois formules séparées, remplacer `all` par `2+2+1`, `2+1+1+1` ou `1+1+1+1+1`. Le budget est laissé à deux et le nombre de ET internes à deux.

Pour chaque répartition restante, on passe dans l’ordre le budget, le nombre de ET internes et le nombre de ET exposés non productifs.

```sh
node projection-cinq.cjs orbites-cinq.json 3+2 projection-32-h2.cnf 2 2 0
node projection-cinq.cjs orbites-cinq.json 3+2 projection-32-h1.cnf 3 1 0
node projection-cinq.cjs orbites-cinq.json 3+2 projection-32-h1-u1.cnf 1 1 1
```

Rejouer les trois commandes avec `3+1+1` et des noms distincts, puis vérifier chaque certificat comme pour la formule commune. Le [registre des certificats](certificats-projection-cinq.tsv) donne les empreintes des CNF et des traces générées.

Pour établir les [verdicts par orbite](verdicts-projection-cinq.tsv), on peut lancer

```sh
python3 verifier-projection-cinq.py /chemin/kissat --jobs 8 --time 12 \
  --checker /chemin/drat-trim --certify 1,2,11,21,31,45
```

## Extension aux centres points et aux centres répétés

Le même modèle représente maintenant tous les circuits candidats dans les 55 dernières orbites. Chaque terme productif a un support singleton pour centre. On choisit un centre pour chaque terme dont les deux supports sont singletons. Un terme est actif si son centre et sa garde sont sélectionnés, et sa garde doit contenir au moins une incidence peu profonde. Chaque incidence peu profonde doit appartenir à au moins une garde. Deux gardes peuvent couvrir la même incidence.

Pour un centre x, on aplatit les OU de toutes ses gardes, en partant de leurs tₓ racines. Si kₓ voisins distincts et eₓ terminaux projetés distincts de support vide sont atteints, le parcours rencontre au moins kₓ + eₓ terminaux. Avec qₓ OU visités et au plus tₓ racines, il rencontre au plus 2qₓ + tₓ fils au total. On a donc qₓ ≥ kₓ + eₓ − tₓ. Tout OU de support d’au moins deux appartient au plus à un centre. En effet, deux centres de la même part ne peuvent partager deux voisins, et les voisins de centres dans des parts opposées appartiennent à des parts distinctes. Comme la somme des kₓ est au moins 31, on obtient au moins 31 − t + Σₓ eₓ OU de gardes pour t termes productifs.

Le circuit comporte t ET productifs, h ET internes, u ET exposés non productifs et au moins t + u − 1 OU exposés. En ajoutant le nombre a d’OU projetés, on obtient le budget

```text
a + Σₓ eₓ ≤ 43 − (31 + t + h + 2u − 1) = 13 − t − h − 2u.
```

Un même terminal de support vide utilisé dans deux gardes du même centre n’est compté qu’une fois. Une garde singleton peut être représentée par son fil racine projeté, ou directement par l’entrée du voisin si c’est une entrée primaire. Dans ce cas l’aplatissement ne force aucun terminal vide en plus. Pour un opérande qui lit un OU de garde d’un centre point, les entrées possibles sont les droites peu profondes de ce centre, par le même argument de projection que pour un centre droite. Les ensembles d’incidences vérifiés sont exactement les mêmes.

Les cas de figure à couvrir se déduisent du comptage antérieur.

| Répartition | Mode | Termes productifs | Couples (h, u) |
| --- | --- | ---: | --- |
| 3 + 2 ou 3 + 1 + 1 | `mixed` | 9, tous de centres distincts, dont au moins un point | (1, 0), (2, 0), (1, 1) |
| 4 + 1 | `mixed` | 9, tous de centres distincts, dont au moins un point | (1, 0), (2, 0), (1, 1) |
| 4 + 1 | `repeat` | 9, avec un centre répété parmi huit droites | (1, 0), (2, 0), (1, 1) |
| 4 + 1 | `eight` | 8, sur huit droites distinctes | (1, 0), (2, 0), (3, 0), (1, 1), (2, 1), (1, 2) |

Avec neuf centres distincts, un centre point est obligatoire dans le type 4 + 1 car une droite n’a aucune incidence peu profonde. Au plus deux centres sont des points, par le comptage des paires de points du README. Les huit-centres possibles sont toujours huit droites. Les couples du tableau sont exactement ceux qui satisfont h ≥ 1, t + h ≤ 11, t + h + u ≤ 11 et t + h + 2u ≤ 13. Le fichier de vérification donne une formule commune par ligne de répartition, mode et couple.

```sh
node frontiere.cjs five-deep-orbits > orbites-cinq.json
node projection-cinq.cjs orbites-cinq.json 3+2 projection-mixte.cnf 2 2 0 mixed
kissat --time=115 projection-mixte.cnf projection-mixte.drat
drat-trim projection-mixte.cnf projection-mixte.drat
```

Le contrôle à budget relâché fixe le représentant 475. Un ET interne calcule l’étoile entière de la droite sans terme productif. Un ET exposé non productif recopie ce signal. Le second ET interne fournit la cinquième incidence profonde à la garde de l’autre droite. Le câblage utilise trois OU projetés et un terminal vide. Il a donné SAT dans chacun des modes `mixed`, `repeat` et `eight` avec ce budget de quatre. Les dix anciennes formules du registre ont également été régénérées et leurs empreintes CNF sont inchangées.

Pour reproduire les nouvelles formules du registre dans un dossier temporaire, avec `kissat` et `drat-trim` dans le PATH :

```sh
set -eu
work=$(mktemp -d)
node frontiere.cjs five-deep-orbits > "$work/orbites.json"
tail -n +2 certificats-projection-cinq-restants.tsv |
while IFS="$(printf '\t')" read -r pattern mode count budget h u vars clauses verdict verified formula_hash proof_hash; do
  case_name="$pattern-$mode-$h-$u"
  cnf="$work/$case_name.cnf"
  proof="$work/$case_name.drat"
  node projection-cinq.cjs "$work/orbites.json" "$pattern" "$cnf" "$budget" "$h" "$u" "$mode"
  printf '%s  %s\n' "$formula_hash" "$cnf" | sha256sum -c -
  status=0
  kissat "$cnf" "$proof" > "$work/$case_name.out" || status=$?
  test "$status" -eq 20
  drat-trim "$cnf" "$proof" > "$work/$case_name.check"
  tr '\r' '\n' < "$work/$case_name.check" | grep '^s VERIFIED$'
done
```

L’empreinte du CNF permet de vérifier que la formule régénérée est celle du registre. Une autre trace DRAT est admissible si elle est vérifiée contre ce même CNF.

## Recherche à partir de six arêtes profondes

```sh
AFFINE_COMPACT_ROWS=1 AFFINE_MIN_DEEP_EDGES=6 \
  node frontiere.cjs build affine-43-six.cnf 43 197 ordered
kissat --time=75 affine-43-six.cnf
```

La formule compte 1 026 999 clauses. Le solveur a atteint sa limite de temps et a donné UNKNOWN. L’existence d’un circuit exact à 43 portes reste ouverte.
