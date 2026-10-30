# Audit préalable du glossaire — 30 octobre 2026

- Base examinée : main, commit 9d3480a. Branche de livraison : feature/glossaire-metier.
- 41 fiches, identifiants stables terme-1 à terme-41 ; champs id, term, definition, source.
- app/glossary.tsx : cartes React, recherche terme/définition, lettres présentes seulement, liens vers cinq référentiels codés dans le composant.
- app/platform.tsx : entrée de menu et rendu partagé du glossaire. app/cataloguer.tsx : lecteur commun des quatre parcours, sans liaison terminologique.
- lib/learning : 4 parcours, 34 modules, 77 leçons ; les procédures communes du parcours Contribuer référencent BOKEH par sharedFrom. Les données pédagogiques doivent rester identiques.
- pages/public-api.ts : adaptateur de consultation statique, indépendant du glossaire. Aucun changement nécessaire.
- pages/build.mjs : compilation des composants React communs, copie des assets et corpus ; le glossaire est importé depuis lib/glossary.json dans le bundle.
- docs/glossaire.json est une copie identique des 41 entrées, héritée de la première édition ; elle n’est plus lue par React et n’est pas régénérée. Décision : lib/glossary.json sera la seule source applicative ; docs/glossaire.json deviendra une sortie systématique de compilation.
- Préservation : fixture historique dans tests/fixtures/glossary-original.json, utilisée seulement pour contrôler les identifiants et définitions d’origine.
- Déduplication identifiée avant rédaction : ARK, ISBD, Code de catalogage et Métadonnées existent déjà ; les sigles seront des alias, Dérivation rejoindra Catalogage par dérivation. Indexation/Indexation matière et Exemplaire/Notice d’exemplaire/Exemplarisation resteront distincts.
- Sources externes examinées : Transition bibliographique, RDA-FR, manuel Koha, schéma 25.11, BnF/RAMEAU, Callisto, protocoles officiels. Callisto indique CC BY-NC-ND : consultation et renvoi, sans reprise textuelle ou adaptation de ses définitions. L’URL Charente-Maritime renvoie 403 ; elle ne peut étayer une définition vérifiée dans cette mission.
- Approche : définitions originales, exemples de pratique, sources précises, renvois explicites vers des leçons existantes ; aucune insertion automatique de liens dans les textes des cours.
- Publication : compilation et tests avant PR, sans fusion et sans changement du workflow Pages.
