# TerrainGenerator

Refonte moderne d'un generateur procedural de terrain pour le web.

Le projet historique (AngularJS/Gulp/Bower/Express) a ete retire du runtime actif.
La version maintenue est maintenant dans `modern/` avec:

- React + TypeScript + Vite
- Three.js via react-three-fiber
- Generation infinie par chunks
- Generation asynchrone via Web Worker
- Cache LRU de chunks
- Tests Vitest
- Deploiement automatique GitHub Pages via GitHub Actions

## Getting Started

Prerequis:

- Node.js 20+

Installation:

```bash
cd modern
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

## Scripts racine

Le `package.json` racine expose des raccourcis qui deleguent vers `modern/`:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`

## Deploiement GitHub Pages

Workflow: `.github/workflows/deploy-pages.yml`

Pipeline sur push:

1. install
2. lint
3. test
4. build
5. deploy GitHub Pages
