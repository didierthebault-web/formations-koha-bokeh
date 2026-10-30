# Visite guidée de l’accueil Koha — bilan de recette

## Livraison

Branche : `feature/visite-guidee-accueil-koha`. La branche reprend le commit `e252433` de la PR glossaire #1, afin de conserver les 131 fiches métier et leurs liaisons. Elle cible main dans une PR distincte. Aucun changement de production ni fusion automatique.

## Fonctionnement livré

- Rubrique « Visites interactives » avec une seule carte opérationnelle.
- Visite en huit étapes, avec les textes fournis, compteur et progression.
- Effet projecteur SVG à découpes multiples : trois zones pour la recherche, quatre zones distinctes pour les autres modules.
- Boutons Précédent, Suivant, Quitter, Recommencer ; clic et activation clavier sur Catalogage. Le bouton Suivant fonctionne aussi à cette étape.
- Exploration libre des treize zones demandées, sans voile permanent, avec liste textuelle et explications.
- Capture agrandie dans un dialog natif, fermeture Échap et commandes accessibles.
- Zoom, défilement et recentrage de la cible. Sur téléphone, les étapes ciblées utilisent un zoom adapté ; le bouton Voir l’écran complet reste disponible. Les grands rectangles sont cadrés depuis leur bord gauche pour conserver le libellé lisible.
- Panneau explicatif sous la capture, choix volontaire pour ne jamais masquer une cible sur une image panoramique.
- Lien depuis le début du parcours Catalogueurs et retour à la leçon d’origine. Le bouton final ouvre la leçon réelle « Vérifier la présence du document » dans le module Rechercher avant de créer.
- Moteur configurable par scénario JSON ; aucune fausse visite future n’est affichée.

## Capture originale et coordonnées

Le fichier joint accessible dans cette conversation est un PNG de **3 823 × 1 275 pixels**, et non 2 047 × 683. L’image a été copiée octet pour octet, sans recadrage, retouche ou conversion. La version 26.05.05 est visible dans l’image.

Empreinte SHA-256 de la pièce jointe, de l’asset public et de la copie publiée :

`58ee9e5d29df3cd56b60031cc08fb07ebc3abf37658ca9b47b98f24902a9cca2`

Le JSON distingue les dimensions réelles de l’image et le repère de coordonnées fourni (2 047 × 683). Les zones sont converties en proportions sur un canvas qui conserve le rapport exact de l’image réelle. Image, masque et boutons partagent la même surface ; défilement et zoom déplacent l’ensemble. Les contrôles comparent leurs rectangles rendus avec la projection attendue, après redimensionnement et zoom, avec une tolérance de deux pixels CSS.

## Architecture

Nouveaux fichiers :

- `app/tours.tsx` : catalogue des visites et retour contextuel.
- `components/guided-tours/model.ts` : modèle et projection des coordonnées.
- `components/guided-tours/GuidedImageTour.tsx` : modes et agrandissement.
- `TourImage.tsx`, `TourSpotlight.tsx`, `TourHotspots.tsx` : image locale, masque et interactions.
- `TourTooltip.tsx`, `TourNavigation.tsx`, `TourProgress.tsx`, `TourExplorer.tsx` : explications, commandes et liste textuelle.
- `data/guided-tours/koha-home.json` : capture, huit étapes, zones et treize fonctions explorables.
- `public/guided-tours/koha/accueil-koha-26-05-05.png` et sa sortie sous `docs/`.
- `pages/check-tours.mjs` et `pages/test-tour.cjs`.

Fichiers adaptés : `app/platform.tsx` (menu et affichage autonome), `app/cataloguer.tsx` (lien pédagogique minimal), `app/globals.css`, `pages/build.mjs` (copie récursive des assets et contrôle des scénarios), `pages/tsconfig.glossary.json`, `pages/package.json` et sorties compilées de `docs/`. Les captures de contrôle du glossaire sont actualisées avec la nouvelle entrée du menu.

Aucune dépendance d’exécution ajoutée : React et lucide-react étaient déjà disponibles. Aucune API Koha, identité, donnée de catalogue, clé ou service externe de visite n’est utilisé.

## Tests effectivement exécutés

1. `npm run typecheck:glossary --prefix pages` : réussi. Le périmètre inclut maintenant le glossaire, le lecteur de leçons, la rubrique et tous les composants de visite importés.
2. `npm run build --prefix pages` : réussi. Validation des dimensions et de l’empreinte PNG, des limites des rectangles, des identifiants de zones et de la leçon finale.
3. `pages/test-tour.cjs` : réussi sur l’aperçu local à la racine puis sous `/docs/`, pour reproduire l’hébergement sous un préfixe GitHub Pages.
4. Huit étapes, textes affichés, compteurs, Précédent/Suivant, clic Catalogage, passage par boutons uniquement, final, recommencement, sortie, treize zones libres, activation clavier, focus, agrandissement/Échap et retour au cours : réussis.
5. Découpes simultanées à trois et quatre zones : vérifiées ; aucun rectangle englobant de substitution.
6. Quatre dimensions réellement testées : 1 920 × 1 080, 1 366 × 768, 768 × 1 024 et 390 × 844. Rectangles contrôlés après zoom, recentrage et redimensionnement. Pas de débordement horizontal de la page ; le débordement reste dans la capture défilante.
7. Réduction des animations activée dans le navigateur de test et absence d’animation vérifiée.
8. `pages/test-browser.cjs` : non-régression réussie sur les quatre parcours, 34 modules, 77 leçons (paragraphes et procédures), neuf originaux téléchargeables, leurs PDF, les illustrations, logo/kiwi, recherche et mobile. Les 131 fiches du glossaire et leurs fonctionnalités ont été retestées.
9. Aucune erreur JavaScript, ressource locale en échec ou requête d’API Koha pendant la visite.
10. `git diff e252433 -- lib/glossary.json lib/learning corpus public/kiwi.png public/koha-logo.png` : aucun changement. `pages/public-api.ts` et le workflow Pages sont inchangés.

Les contrôles visuels ont conduit à corriger le cadrage d’un grand bloc sur téléphone : le libellé Catalogage reste désormais visible au zoom. Le focus des titres a été harmonisé avec la couleur de focus de la plateforme.

Non réalisé : audit RGAA exhaustif, tests physiques sur appareils, session manuelle de lecteur d’écran et recette Worker/D1/R2 en production. Les tests de navigateur utilisent Chromium headless ; ils ne valent pas une certification de conformité.

## Captures

- [Accueil](tour-accueil.png)
- [Zone ciblée](tour-zone.png)
- [Trois zones de recherche](tour-plusieurs-zones.png)
- [Catalogage et explication](tour-catalogage.png)
- [Quatre modules distincts](tour-quatre-zones.png)
- [Exploration libre](tour-exploration.png)
- [Affichage agrandi](tour-agrandie.png)
- [Portable](tour-1366.png)
- [Tablette](tour-768.png)
- [Téléphone et cible lisible](tour-390.png)
- [Panneau sur téléphone](tour-mobile.png)

## Validation avant publication

Examiner la PR glossaire #1, puis cette PR de visite. Pour conserver l’ascendance de la branche, fusionner #1 avec « Create a merge commit » avant de fusionner la visite. Après validation et fusion dans main, le workflow GitHub Pages existant publiera l’ensemble. Aucune visite supplémentaire, fusion ou publication automatique n’a été exécutée.
