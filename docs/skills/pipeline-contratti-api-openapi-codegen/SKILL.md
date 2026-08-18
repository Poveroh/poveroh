---
name: pipeline-contratti-api-openapi-codegen
description: >
  Descrive l'intera pipeline di generazione dei contratti API, dal schema
  Zod alla spec OpenAPI fino al client TypeScript tipizzato lato frontend,
  con i comandi npm di ogni passaggio. Usa questa skill quando devi
  aggiungere/modificare un tipo o un endpoint condiviso tra backend e
  frontend, ed eseguire npm run openapi:generate.
---

# Pipeline contratti API: Zod → OpenAPI → codegen

## Quando usarla / quando NON usarla
Usarla per: aggiungere un nuovo endpoint/tipo condiviso, capire perché un tipo generato non è aggiornato, o modificare uno schema Zod di contratto.

Non usarla per: il consumo lato frontend del client già generato (vedi `client-api-generato-e-tanstack-query`, che è il passo successivo di questa pipeline) o la validazione runtime lato backend (vedi `gestione-errori-validazione-risposte-api`).

## Come funziona
Pipeline numerata, dallo schema al consumo finale:

1. **Schema Zod** — si definisce/modifica in `packages/openapi/schemas/*.schema.ts` (es. `category.schema.ts`: `CategorySchema = z.object({...}).openapi('Category')`, con schema derivati come `CategoryDataSchema`, `CreateCategoryRequestSchema`). Il `z` usato è un'istanza Zod estesa per OpenAPI (`packages/openapi/zod.ts`, `extendZodWithOpenApi(z)`). Si registra il path corrispondente in `packages/openapi/paths/*.path.ts` (es. `registerCategoryPath(registry)` che chiama `registry.registerPath({ method: 'get', path: '/categories', ... })` per ogni verbo).
2. **Aggregazione registry** — `packages/openapi/registry.ts`: `createOpenApiRegistry()` scorre gli export di `schemas/index.ts` (`registerAllSchemas`) poi chiama ogni funzione `register*Path` (`registerAllPaths`).
3. **Generazione spec** — `packages/openapi/generate.ts`: costruisce un `OpenApiGeneratorV3(registry.definitions)`, unisce la spec di Better Auth pre-generata (`packages/openapi/better-auth-openapi.json`, prodotta da `generate-better-auth.ts`), e scrive `packages/openapi/openapi.json`. Eseguito via script `apps/api` `openapi:generate-main` (`ts-node ../../packages/openapi/generate.ts`).
4. **Codegen contratti backend** — script `apps/api` `openapi:generate-contracts`: `npx openapi-typescript-codegen -i ../../packages/openapi/openapi.json -o ../../packages/contracts/src/ --exportModels true --exportServices false --exportCore false --useUnionTypes`. Genera file come `packages/contracts/src/models/CategoryData.ts` (intestazione "do not edit").
5. **Codegen client frontend** — `apps/app/openapi-ts.config.ts` (`@hey-api/openapi-ts`): `client: '@hey-api/client-axios'`, `input: '../../packages/openapi/openapi.json'`, `output.path: './api'`, plugin `@hey-api/typescript`, `@hey-api/schemas`, `@hey-api/sdk`, `@tanstack/react-query`. Eseguito via script `apps/app` `openapi:generate` (`openapi-ts && prettier --write "./api/**/*.{ts,js}"`). Output: `apps/app/api/*.gen.ts` (SDK + hook React Query).
6. **`packages/types` avvolge i contratti** — `packages/types/src/lib/contracts.ts` è una sola riga: `export * from '@poveroh/contracts'`; gli altri moduli di `packages/types` costruiscono sopra questi tipi generati (es. `category.ts` importa `Category` da `./contracts.js` e definisce `defaultCategory: Category = {...}`). Così backend e frontend condividono un'unica superficie di import (`@poveroh/types`) sopra i tipi generati.

**Orchestrazione root**: `npm run openapi:generate` incatena `openapi:generate-api` (spec) → `openapi:generate-client` (client FE) → `format:contracts` (prettier) → `build:packages` (rebuilda `contracts, types, prisma, utils, redis, logger, schemas, queue` in quest'ordine, così `@poveroh/types` ri-esporta i contratti freschi).

## Input
Uno schema Zod nuovo/modificato in `packages/openapi/schemas/` e la relativa registrazione path in `packages/openapi/paths/`.

## Output
`packages/openapi/openapi.json` (spec), `packages/contracts/src/models/*.ts` (modelli backend generati), `apps/app/api/*.gen.ts` (SDK + hook TanStack Query tipizzati lato frontend), tipi ri-esportati da `@poveroh/types`.

## Dipendenze
Zod `^4.3.6`, `@asteasolutions/zod-to-openapi`, `openapi-typescript-codegen`, `@hey-api/openapi-ts` (+ `@hey-api/client-axios`), `better-auth` (per la sua spec OpenAPI dedicata).

## Esempio d'uso
```bash
# dopo aver aggiunto/modificato uno schema in packages/openapi/schemas/
npm run openapi:generate
```

## Limiti e note
- I file generati (`packages/contracts/dist/`, `apps/app/api/*.gen.ts`) **non vanno mai modificati a mano** — qualunque modifica manuale viene persa alla generazione successiva.
- Zod è davvero l'unica fonte di verità: sia la validazione runtime lato backend (`parseRequestBody`) sia i tipi TypeScript lato frontend derivano dallo stesso schema — un cambiamento allo schema richiede sempre di rieseguire l'intera pipeline, non solo la spec.
