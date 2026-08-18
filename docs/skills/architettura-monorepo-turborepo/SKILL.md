---
name: architettura-monorepo-turborepo
description: >
  Descrive come è organizzato il monorepo Poveroh (npm workspaces + Turborepo):
  elenco di apps/ e packages/, configurazione di turbo.json, tsconfig
  condivisi e script di build/dev/lint orchestrati dalla root. Usa questa
  skill quando devi capire dove vive un pacchetto, come viene buildato in
  ordine di dipendenza, come aggiungere un nuovo package al workspace, o
  quali comandi (npm run build, npm run dev, turbo build) eseguire dalla
  root del repository.
---

# Architettura monorepo (npm workspaces + Turborepo)

## Quando usarla / quando NON usarla
Usarla quando: devi capire la struttura generale del repository, aggiungere un nuovo package/app al workspace, capire l'ordine di build delle dipendenze, o scegliere il comando npm/turbo giusto da eseguire dalla root.

Non usarla per: dettagli implementativi di un singolo package (vedi le skill dedicate a backend, frontend, Prisma, code, ecc.) o per il deploy Docker (vedi `containerizzazione-docker-compose`).

## Come funziona
- Gestore pacchetti: npm workspaces, campo `workspaces: ["apps/*", "packages/*"]` in `package.json` (root), `packageManager: "npm@10.8.1"`, `engines.node: ">=22"`.
- Orchestratore build/dev/lint: Turborepo `^2.7.2`, configurato in `turbo.json`:
  - `build`: `dependsOn: ["^build"]` (builda prima le dipendenze), `outputs: ["dist/**", ".next/**", "!.next/cache/**"]`.
  - `lint` e `check-types`: dipendono anch'essi da `^build`.
  - `dev` / `dev:worker`: `cache: false`, `persistent: true` (processi long-running, mai cachati).
  - `globalDependencies: [".env"]`, `globalEnv` include `NODE_ENV`, `LOG_LEVEL`, `SIGNOZ_ENABLED`, `SIGNOZ_ENDPOINT`.
- Apps (`apps/`):
  - `api` — backend Express, sorgente di verità OpenAPI, consumer Prisma, host del worker BullMQ.
  - `app` — frontend Next.js 16 (App Router), client API generato + hook TanStack Query.
  - `storybook` — cartella residua senza `package.json` e non tracciata da git: non è un vero membro del workspace nonostante il pattern `apps/*` la includa.
- Packages (`packages/`): `bank-sync` (integrazione Plaid/LunchFlow), `contracts` (modelli OpenAPI generati, non modificare a mano), `eslint-config` (config ESLint condivise), `logger` (winston + Sentry/BetterStack), `market-data` (client Yahoo Finance/Finnhub/Massive), `openapi` (schema Zod + generatore spec), `prisma` (schema/client/migrazioni DB), `queue` (abstraction BullMQ), `redis` (client Redis condiviso), `schemas` (re-export dei Zod schema di `openapi`), `tsconfig` (basi tsconfig condivise), `types` (tipi di dominio + re-export di `contracts`), `ui` (libreria componenti shadcn/Radix), `utils` (helper condivisi).
- TypeScript: root `tsconfig.json` fa solo `{"extends": "@poveroh/tsconfig/base.json"}`. `packages/tsconfig/base.json` imposta `module`/`moduleResolution: "NodeNext"`, `target: "ES2022"`, `strict: true`, `noUncheckedIndexedAccess: true`, `isolatedModules: true`. Varianti: `packages/tsconfig/nextjs.json` (usata da `apps/app`), `packages/tsconfig/react-library.json` (usata da `packages/ui`).
- Script di root (`package.json`) rilevanti:
  - `build` → esegue prima `build:packages` (build sequenziale di `contracts, types, prisma, utils, redis, logger, schemas, queue`) poi `turbo build` (fan-out su tutti i workspace).
  - `dev` → `turbo run dev dev:worker --filter=api --filter=app`; `dev:all` → stessi task su tutti i workspace; `dev:api` / `dev:app` → `turbo dev --filter=<pkg>`.
  - `lint` → `turbo lint`.
  - `format` → `prettier --write "**/*.{ts,tsx,md,json}"` poi `format:prisma` (`prisma format --schema packages/prisma/schema.prisma`).
  - `openapi:generate` → intera pipeline di codegen contratti (vedi skill `pipeline-contratti-api-openapi-codegen`).
  - `prisma:generate` / `prisma:migrate` / `prisma:deploy` / `prisma:studio` → `cd packages/prisma && npx prisma <cmd>`.
  - `docker-dev` / `docker-dev:<service>` → avvio Docker Compose locale (vedi skill `containerizzazione-docker-compose`).
  - `clean` / `clean:build` / `clean:turbo` → rimozione ricorsiva di `node_modules`, `dist`/`.next`/`.turbo`.

## Input
Nessun input runtime: è una struttura statica di configurazione. L'"input" operativo è il comando npm/turbo che si vuole eseguire dalla root del repository.

## Output
- Build in ordine di dipendenza dei package (`npm run build`).
- Processi di sviluppo paralleli per API/app (`npm run dev`).
- Cache di build/lint di Turborepo (locale, in `.turbo/`).

## Dipendenze
- Turborepo `^2.7.2`, npm `>=10.8.1`, Node `>=22`.
- Ogni package/app dichiara le proprie dipendenze workspace tramite `"@poveroh/x": "*"` in `package.json`.

## Esempio d'uso
```bash
# build completo nell'ordine corretto (packages poi apps)
npm run build

# sviluppo di API + app in parallelo
npm run dev

# solo lint, su tutto il monorepo
npm run lint
```

## Limiti e note
- Il pre-commit hook Husky esegue `npm run build` e `npm run format` per intero ad ogni commit (vedi skill `qualita-codice-lint-format-precommit`): non c'è build incrementale scoped ai soli file modificati lato hook.
- `apps/storybook` esiste come cartella ma non è un package funzionante: da verificare se è lavoro in corso o uno scarto da rimuovere.
- I riferimenti a `SIGNOZ_ENABLED`/`SIGNOZ_ENDPOINT` in `turbo.json` `globalEnv` sono probabilmente residui della rimozione dello stack Signoz (sostituito da Sentry+BetterStack): da verificare se vanno rimossi.
