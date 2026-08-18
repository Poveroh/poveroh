---
name: code-lavori-background-bullmq
description: >
  Descrive l'abstraction sulle code di lavoro basata su BullMQ
  (packages/queue), il catalogo dei job (JobMap), il processo worker
  separato e lo scheduling cron. Usa questa skill quando devi aggiungere un
  nuovo tipo di job, capire come viene dispatchato/consumato, o schedulare
  un'esecuzione periodica.
---

# Code di lavoro in background (BullMQ)

## Quando usarla / quando NON usarla
Usarla per: aggiungere un job asincrono, un handler worker, o uno scheduling cron.

Non usarla per: la logica di business specifica di un job già esistente (snapshot, market-sync, bank-sync — vedi il codice dei rispettivi moduli) o l'event bus in-process sincrono (vedi `event-bus-interno-side-effect`, meccanismo diverso e complementare).

## Come funziona
- `packages/queue` dipende da `bullmq ^5.61.2` (più `@poveroh/redis`, `@poveroh/types`). Barrel `packages/queue/src/index.ts`:
  ```ts
  export * from './dispatcher/create-dispatcher'
  export * from './dispatcher/create-worker'
  ```
  Gli internals degli adapter (`adapters/bullmq/bullmq-dispatcher.ts`, `bullmq-worker.ts`, `redis-connection.ts`) **non** sono esportati dal barrel: solo le due factory sono superficie pubblica.
- `createJobDispatcher(redisConfig): JobDispatcher` — implementato da `BullMQJobDispatcher`, espone `dispatch(jobName, payload, options)` (→ `queue.add`), `schedule(jobName, payload, cronPattern, schedulerId)` (→ `queue.upsertJobScheduler`), `close()`.
- `createJobWorker(redisConfig, handlers: JobHandlers, logger, queueName = DEFAULT_QUEUE_NAME): Worker` — implementato da `createBullMQWorker`.
- `createBullMQConnectionOptions(config: RedisConnectionConfig)` (in `redis-connection.ts`) parsa `config.url` in `{ host, port, username, password, db }`.
- **Catalogo job** — `JobMap` in `packages/types/src/lib/queue.ts`: `snapshot.generate`, `snapshot.generate-due`, `import.parse-csv` (handler presente ma **mai dispatchato da nessuna parte del codice** — sembra un percorso asincrono pianificato ma non ancora collegato), `market.sync`, `bank-sync.sync-due`, `bank-sync.sync-connection`. Definisce anche `JobHandlers`, `DispatchOptions` (attempts, backoff, dedup id) e `JobDispatcher.schedule` (pattern cron).
- **Processo worker** (`apps/api/src/api/v1/worker/index.ts`): unisce le handler map di `snapshot.handlers.ts`, `import.handlers.ts`, `asset.handlers.ts`, `bank-sync.handlers.ts`, registra due scheduler cron (`snapshot-due.scheduler.ts` e `bank-sync-due.scheduler.ts` — l'orario esatto del primo è discordante tra le fonti analizzate, indicato sia come 00:06 che come 02:06: **da verificare direttamente nel file**), e gestisce `SIGINT`/`SIGTERM` per chiudere ordinatamente worker e dispatcher. Avviato con `npm run dev:worker` / `start:worker`, processo separato dall'API HTTP; nel container Docker corrisponde all'entrypoint `docker-worker-start.sh`.
- I job che devono agire per conto di un utente aprono manualmente il contesto richiesta (`contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, ...)`) perché girano fuori dal ciclo di vita di una richiesta HTTP — vedi `architettura-api-backend-layered`.

## Input
Un nome di job (chiave di `JobMap`) + payload tipizzato, dispatchato da un service o da uno scheduler cron.

## Output
Esecuzione asincrona dell'handler corrispondente nel processo worker; eventuale side-effect (es. snapshot generato, prezzi di mercato aggiornati, connessione bancaria sincronizzata).

## Dipendenze
BullMQ `^5.61.2`, Redis (`@poveroh/redis`), `@poveroh/types` per i tipi di `JobMap`/`JobHandlers`.

## Esempio d'uso
```ts
// dispatch di un job da un service (dentro una richiesta HTTP)
await jobDispatcher.dispatch('market.sync', { assetId })

// registrazione di un handler nel worker
const assetJobHandlers: Partial<JobHandlers> = {
    'market.sync': async ({ assetId }) => { /* ... */ }
}
```

## Limiti e note
- `import.parse-csv` è definito nel catalogo `JobMap` e ha un handler, ma **non risulta dispatchato da nessuna parte**: il parsing CSV oggi avviene sincronamente dentro `ImportService.createImport`, non tramite coda — probabile codice morto o funzionalità non ancora completata.
- Nessun dashboard/monitoring delle code (es. Bull Board) è stato trovato nel repository.
