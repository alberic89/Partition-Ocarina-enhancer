# Partition-Ocarina-enhancer

Ce script permet de générer une partition à partir d'une tablature sur le site [part-ocarina.com](part-ocarina.com).

## Mécanique de génération

Le script suit les étapes suivantes.

### Lecture des notes ou symboles

Le script lit les notes ou symboles à partir des adresses des images affichée, en utilisant une expression régulière pour isoler la dernière partie de l'adresse.

### Conversion en notation ABC

Toutes les notes vont être converties en leur équivalent en notation ABC.
- Un espace blanc `empty` devient un soupir,
- une barre verticale `barre` devient une barre de mesure forcée,
- un tiret horizontal `tiret` change la note précédente en une blanche,
- deux tiret horizontaux `tiretx2` changent la note précédente en une blanche pointée.

Les dièses sont rendus à cette étapes, il n'y a pas de bémol.

### Liaisons

Les liaisons sont détectée avec leur début et leur fin, et ajoutées au reste.

### Parenthèses et répétitions

Cette partie est la plus délicate car elle tente de deviner comment l'auteur voulait qu'on interprète les répétitions.

Le script essaie les cas possibles dans l'ordre suivant.
- Un indicateur de répétition est placé juste après une parenthèse fermante `parenthesis-close`, on cherche la première parenthèse ouvrante `parenthesis-open` en partant de la parenthèse fermante dans le sens de lecture inverse, et on répète tout ce qui est dans l'intervale le nombre de fois indiqué,
- Un indicateur de répétition est placé juste avant un retour à la ligne `enter`, on cherche le retour à la ligne précédent ou le début de la tablature, et on répète tout ce qui est dans l'intervale le nombre de fois indiqué,
- Un indicateur de répétition est placé juste après une note, la note est répété le nombre de fois indiqué.

### Découpe de la partition en systèmes

_Remarque : ces étapes sont exécutée à chaque changement de la « taille des notes » qui affecte donc le nombre de notes dans une ligne._

#### Découpe selon le tempo

Une valeur est donnée comme limite de temps dans un système (une ligne).
 - Tant que la limite n'est pas dépassée, on ajoute la note suivante et le temps qui lui correspond, sauf si la note est un retour à la ligne.
 - Si on a un retour à la ligne, alors on ajoute une barre de mesure pour fermer la ligne,
 - sinon on retourne simplement à la ligne.

### Retours à la ligne

Différentes règles seront appliquées selon le nombre de retour à la ligne successifs.
- Pour trois retours à la ligne, on met une double barre et on passe à la ligne,
- pour deux retours à la ligne, on met une barre et on passe à la ligne,
- pour un retour à la ligne, on met une barre.

Une barre finale est ajoutée à la fin de la partition, ainsi que le titre au début.
