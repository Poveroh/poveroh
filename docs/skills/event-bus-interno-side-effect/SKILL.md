---
name: event-bus-interno-side-effect
description: >
  Descrive l'event bus custom in-process (non basato su EventEmitter) usato
  per disaccoppiare side-effect (audit log, sync di mercato, trigger di
  bank-sync) dai workflow principali dei service. Usa questa skill quando
  devi emettere un nuovo evento di dominio dopo una scrittura, o registrare
  un nuovo subscriber che reagisce a un evento esistente.
---

# Event bus interno per side-effect disaccoppiati

## Quando usarla / quando NON usarla
Usarla per: emettere/sottoscrivere eventi di dominio interni al processo API.

Non usarla per: comunicazione tra processi diversi (API↔worker) — quello è il ruolo delle code BullMQ, vedi `code-lavori-background-bullmq`.

## Come funziona
- `apps/api/src/api/v1/worker/events/event-bus.ts` implementa un pub/sub tipizzato scritto a mano (non estende `EventEmitter` di Node): `class EventBus { private readonly handlers = new Map<DomainEventName, DomainEventHandler<DomainEventName>[]>() }`.
- `async emit(eventName, payload)`: esegue tutti gli handler registrati con `Promise.all`, catturando e loggando (`logger.error`) il fallimento di ciascun handler singolarmente — così un side-effect che fallisce **non interrompe** il workflow principale già commitato.
- `on(eventName, handler)`: registra un handler nella mappa.
- Singleton condiviso: `export const eventBus = new EventBus()`.
- **Subscriber registrati all'avvio** (`apps/api/src/index.ts`): `registerActivitySubscribers()`, `registerMarketSyncSubscribers()`, `registerBankSyncSubscribers()`.
  - `activity.subscriber.ts`: mappa ~20 eventi di dominio (categorie/sottocategorie/abbonamenti/conti finanziari/transazioni/asset/transazioni-asset/import/utente/preferenze-utente/dashboard/snapshot/credenziali-market-data/connessioni-bank-sync/sync-bank-sync) verso `UserActivityService.record` — è così che si popola `GET /v1/user/me/activities`.
  - `market-sync.subscriber.ts`: su `asset.created`/`asset.updated` (solo per asset "marketable") e su ogni `asset-transaction.*`, dispatcha il job `market.sync`.
  - `bank-sync.subscriber.ts`: su `bank-sync-connection.linked`, dispatcha immediatamente il job `bank-sync.sync-connection` (trigger `INITIAL`) invece di aspettare il cron notturno.
- **Convenzione di emissione**: un service chiama `await eventBus.emit('entity.action', { userId, data })` subito dopo una scrittura Prisma commitata con successo.

## Input
Un nome di evento (`DomainEventName`) e un payload tipizzato, emesso da un service dopo un'operazione di scrittura.

## Output
Esecuzione best-effort di tutti gli handler registrati per quell'evento; nessun valore di ritorno consumato dal chiamante (`emit` è fire-and-forget rispetto al workflow principale, anche se `await`-ato).

## Dipendenze
Nessuna libreria esterna — implementazione custom in `apps/api/src/api/v1/worker/events/`. Si appoggia a `@poveroh/queue` quando un subscriber deve dispatchare un job asincrono (es. `market-sync.subscriber.ts`).

## Esempio d'uso
```ts
// emissione, dentro un service
await eventBus.emit('category.created', { userId, data: category })

// sottoscrizione, in un file *.subscriber.ts registrato all'avvio
eventBus.on('category.created', async ({ userId, data }) => {
    await new UserActivityService().record(userId, 'category.created', data)
})
```

## Limiti e note
- Gli handler devono essere "best-effort": se un handler lancia, viene solo loggato — non c'è retry automatico né dead-letter per gli eventi in-process (a differenza dei job BullMQ, che hanno `attempts`/`backoff`).
- Essendo in-process, questi eventi **non attraversano** il confine API↔worker: un evento emesso nell'API non è visibile al processo worker se non tramite un dispatch esplicito di job (come fa `market-sync.subscriber.ts`).
