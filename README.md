# Formations KOHA & BOKEH

Plateforme de formation du réseau documentaire du ministère de la Culture, restaurée depuis les sources complètes de Sites (révision `13bcaa1ab4c1898542fd4976d4f3e254d3090339`).

La version GitHub Pages conserve les composants React, les styles, les icônes, le logo KOHA et le kiwi d’origine. Elle donne accès aux 4 parcours, 34 modules, 77 leçons, 9 documents avec leurs aperçus PDF, illustrations, recherche documentaire et glossaire de 41 termes. Les quatre liens de documentation officielle complètent la bibliothèque.

Les documents et les contenus auparavant retirés de l’export sont rétablis avec l’autorisation explicite du propriétaire le 29 octobre 2026. Les originaux sont conservés sans modification ; leurs empreintes SHA-256 sont vérifiées à la compilation.

## Construire la version GitHub Pages

```sh
npm ci --prefix pages
npm run build --prefix pages
```

`pages/build.mjs` réutilise les composants `app/platform.tsx`, `app/cataloguer.tsx`, `app/glossary.tsx` et la feuille `app/globals.css`. L’adaptateur `pages/public-api.ts` fournit les données de consultation dans le navigateur et relie les documents et illustrations aux fichiers statiques. Aucun compte fictif ni droit d’administration n’est créé.

Les sorties de compilation se trouvent dans `docs/`. Le workflow `.github/workflows/pages.yml` publie ce dossier à chaque mise à jour de `main`.

## Vérification

`pages/test-browser.cjs` contrôle les 77 leçons, les 9 originaux téléchargeables, les aperçus PDF, les illustrations des leçons, le logo et le kiwi, la recherche, le glossaire et le menu mobile. Il utilise Playwright installé séparément ; `PLAYWRIGHT_MODULE` et `PLAYWRIGHT_EXECUTABLE` permettent d’indiquer les chemins du runtime et du navigateur.

```sh
node pages/test-browser.cjs http://127.0.0.1:8776/
```

## Application avec serveur

Le code de l’application d’origine reste dans `app/`, `lib/`, `db/` et `worker/`. Les fonctions d’administration partagée, la gestion des comptes et des inscriptions nécessitent un serveur Workers/D1/R2 et une authentification configurée. GitHub Pages publie les contenus en consultation libre. Aucun compte, journal d’utilisateurs, secret ou jeton Sites n’est publié.

Les documents et les marques conservent leurs droits respectifs.
