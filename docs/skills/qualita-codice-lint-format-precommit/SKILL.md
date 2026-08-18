---
name: qualita-codice-lint-format-precommit
description: >
  Descrive la configurazione di qualità del codice del monorepo: ESLint
  condiviso via @poveroh/eslint-config, Prettier, e l'hook Husky pre-commit.
  Usa questa skill quando devi capire perché un commit viene rifiutato,
  aggiungere/adattare regole di lint per un nuovo package, o capire cosa
  viene eseguito automaticamente prima di ogni `git commit`.
---

# Qualità del codice: lint, format e pre-commit

## Quando usarla / quando NON usarla
Usarla per: capire cosa esegue l'hook pre-commit, configurare ESLint/Prettier in un nuovo package, diagnosticare un fallimento di `npm run build`/`npm run format` durante un commit.

Non usarla per: la pipeline CI (vedi `ci-cd-github-actions`, che non esegue lint/test) o la configurazione di build Turborepo in generale (vedi `architettura-monorepo-turborepo`).

## Come funziona
- ESLint: root `.eslintrc.js` si applica solo alla root del workspace (`ignorePatterns: ['apps/**','packages/**']`) ed estende `@poveroh/eslint-config/library.js`. Ogni app/package ha la propria config che estende una delle varianti esportate da `packages/eslint-config` (`./base`, `./next-js`, `./react-internal`).
- Prettier: config unica in root `.prettierrc` — 4 spazi di indentazione, nessun punto e virgola, virgolette singole, `printWidth: 120`, `arrowParens: 'avoid'`.
- Hook Husky: `.husky/pre-commit` esegue, in sequenza:
  ```
  npm run build
  npm run format
  ```
  Non è scoped ai soli file modificati (nessun `lint-staged`): ogni commit ricompila e riformatta l'intero monorepo.
- Script root: `lint` → `turbo lint` (fan-out sul task `lint` di ogni workspace, tipicamente `eslint . --max-warnings 0`); `format` → `prettier --write "**/*.{ts,tsx,md,json}"` seguito da `format:prisma` (`prisma format --schema packages/prisma/schema.prisma`).

## Input
Il diff staged al momento del `git commit`.

## Output
- Commit bloccato se `npm run build` fallisce (errore di compilazione in un qualsiasi package/app).
- File riformattati automaticamente da Prettier prima che il commit venga finalizzato.

## Dipendenze
- `husky`, `eslint` (flat config `@poveroh/eslint-config`), `prettier`, Turborepo per il fan-out dei task `lint`/`build`.

## Esempio d'uso
```bash
# eseguito automaticamente da Husky ad ogni commit:
npm run build
npm run format

# eseguibile manualmente per verificare prima di committare
npm run lint
npm run format
```

## Limiti e note
- Poiché l'hook esegue una build completa del monorepo (non incrementale sui soli file modificati), i commit su repository grandi possono essere lenti: non c'è `lint-staged` o scoping per-package.
- Non esiste alcuna esecuzione di test automatici nella pipeline pre-commit: nessun framework di test è configurato nel repository (nessun jest/vitest/playwright trovato né in `apps/api` né in `apps/app`).
