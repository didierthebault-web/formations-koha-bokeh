# Bibliothèque de notices modèles UNIMARC

## Source et périmètre

La bibliothèque est une vue native `?view=notices` de la plateforme. Aucun serveur, compte supplémentaire ou service de couverture n’est nécessaire. Les cinq notices BnF fournies sont intégrées au bundle React. Le sixième export, `20261031093208` / `cb46531213x` (Réinventer la ville centre), est une référence graphique, exclue du corpus conformément à la mission.

## Données distinctes

- `public/model-notices/sources/` : cinq fichiers ISO 2709 originaux, octets inchangés, disponibles au téléchargement.
- `data/model-notices/records.json` : label, ARK, SHA-256, nom de source, champs en ordre source, indicateurs et sous-champs répétés. Chaque zone garde sa chaîne brute.
- `data/model-notices/metadata.json` : type, justification documentaire, niveau pédagogique proposé, thématiques, champs intéressants.
- `data/model-notices/annotations.json` : définitions réutilisables, indicateurs explicitement documentés, répétabilité et sources. Les éléments non confirmés restent « À vérifier ».
- `data/model-notices/teaching.json` : observations et recommandations propres à chaque notice, avec statut et référence.

## Conversion reproductible

`node pages/import-notices.mjs` lit le répertoire en octets. Les positions ISO 2709 ne sont jamais calculées sur des caractères JavaScript. Le convertisseur contrôle longueur, adresse de base, structure du répertoire, limites des zones, caractères de fin et UTF-8 strict. Il extrait l’ARK principal de 003, et non les ARK de fusion en 039. Il refuse ARK non prévus et doublons.

L’import vérifie un aller-retour binaire intégral, puis reconstruit chaque chaîne de zone à partir des indicateurs et sous-champs. Un rapport déterministe est produit dans `reports/notices-import.json`. Les anomalies ne sont jamais réparées silencieusement.

## Explorateur et présentation

Les boutons proviennent de toutes les étiquettes réellement présentes, sans liste fixe. Le choix d’une zone affiche ses occurrences séparées, les valeurs complètes, le tableau de sous-champs et l’explication normative correspondante. Le paramètre `field` permet un accès direct.

La lecture masque uniquement U+0098/U+009C ; la vue brute JSON les rend visibles, ainsi que U+001F. Les blancs des indicateurs sont représentés par `#` en lecture ; les `|` restent visibles. Le téléchargement conserve les octets d’origine. Le bouton Copier reproduit la vue sélectionnée de la zone et toutes ses occurrences ; Windows peut convertir LF en CRLF dans le presse-papiers.

Les responsabilités, publication, description matérielle et nature sont des lignes distinctes d’une liste de définition. Le titre long reste complet. Le résumé n’est pas tronqué. Les styles sont limités à la bibliothèque et à son lien contextuel ; le menu et la charte de la plateforme sont conservés.

## Ajouter une sixième notice

1. Ajouter le fichier original dans `public/model-notices/sources/`.
2. Ajouter dans `metadata.json` son ARK, son identifiant (suffixe de l’ARK), un type étayé par les données, un niveau proposé et les champs intéressants.
3. Exécuter l’import et examiner le rapport. Toute anomalie structurelle bloque l’import.
4. Ajouter les observations dans `teaching.json`. Vérifier les définitions des zones nouvelles dans le manuel CfU et les mises à jour IFLA avant de changer leur statut.
5. Mettre à jour les attentes du corpus initial dans les tests et lancer les commandes ci-dessous.

## Modifier une annotation

Modifier uniquement `annotations.json`, après consultation d’une source précise. Ne pas modifier `records.json` pour ajouter une explication. Documenter le statut ; ne pas transformer une observation BnF ou une recommandation professionnelle en règle générale. Les indications de niveau et les procédures locales doivent être validées par le réseau.

## Compilation et tests

```powershell
npm run check:notices --prefix pages
npm run typecheck:glossary --prefix pages
npm run build --prefix pages
# Avec les variables PLAYWRIGHT_MODULE et PLAYWRIGHT_EXECUTABLE appropriées :
node pages/test-notices.cjs http://127.0.0.1:8780/
node pages/test-browser.cjs http://127.0.0.1:8780/
node pages/test-tour.cjs http://127.0.0.1:8780/
```

`pages/build.mjs` relance l’import avant compilation et copie les sources vers `docs/model-notices/sources/`. Ne pas éditer le bundle `docs/platform.js` manuellement. Le workflow de publication existant reste inchangé : cette branche ne doit pas être fusionnée sans validation humaine.

## Limites documentaires

La première version documente prioritairement les zones pédagogiques 010, 101, 200, 205, 210, 214, 215, 225, 330, 606, 607, 608 et 700–702. Le rôle de 410 et sa répétabilité sont documentés, ses indicateurs et sous-zones restent à vérifier avec les règles 4XX. Les autres zones sont conservées et consultables avec un signalement explicite lorsque l’interprétation manque. Le $o des accès de personnes et le $2 de 330 ne reçoivent pas de définition inventée.

Les traductions CfU anciennes servent à lire les notices exportées, et ne sont pas présentées comme une validation exhaustive des mises à jour IFLA. Aucun audit RGAA complet ni test du déploiement Worker n’est revendiqué. La branche prépare la publication statique, sans fusionner ni déployer cette nouvelle fonction en production.
