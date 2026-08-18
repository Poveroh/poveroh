---
name: logging-osservabilita
description: >
  Descrive lo stack di logging e observability: Winston con rotazione file,
  integrazione Sentry e BetterStack (entrambi disabilitati di default via
  variabili d'ambiente vuote), e le tracce OpenTelemetry. Usa questa skill
  quando devi aggiungere un log, capire perché Sentry non riceve errori in
  locale, o abilitare/disabilitare un canale di observability.
---

# Logging e observability

## Quando usarla / quando NON usarla
Usarla per: usare il logger condiviso, configurare Sentry/BetterStack, capire il comportamento di default (disabilitato) di questi servizi cloud.

Non usarla per: la gestione degli errori applicativi HTTP (`HttpError`/`ResponseHelper`, vedi `gestione-errori-validazione-risposte-api`) — quello è un livello diverso rispetto al logging infrastrutturale.

## Come funziona
- **Logger**: Winston (`packages/logger/src/server/server.ts`), non pino/console nudo. `createWinstonLogger({ level, format: format.combine(errors({stack:true}), splat(), timestamp(...), printf(...)), transports: [DailyRotateFile('error-%DATE%.log', level:'error', maxFiles:'30d'), DailyRotateFile('combined-%DATE%.log'), new SentryTransport({level:'error'})] })`, con l'aggiunta condizionale di `Console`, `LogtailTransport` (BetterStack, se `BETTERSTACK_SOURCE_TOKEN` è impostato) e `OpenTelemetryTransportV3` (se `OTEL_EXPORTER_OTLP_ENDPOINT` è impostato). `SentryTransport` è una classe custom che estende `TransportStream` e forwarda i log di livello `error` a Sentry tramite un'integrazione iniettata (`setSentryIntegration`). Import standard: `import { logger } from '@poveroh/logger/server'`.
- **Sentry**: `apps/api/src/instrument.ts` (`@sentry/node`) e `apps/app/sentry.server.config.ts`/`sentry.client.config.ts` (`@sentry/nextjs`) fanno entrambi: `const dsn = process.env.SENTRY_DSN (|| NEXT_PUBLIC_SENTRY_DSN); if (dsn) { Sentry.init(...) }` — **no-op se il DSN non è impostato**. Entrambi chiamano anche `setSentryIntegration(...)` da `@poveroh/logger/server` per instradare gli errori del logger verso Sentry. `.env.example` ships `SENTRY_DSN=` / `NEXT_PUBLIC_SENTRY_DSN=` vuote → **disabilitato di default**.
- **BetterStack**: `packages/logger/src/client/browser.ts` importa lazy `@logtail/browser` solo `if (betterStackToken && typeof window !== 'undefined')`, dove `betterStackToken = process.env.NEXT_PUBLIC_BETTERSTACK_SOURCE_TOKEN || ''`. `.env.example` ships token vuoti → **disabilitato di default**.
- Il frontend porta anche dipendenze OpenTelemetry (`@vercel/otel`, `@opentelemetry/api`) come base per l'export OTLP.

## Input
Chiamate `logger.info/warn/error(...)` sparse nel codice backend; eventi non gestiti/eccezioni per Sentry (automatico, via `Sentry.setupExpressErrorHandler`/SDK Next.js).

## Output
File di log ruotati giornalmente (`error-%DATE%.log`, `combined-%DATE%.log`, retention 30 giorni), più — solo se configurati — eventi su Sentry/BetterStack/OTEL collector.

## Dipendenze
`winston`, `winston-daily-rotate-file`, `@sentry/node`/`@sentry/nextjs`, `@logtail/browser` (lazy), `@opentelemetry/*`, `@poveroh/logger` come package condiviso.

## Esempio d'uso
```ts
import { logger } from '@poveroh/logger/server'
logger.error('Failed to sync bank connection', { connectionId, error })
```
```env
# per abilitare Sentry in locale
SENTRY_DSN=https://xxx@sentry.io/yyy
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/yyy
```

## Limiti e note
- Nota di progetto: lo stack Signoz è stato rimosso in favore di Sentry+BetterStack (entrambi cloud, disabilitati di default via env vuote) — coerente con quanto osservato nel codice; `turbo.json` conserva però ancora `SIGNOZ_ENABLED`/`SIGNOZ_ENDPOINT` in `globalEnv`, probabile residuo da verificare/pulire.
- Senza DSN/token configurati, gli unici log realmente prodotti in locale sono i file di rotazione su disco: non aspettarsi nulla su Sentry/BetterStack in ambiente di sviluppo di default.
