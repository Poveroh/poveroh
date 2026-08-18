---
name: livello-dati-prisma-orm
description: >
  Descrive la configurazione del client Prisma condiviso (@poveroh/prisma),
  l'estensione che converte automaticamente i campi Decimal in number, e le
  convenzioni di repository (select tipizzati, soft delete, migrazioni).
  Usa questa skill quando devi scrivere una query Prisma, creare un nuovo
  repository, gestire un campo Decimal, o eseguire una migrazione dello
  schema.
---

# Livello dati: Prisma ORM

## Quando usarla / quando NON usarla
Usarla per: scrivere/estendere un repository, capire perché i valori `Decimal` arrivano già come `number`, gestire soft delete, o eseguire `prisma migrate`.

Non usarla per: la definizione degli schema Zod di validazione API (vedi `pipeline-contratti-api-openapi-codegen`) o la cifratura dei campi sensibili (vedi `cifratura-e-gestione-segreti`).

## Come funziona
- **Schema**: `packages/prisma/schema.prisma` — `datasource db { provider = "postgresql" }` (l'URL non è inline ma arriva da `prisma.config.ts`), `generator client { provider = "prisma-client-js", previewFeatures = ["views"] }`, nessun `output` custom (il client genera nel percorso di default di `@prisma/client`).
- **Config Prisma 7**: `packages/prisma/prisma.config.ts` carica il `.env` di root (via `dotenv-expand`) e chiama `defineConfig({ schema: 'schema.prisma', migrations: { path: 'migrations' }, datasource: { url: env('DATABASE_URL') } })` — l'API di configurazione di Prisma 7, non lo storico `schema.prisma` con `url` inline.
- **Estensione decimal→number**: `packages/prisma/src/extensions/decimal-to-number.extension.ts` — `decimalToNumberExtension = Prisma.defineExtension({ name: 'decimalToNumber', query: { $allModels: { async $allOperations({ query, args }) { const result = await query(args); return convertDecimals(result) } } } })`; `convertDecimals` percorre ricorsivamente array/oggetti e converte ogni `Prisma.Decimal` in `.toNumber()`. **Per questo nessun service/repository deve mai convertire un `Decimal` a mano.**
- **Packaging del client**: `packages/prisma/src/index.ts` — `const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })`; `const prisma = new PrismaClient({ adapter }).$extends(decimalToNumberExtension)`; `export default prisma; export { Prisma }` più un tipo derivato `PrismaTransactionClient`. Il package si builda con `tsc` e ha `postinstall: "prisma generate || true"`.
- **Convenzione di consumo**: ogni repository fa `import prisma from '@poveroh/prisma'` — mai istanziare `PrismaClient` direttamente altrove nel monorepo.
- **Pattern repository**, esempio (`category.repository.ts`): metodi come `create(userId, id, payload)`, `findMany(userId, filters, skip, take)` che usano `buildWhere()` (helper condiviso) per i filtri di lista, e oggetti `select` tipizzati come `categorySelect` / `categoryWithSubcategoriesSelect` (definiti in `@/types/select`, tipicamente con `satisfies Prisma.CategorySelect`).
- **Soft delete**: le entità utente-owned usano un campo `deletedAt`, escluso dalle letture normali — confermato dal pattern `deleteCategory`/`deleteAllCategories`/`deleteAsset`/`deleteAllAssets` visto nei service di dominio.
- **Migrazioni**: `npm run prisma:generate` / `prisma:migrate` / `prisma:deploy` / `prisma:studio` (script di root, eseguiti come `cd packages/prisma && npx prisma <cmd>`).

## Input
Uno schema `.prisma` aggiornato (per le migrazioni) o chiamate a metodi di repository con `userId` + filtri/payload.

## Output
Righe DB con ogni `Decimal` già convertito in `number` JS puro; per le migrazioni, un nuovo file sotto `packages/prisma/migrations/` applicato al database.

## Dipendenze
Prisma `^7.6.0` (`@prisma/client`, `prisma`), adapter `@prisma/adapter-pg` (`PrismaPg`), Postgres.

## Esempio d'uso
```ts
// packages/prisma/src/index.ts (uso interno, non da replicare altrove)
import prisma from '@poveroh/prisma'

// repository
async findMany(userId: string, filters: CategoryFilters, skip: number, take: number) {
    return prisma.category.findMany({
        where: buildWhere(userId, filters, { deletedAt: null }),
        select: categorySelect,
        skip, take
    })
}
```
```bash
npm run prisma:migrate   # crea/applica una migrazione in dev
npm run prisma:studio    # esplora il DB visivamente
```

## Limiti e note
- Non essendoci un `output` custom nel generator, il client Prisma generato vive nel percorso di default di `node_modules/@prisma/client`: attenzione a non confonderlo con l'export `@poveroh/prisma` (il singleton esteso), che è quello da importare sempre.
- Nessuna validazione automatica che un repository stia effettivamente applicando il filtro `userId`/soft-delete — è una convenzione manuale, non imposta a livello di tipo.
