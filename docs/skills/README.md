# Skill tecniche — Poveroh

Indice delle skill (formato Anthropic, `SKILL.md` per cartella) che documentano
il **"come è costruito"** tecnico del monorepo Poveroh — architettura,
librerie, pattern, comunicazione FE/BE — indipendentemente dal dominio
applicativo (finanza personale) che il codice implementa.

Ogni skill è basata solo su codice reale ispezionato (`apps/api/`, `apps/app/`,
`packages/*`, `docker/`, `.github/`); i punti non deducibili dal codice sono
segnalati come "da verificare" nella sezione **Limiti e note** di ciascuna
skill. Due documenti già presenti in `docs/` (`docs/API_AUTH.md`,
`docs/TANSTACK_QUERY_USAGE.md`, `docs/ENV_SETUP.md`) sono stati letti e
referenziati dove pertinente, invece che duplicati.

**Nota trasversale**: né il backend (`apps/api`) né il frontend (`apps/app`)
hanno un framework di test configurato (nessun jest/vitest/playwright
trovato) — richiamato nelle skill dove rilevante invece che come skill
dedicata.

## Monorepo & tooling

- [architettura-monorepo-turborepo](architettura-monorepo-turborepo/SKILL.md) — struttura npm workspaces + Turborepo (`turbo.json`, apps/packages, pipeline di build/dev/lint), script di orchestrazione in root.
- [qualita-codice-lint-format-precommit](qualita-codice-lint-format-precommit/SKILL.md) — ESLint condiviso (`@poveroh/eslint-config`), Prettier, hook Husky pre-commit (esegue build+format completi, non lint-staged).
- [containerizzazione-docker-compose](containerizzazione-docker-compose/SKILL.md) — Dockerfile multi-stage (`node:22-alpine`), servizi in `docker-compose.local/prod.yml`, rete `poveroh_network`, entrypoint script.
- [ci-cd-github-actions](ci-cd-github-actions/SKILL.md) — unica workflow GitHub Actions (`docker-image.yml`): build & push immagini su `ghcr.io` al push su `main`. Nessuna pipeline di test/lint in CI.

## Backend

- [architettura-api-backend-layered](architettura-api-backend-layered/SKILL.md) — Express: middleware pipeline, pattern route→controller→service→repository, `BaseService`, `ContextService`/AsyncLocalStorage per lo scoping utente su richieste HTTP e job.
- [gestione-errori-validazione-risposte-api](gestione-errori-validazione-risposte-api/SKILL.md) — gerarchia `HttpError`, `ResponseHelper`, validazione con `parseRequestBody`+Zod: come si aggiunge un endpoint conforme alle convenzioni.
- [autenticazione-sessioni-better-auth](autenticazione-sessioni-better-auth/SKILL.md) — configurazione better-auth lato server (plugin, cookie cross-subdomain, hook su creazione utente) e integrazione con `AuthMiddleware`; lato client, `authClient`/`useAuth`/`RouteGuard`.
- [livello-dati-prisma-orm](livello-dati-prisma-orm/SKILL.md) — client Prisma condiviso (`@poveroh/prisma`), estensione `decimalToNumber`, pattern repository con `select` tipizzati, soft delete, migrazioni.
- [code-lavori-background-bullmq](code-lavori-background-bullmq/SKILL.md) — abstraction su BullMQ (`packages/queue`), dispatcher/worker factory, scheduling cron, processo worker separato dall'API.
- [event-bus-interno-side-effect](event-bus-interno-side-effect/SKILL.md) — pub/sub custom in-process per side-effect disaccoppiati dopo i workflow di servizio (audit log, sync di mercato, bank-sync).
- [cifratura-e-gestione-segreti](cifratura-e-gestione-segreti/SKILL.md) — utility di crypto (`crypto.ts`): AES-256-GCM, envelope encryption per chiavi utente, cifratura con application-secret e domain separation.
- [upload-file-storage-multi-backend](upload-file-storage-multi-backend/SKILL.md) — Multer a livello di route + `MediaService` + abstraction di storage multi-provider (locale/S3/GCS/Azure/DO).
- [logging-osservabilita](logging-osservabilita/SKILL.md) — Winston (rotazione file), integrazione Sentry/BetterStack/OpenTelemetry, disabilitati di default via env vars vuote.

## Comunicazione FE/BE

- [pipeline-contratti-api-openapi-codegen](pipeline-contratti-api-openapi-codegen/SKILL.md) — flusso completo: schema Zod → registry OpenAPI → spec → codegen contratti backend (`openapi-typescript-codegen`) → client tipizzato frontend (`@hey-api/openapi-ts`), con gli script npm di ogni passaggio.
- [client-api-generato-e-tanstack-query](client-api-generato-e-tanstack-query/SKILL.md) — come il client generato (`sdk.gen.ts`, `@tanstack/react-query.gen.ts`) viene consumato lato app: pattern hook `useQuery`/`useMutation`, invalidazione cache, query key.

## Frontend

- [architettura-frontend-nextjs-app-router](architettura-frontend-nextjs-app-router/SKILL.md) — Next.js App Router, pattern `page.tsx`/`view.tsx`, alias TS, `RouteGuard` (nessun `middleware.ts`).
- [gestione-stato-client-zustand](gestione-stato-client-zustand/SKILL.md) — store Zustand semplici vs persistiti (`persist` middleware), convenzioni di consumo nei componenti.
- [gestione-form-react-hook-form-zod](gestione-form-react-hook-form-zod/SKILL.md) — hook `use-*-form.ts` con React Hook Form + `zodResolver`, schema condivisi da `@poveroh/schemas`.
- [internazionalizzazione-next-intl](internazionalizzazione-next-intl/SKILL.md) — setup `next-intl`, struttura file locale, uso di `useTranslations`.
- [libreria-componenti-ui-shadcn-radix](libreria-componenti-ui-shadcn-radix/SKILL.md) — `packages/ui` costruito su Tailwind + Radix + convenzioni shadcn (`cva`, `cn()`), dark mode via `next-themes`.

## Ambiguità e note aperte segnalate durante l'analisi

- `turbo.json` (`globalEnv`) conserva ancora `SIGNOZ_ENABLED`/`SIGNOZ_ENDPOINT`, probabile residuo della rimozione dello stack Signoz (sostituito da Sentry+BetterStack).
- Il job `import.parse-csv` (`packages/types` `JobMap`) ha un handler ma non risulta dispatchato da nessuna parte: il parsing CSV avviene oggi in modo sincrono, non tramite coda.
- Lo schema condiviso `EncryptedPayloadSchema` (`packages/openapi/schemas/base.schema.ts`) non è ancora referenziato da nessun path/schema: l'implementazione di cifratura realmente in uso è `apps/api/src/utils/crypto.ts`.
- `Express.Request.user` è tipizzato come `JwtPayload | any` (`apps/api/src/types/express/index.d.ts`) — in tensione con la regola generale del progetto di non usare `as any`.
- L'orario esatto del cron di generazione snapshot (`snapshot-due.scheduler.ts`) è risultato discordante tra le fonti analizzate (00:06 vs 02:06): da verificare direttamente nel file.
- `docs/TANSTACK_QUERY_USAGE.md` (già presente nel repository) mostra query key come array di stringhe (`['getUser']`), mentre il codice reale usa il formato oggetto generato da hey-api (`[{ _id, ...params }]`) — le due convenzioni non coincidono esattamente.
- La locale in `apps/app/i18n/request.ts` risulta hardcoded a `'en'`: non è stato confermato un meccanismo di selezione lingua utente end-to-end.
- `apps/storybook` esiste come cartella ma senza `package.json` e non tracciata da git: non è un membro funzionante del workspace nonostante il pattern `apps/*`.
