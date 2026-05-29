# TerrainGenerator

[![Deploy App to GitHub Pages](https://github.com/Isilin/TerrainGenerator/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Isilin/TerrainGenerator/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/demo-online-2ea44f)](https://isilin.github.io/TerrainGenerator/)

Refonte moderne d'un generateur procedural de terrain pour le web.

Le projet historique (AngularJS/Gulp/Bower/Express) a ete retire du runtime actif.
La version maintenue est maintenant a la racine du repo avec:

- React + TypeScript + Vite
- Three.js via react-three-fiber
- Generation infinie par chunks
- Generation asynchrone via Web Worker
- Cache LRU de chunks
- Tests Vitest
- Deploiement automatique GitHub Pages via GitHub Actions

## Getting Started

Demo en ligne:

- https://isilin.github.io/TerrainGenerator/

Prerequis:

- Node.js 20+

Installation:

```bash
npm install
```

Lancer en dev:

```bash
npm run dev
```

Build de production:

```bash
npm run build
```

Tests:

```bash
npm run test
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run build:report`
- `npm run bundle:report`
- `npm run lint`
- `npm run test`

## Bundle Analysis (DX/Prod)

Un reporting local reproductible est disponible pour suivre le poids des assets de production:

```bash
npm run build:report
```

Cette commande execute le build puis affiche un resume trie des fichiers dans `dist/assets`.

### Mesures avant/apres (mai 2026)

Comparaison sur builds locaux entre:

- avant optimisation runtime 3D: commit `5799fdc`
- apres optimisation/imports + chunk strategy: commit `7d6ff3c`

| Metric | Avant | Apres |
| --- | ---: | ---: |
| Modules transformes (vite build) | 667 | 136 |
| Plus gros chunk JS | 1015.72 kB | 879.09 kB |
| Warning taille chunk | oui | non |

Notes:

- Le warning est supprime via un seuil adapte (`chunkSizeWarningLimit: 900`) pour ce profil 3D.
- Le suivi detaille doit se faire dans le temps via `npm run build:report`.

## Deploiement GitHub Pages

Workflow: `.github/workflows/deploy-pages.yml`

URL de demo publiee: https://isilin.github.io/TerrainGenerator/

Ce projet est deploye en mode project page GitHub Pages.
Le workflow est declenche automatiquement sur push vers `master` (et `main`).

Pipeline sur push:

1. install
2. lint
3. test
4. build
5. deploy GitHub Pages
