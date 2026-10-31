# Première vérification visuelle — 31 octobre 2026

Ce rapport décrit l’étape initiale (commit `98de889`). La [revue documentaire complémentaire](notices-revue-documentaire.md) présente les définitions ajoutées ensuite et l’état actuel des points restant à vérifier. Les captures ont été actualisées avec ce complément.

## Résultat

Les deux notices demandées ont été examinées dans Chromium, après import fidèle des cinq exports. La fiche sépare les mentions bibliographiques et l’explorateur permet de lire chaque occurrence en entier. La nouvelle bibliothèque reste dans une branche dédiée, sans fusion ni publication en production.

| Notice | Contrôles visuels | Résultat |
| --- | --- | --- |
| Muses : elles ont conquis les coeurs | Fiche, publication en 210, $e de fabrication, deux occurrences 606 avec $zXIXe siècle et $zXXe siècle, identifiants répétés | Mentions distinctes, pas d’accolement ; les chaînes matière et leur chronologie restent séparées |
| Encyclopédie des patrimoines de l’Amérique française | Titre long, responsabilité transcrite, résumé intégral en 330$a, trois occurrences 702 | Titre complet, résumé lisible sans troncature, accès de personnes séparés avec leurs identifiants et dates |
| Affichage mobile | Écran 390 × 844, titres, boutons, valeurs longues, tables, 330 et 702 | Aucun débordement horizontal de page ; lecture par défilement vertical |

Les captures de référence présentaient des mentions accolées (« SansonPublication », « 2020Description »). Le composant construit une liste de définition avec un libellé et une valeur séparés pour chaque mention ; les responsabilités successives sont des paragraphes distincts.

## Captures inspectées

- `notices-muses-fiche.png`, `notices-muses-210-desktop.png`, `notices-muses-606-desktop.png`, `notices-muses-mobile.png`.
- `notices-encyclopedie-fiche.png`, `notices-encyclopedie-330-desktop.png`, `notices-encyclopedie-702-desktop.png`, `notices-encyclopedie-330-mobile.png`, `notices-encyclopedie-mobile.png`.
- `notices-bibliotheque.png` : bibliothèque de cinq cartes.

Les captures pleine page sont réalisées après désactivation des transitions de capture et retrait du focus, pour éviter les artefacts de position des éléments fixes lors des changements de taille.

## Tests exécutés

- `npm run typecheck:glossary --prefix pages` : passe, nouveaux composants inclus.
- `npm run check:notices --prefix pages` : passe, cinq ARK, 154 zones, aller-retour binaire identique, ordre et répétitions conservés ; quatre cas structurels/UTF-8 invalides refusés ; lecture multi-notices testée.
- `npm run build --prefix pages` : passe, compilation reproductible, sources copiées dans la sortie statique.
- `pages/test-notices.cjs` à la racine locale et sous `/docs/` : passe, cinq cartes et fiches, toutes les zones, toutes les valeurs, filtres, aucun résultat, copie et données brutes, source téléchargée identique, lien BnF, clavier, mobile, liens du cours. Aucun appel API ni couverture externe.
- `pages/test-browser.cjs` : passe, 4 parcours, 34 modules, 77 leçons, 9 documents et aperçus, logos et kiwi, 131 fiches de glossaire, recherche et mobile.
- `pages/test-tour.cjs` : passe, 8 étapes, 13 zones, focus, zoom et alignement, agrandissement, retour au cours, 4 tailles d’écran.

Le premier test de visite a détecté une collision de classe CSS entre le nouveau lien contextuel et le lien de visite. Le nouveau lien possède désormais sa propre classe ; le test de visite repasse. Les premiers essais de tests ont aussi nécessité un serveur local accessible hors bac à sable, un sélecteur de filtre adapté et la normalisation des retours de presse-papiers Windows.

## Limites et validations restantes

- La vérification est une première revue visuelle et fonctionnelle, pas un audit RGAA exhaustif.
- 15 annotations de zones documentent les éléments prioritaires vérifiés dans les sources consultées. 17 restent « À vérifier » (dont 410, partiellement documentée) et 2 concernent des données locales. La source et les valeurs restent accessibles pour toutes les zones.
- Les extensions 330$2 et 7XX$o restent explicitement à vérifier. Aucun sens non confirmé n’est inventé.
- Le rapport d’import liste 9 signalements informatifs (non-classement, URL non absolues en 856, niveau bibliographique blanc, 330$2), sans correction des exports.
- Les niveaux pédagogiques et recommandations propres au réseau sont proposés à validation humaine.
- La compatibilité sous un sous-chemin est testée localement ; cette nouvelle branche n’a pas été déployée sur GitHub Pages. Le déploiement Worker n’a pas été testé.
