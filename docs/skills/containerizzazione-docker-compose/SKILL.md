---
name: containerizzazione-docker-compose
description: >
  Descrive come Poveroh viene containerizzato: Dockerfile multi-stage per
  api/app, Dockerfile di infrastruttura (db, redis, proxy, studio) e la
  topologia dei servizi in docker-compose.local.yml/docker-compose.prod.yml.
  Usa questa skill quando devi avviare l'ambiente locale con Docker,
  modificare un Dockerfile, aggiungere un nuovo servizio al compose, o
  capire come i container comunicano sulla rete poveroh_network.
---

# Containerizzazione e Docker Compose

## Quando usarla / quando NON usarla
Usarla per: avviare/debuggare l'ambiente Docker locale o di produzione, modificare un Dockerfile multi-stage, capire la topologia dei servizi e le porte esposte.

Non usarla per: la pipeline di build/push delle immagini in CI (vedi `ci-cd-github-actions`) o la gestione delle variabili d'ambiente in dettaglio (vedi `docs/ENV_SETUP.md` nel repository).

## Come funziona
- **`apps/api/api.dockerfile`**: base `node:22-alpine`. Stage `builder` (`turbo prune api --docker`) → stage `installer` (`npm install --ignore-scripts`, `npx prisma generate`, `npx turbo build`, `npm prune --omit=dev`) → stage `runner` (copia `dist/`, `node_modules`, `packages/` — rimuovendo `src/`/`.ts`/tsconfig dai package tranne `prisma.config.ts` —, utente non-root `userapi`, `ENTRYPOINT ["/app/docker-api-start.sh"]`, `EXPOSE 3001`).
- **`apps/app/app.dockerfile`**: stessa base `node:22-alpine`. Stage `builder` (`turbo prune app --docker`) → `installer` (`npm ci --ignore-scripts`, builda esplicitamente `@poveroh/types` e `@poveroh/utils` prima della `turbo build` completa) → `runner` (copia l'output Next `standalone` + `.next/static` + `public`, utente non-root `nextjs`, `ENTRYPOINT ["/app/docker-app-setup.sh"]`, `CMD ["node","apps/app/server.js"]`, `EXPOSE 3000`).
- **Dockerfile di infrastruttura**: `infra/db/db.dockerfile` (Postgres), `infra/db/studio.dockerfile` (Prisma Studio, richiede build arg `DATABASE_URL`), `infra/redis/redis.dockerfile`, `infra/proxy/proxy.dockerfile` (nginx, config in `infra/proxy/nginx.conf`, monta `./ssl`).
- **`docker/docker-compose.local.yml`** (build locale da Dockerfile, rete esterna `poveroh_network`): servizi `redis` (6379), `db` (5432), `studio` (5555, solo locale), `api` (3001, esegue le migration Prisma all'avvio), `worker` (stessa immagine di `api`, `entrypoint: docker-worker-start.sh`, nessuna porta pubblicata — consumer di code), `app` (3000), `proxy` (80/443, termina TLS e serve la CDN statica).
- **`docker/docker-compose.prod.yml`**: stessa topologia di servizi, ma senza blocchi `build:` — usa immagini precompilate `ghcr.io/poveroh/poveroh-*:latest`; monta `./ssl` per il proxy.
- Script di bootstrap locale: `scripts/setup/{db,env,proxy,redis}.js` (uno-off CLI: `proxy.js` genera certificati TLS locali via mkcert e aggiorna l'hosts file). Entrypoint container: `scripts/docker-api-start.sh` / `docker-worker-start.sh` (attendono il DB, eseguono `prisma migrate deploy` — solo per `api` — poi lanciano l'entrypoint compilato).

## Input
Variabili d'ambiente da `.env`/`.env.production` (vedi `docs/ENV_SETUP.md`), certificati TLS locali generati da `scripts/setup/proxy.js`.

## Output
Container in esecuzione su `poveroh_network`: frontend su `app.poveroh.local`, API su `api.poveroh.local`, CDN su `cdn.poveroh.local`, tutti dietro il proxy nginx.

## Dipendenze
Docker, Docker Compose, mkcert (per i certificati locali), le immagini base `node:22-alpine`, `nginx`, Postgres, Redis.

## Esempio d'uso
```bash
# avvia tutti i servizi locali (build incluso)
npm run docker-dev

# avvia solo un servizio specifico
npm run docker-dev:api
```

## Limiti e note
- `docker-worker-start.sh` non esegue `prisma migrate deploy` (lo fa solo l'entrypoint `api`): il worker assume che lo schema sia già migrato dal container `api`.
- Non esiste alcun servizio di test/CI locale nel compose: la validazione avviene solo tramite build Docker riuscita.
