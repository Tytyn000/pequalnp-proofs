# Projection SAT pour cinq arêtes profondes et neuf centres droites

Les certificats DRAT excluent les **909 orbites** où chaque droite porte au plus deux des cinq arêtes profondes. D’autres certificats utilisant la même projection excluent aussi tous les circuits qui auraient exactement cinq arêtes profondes et les neuf droites pour centres.

À 43 portes, il reste deux orbites de type 4 + 1, ainsi que les 53 orbites des types 3 + 2 et 3 + 1 + 1 avec au moins un centre point. Ces 55 orbites ne sont pas déclarées réalisables. Un circuit à 43 portes peut aussi avoir plus de cinq arêtes profondes.

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
