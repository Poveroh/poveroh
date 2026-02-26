# OpenAPI Types in API

## Panoramica

L'API non usa più un file locale `src/generated/openapi.ts`.

I tipi OpenAPI condivisi vengono generati in:

```text
packages/contracts/src/generated/openapi.ts
```

e sono consumati nel server tramite `@poveroh/contracts`.

## Comandi

```bash
# Pipeline completa (api -> contracts -> app client)
npm run openapi:generate

# Solo step API (genera spec + contracts)
npm run openapi:generate-api

# Da apps/api
cd apps/api && npm run openapi:generate
```

## Uso nei controller API

```ts
import { components, paths } from '@poveroh/contracts'
```

## Workflow

1. Modifica endpoint/server code.
2. Aggiorna contract (Zod paths/schemas per route migrate, oppure `openapi.json` per route legacy).
3. Esegui `npm run openapi:generate`.
4. Usa i tipi aggiornati da `@poveroh/contracts`.

## Nota

Per i dettagli completi del flusso, vedi [docs/OPENAPI.md](../../../docs/OPENAPI.md).
