# Bilan du glossaire métier

Branche : `feature/glossaire-metier`. Base : `9d3480a`.

## Bilan documentaire

- 41 entrées initiales conservées avec leurs identifiants, termes et définitions exacts.
- 90 entrées nouvelles ; 131 entrées uniques ; 38 synonymes et sigles alternatifs normalisés.
- Les 95 propositions du cahier des charges sont couvertes par une entrée ou un synonyme.
- Dérivation est un synonyme de Catalogage par dérivation. ARK, ISBD, Code de catalogage et Métadonnées enrichissent les entrées existantes.
- Indexation/Indexation matière, Catalogage/Description bibliographique et Exemplaire/Notice d’exemplaire/Exemplarisation restent distincts.

| Domaine | Entrées |
|---|---:|
| Catalogage et description bibliographique | 24 |
| Autorités et indexation | 15 |
| Administration KOHA | 14 |
| Collections, acquisitions et circulation | 22 |
| Interopérabilité et données | 14 |
| Portail BOKEH et valorisation | 11 |
| Transition bibliographique | 31 |

## Sources

Les neuf documents existants ont été examinés via leurs textes extraits. Les sources internes comportent des renvois vers une page ou une diapositive quand le terme y est repéré. Les fonctions et ambiguïtés sont explicitées ; aucun numéro de zone locale d’exemplaire n’est présenté comme une règle UNIMARC universelle.

- [IFLA — Library Reference Model](https://www.ifla.org/files/assets/cataloguing/frbr-lrm/ifla-lrm-august-2017_rev201712.pdf)
- [Transition bibliographique — Vocabulaire du site](https://www.transition-bibliographique.fr/vocabulaire-du-site/)
- [ARK Alliance — About ARKs](https://arks.org/about/)
- [Code RDA-FR](https://code.rdafr.fr/)
- [IFLA — ISBD](https://www.ifla.org/g/isbd-rg/isbd-editions/)
- [Catalogage ISBD et UNIMARC — Apports théoriques](?view=document&id=catalogage-isbd)
- [W3C — RDF : concepts](https://www.w3.org/TR/rdf10-concepts/)
- [Cataloguer dans le catalogue mutualisé](?view=document&id=catalogueurs)
- [Administrer le SIGB KOHA](?view=document&id=admin-koha)
- [International ISBN Agency — What is an ISBN?](https://www.isbn-international.org/index.php/content/what-isbn/10)
- [Guide de catalogage des publications du ministère](?view=document&id=guide-publications)
- [UNIMARC — Codes de fonction (annexe C)](?view=document&id=codes-fonction)
- [BnF — Référentiels d’indexation sujet](https://www.bnf.fr/fr/indexation-sujet-les-referentiels-utilises-par-la-bnf)
- [BnF — RAMEAU](https://rameau.bnf.fr/)
- [Manuel Koha — Administration](https://koha-community.org/manual/latest/fr_CA/html/administration.html)
- [Schéma Koha 25.11](https://schema.koha-community.org/25_11/tables/items.html)
- [Manuel Koha — Acquisitions](https://koha-community.org/manual/latest/fr_CA/html/acquisitions.html)
- [Manuel Koha — Circulation](https://koha-community.org/manual/latest/fr_CA/html/circulation.html)
- [Manuel Koha — Préférences de circulation](https://koha-community.org/manual/latest/fr_CA/html/circulationpreferences.html)
- [Manuel Koha — Outils](https://koha-community.org/manual/latest/fr_CA/html/tools.html)
- [BBF / Enssib — Désherbage, refoulement et retrait](https://bbf.enssib.fr/consulter/bbf-1988-05-0394-006)
- [Manuel Koha — Périodiques](https://koha-community.org/manual/latest/fr_CA/html/serials.html)
- [Manuel Koha — Liste de contrôle de mise en œuvre](https://koha-community.org/manual/latest/fr_CA/html/implementation_checklist.html)
- [Abes — Service de prêt entre bibliothèques](https://abes.fr/reseau-sudoc/sudoc-outils-et-services/peb/)
- [BnF — Réserve des livres rares](https://www.bnf.fr/fr/reserve-des-livres-rares)
- [Library of Congress — Z39.50](https://www.loc.gov/standards/z3950/agency/)
- [Library of Congress — SRU/CQL](https://www.loc.gov/standards/sru/)
- [Open Archives Initiative — OAI-PMH 2.0](https://www.openarchives.org/OAI/openarchivesprotocol.html)
- [ISO — 2709:2008, présentation du format d’échange](https://www.iso.org/standard/41319.html)
- [Library of Congress — MARCXML](https://www.loc.gov/standards/marcxml/)
- [BnF — Identifiants internationaux](https://www.bnf.fr/fr/identifiants-internationaux)
- [Communauté Koha — API REST](https://api.koha-community.org/)
- [Administrer le portail BIBDOC](?view=document&id=admin-bokeh)
- [Bokeh — Guide de prise en main rapide](?view=document&id=guide-bokeh)
- [Charte des bonnes pratiques éditoriales](?view=document&id=charte)
- [W3C WAI — Introduction à l’accessibilité](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
- [DINUM — Référentiel général d’amélioration de l’accessibilité](https://www.numerique.gouv.fr/offre-accompagnement/reference-accessibilite-rgaa/)

Sources complémentaires consultées : le glossaire CRFCB/Callisto annonce CC BY-NC-ND ; aucune définition de ce site n’est recopiée ou adaptée. Le site Charente-Maritime a renvoyé 403 et n’est pas utilisé comme justification d’une définition. Les pages ENSSIB PDF et Jura indisponibles ont été remplacées par un article BBF consultable pour la notion de désherbage. Vérification documentaire : 30 octobre 2026.

### Relecture métier restante

Les usages locaux des termes Bibliothèque dépositaire, Profil utilisateur, Type de document, Domaine, Boîte de notices et Kiosque restent à confirmer par les responsables du réseau. Les fiches signalent ces contextes. Les 41 définitions historiques ne sont pas présentées comme une actualisation de la gouvernance RDA ; leur formulation a été conservée conformément à la demande. Il ne s’agit pas d’une validation normative officielle.

## Bilan fonctionnel

Source unique : lib/glossary.json. Catégories et référentiels : lib/glossary-domains.json et lib/glossary-sources.json. docs/glossaire.json est généré à chaque compilation ; la fixture des 41 fiches sert uniquement de contrôle historique. Le lecteur serveur et GitHub Pages utilisent les mêmes composants React. Les libellés de leçons sont dérivés automatiquement des parcours.

Recherche instantanée sur termes, alias, définitions, exemples, catégories et contexte logiciel ; sept domaines ; alphabet A–Z avec lettres vides désactivées ; fiches natives dialog ; fermeture Échap, focus contenu et restitué ; termes associés ; liens explicites vers les leçons ; boutons de vocabulaire contextuels sans réécriture des textes de cours.

Captures : [ordinateur](glossaire-desktop.png), [téléphone](glossaire-mobile.png), [fiche](glossaire-fiche.png).

## Vérifications effectivement exécutées

- npm run typecheck:glossary --prefix pages : réussi (composants partagés du glossaire et lecteur de leçons).
- npm run build --prefix pages : réussi ; le contrôle de données fait partie de la compilation.
- pages/test-browser.cjs sur aperçu local : réussi. Les 131 fiches ont été ouvertes ; les sept domaines, les variantes accentuées/casse, les synonymes, les exemples et catégories, les lettres vides, la navigation entre termes, les cibles pédagogiques, Tab/Maj+Tab/Échap et la restitution du focus ont été testés.
- Non-régression : quatre parcours, 34 modules et 77 leçons ouverts et comparés à leurs paragraphes et procédures ; neuf téléchargements et aperçus PDF ; images pédagogiques, kiwi et logo ; recherche documentaire et menu mobile : réussis. Aucune erreur JavaScript ni ressource locale en échec.
- git diff sur lib/learning, corpus et public : aucun changement. Le workflow de publication et pages/public-api.ts sont inchangés.

Contrôles non réalisés : audit RGAA complet, session réelle de lecteur d’écran, tests physiques multi-navigateurs, compilation et déploiement Worker/D1/R2 de production. Le contrôle TypeScript ciblé et la compilation statique ne constituent pas une recette serveur complète.

## Validation et publication

Examiner la pull request, les captures et les réserves métier. Après validation, fusionner dans main pour déclencher le workflow Pages existant. Aucune fusion et aucune publication en production ne sont effectuées par cette mission.

## Fichiers livrés

- app/cataloguer.tsx
- app/globals.css
- app/glossary.tsx
- docs/content-manifest.json
- docs/glossaire.json
- docs/platform.css
- docs/platform.js
- lib/glossary.json
- pages/build.mjs
- pages/package-lock.json
- pages/package.json
- pages/test-browser.cjs
- app/glossary-entry.tsx
- lib/glossary.ts et fichiers de catégories, sources et index de leçons
- pages/check-glossary.mjs, pages/tsconfig.glossary.json
- tests/fixtures/glossary-original.json, tests/fixtures/glossary-requested.json
- reports/glossaire-audit.md, reports/glossaire-bilan.md et trois captures
