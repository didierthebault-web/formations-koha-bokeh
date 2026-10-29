# Formations KOHA & BOKEH — code source

Ce dépôt contient une exportation publique expurgée du code source et une édition statique du portail de formation, déployée avec GitHub Pages. Il ne contient ni les documents de formation, ni leurs aperçus ou textes extraits, ni les leçons détaillées, ni les données et journaux de la plateforme. Les fichiers JSON de démonstration concernés sont des structures vides.

## Architecture

Application React/TypeScript basée sur Vinext, avec routes serveur, base D1 compatible SQLite et stockage de fichiers R2. L’authentification et les liaisons de stockage utilisées par l’instance Sites ne sont pas exportées. Les données actives restent gérées par l’instance hébergée ; elles ne sont pas dans ce dépôt.

La version complète de l’application requiert un environnement serveur compatible Workers/D1/R2 et une authentification configurée. GitHub Pages ne peut pas exécuter ces fonctions serveur ; le site statique publié depuis `docs/` fournit une interface publique de consultation avec parcours synthétiques, liens ouverts et glossaire interactif.

## Édition GitHub Pages

Le workflow `.github/workflows/pages.yml` publie le dossier `docs/` à chaque mise à jour de `main`. Dans les paramètres du dépôt, la source GitHub Pages doit être définie sur **GitHub Actions**.

## Installation locale

Prérequis : Node.js 22.13 ou supérieur et pnpm.

```sh
pnpm install --frozen-lockfile
pnpm run build
```

Ces commandes vérifient la compilation du code ; elles ne recréent pas le corpus ni la base de production. Pour héberger une instance, il faut provisionner les services serveur, configurer les variables secrètes hors du dépôt, puis intégrer un corpus pour lequel les droits de diffusion ont été vérifiés.

## Sécurité et diffusion

Ne jamais committer de secrets, variables d’environnement réelles, données d’utilisateurs, documents internes ou fichiers de production. Les configurations sensibles sont ignorées par `.gitignore`.

Aucune licence de réutilisation n’est déclarée dans ce dépôt.
