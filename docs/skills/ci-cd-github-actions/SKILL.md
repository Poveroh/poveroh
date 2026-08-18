---
name: ci-cd-github-actions
description: >
  Descrive la pipeline CI/CD del repository: l'unica GitHub Actions workflow
  che builda e pubblica le immagini Docker su ghcr.io al push su main. Usa
  questa skill quando devi modificare la pipeline di release, capire perché
  un'immagine non viene pubblicata, o aggiungere step di test/lint alla CI
  (attualmente assenti).
---

# CI/CD: GitHub Actions

## Quando usarla / quando NON usarla
Usarla per: capire/modificare cosa succede al push su `main`, il publishing delle immagini Docker, o valutare l'introduzione di step di test/lint in CI.

Non usarla per: il build Docker locale (vedi `containerizzazione-docker-compose`) o la qualità del codice pre-commit (vedi `qualita-codice-lint-format-precommit`).

## Come funziona
- Unico workflow: `.github/workflows/docker-image.yml` ("Build and Push Docker Images").
- Trigger: `push` sul branch `main` (nessun trigger su pull request o altri branch).
- Step: checkout → login su `ghcr.io` (`docker/login-action`) → copia `.env.example` in `.env` → generazione di certificati SSL self-signed in `infra/proxy/ssl/` → `docker compose -f docker/docker-compose.local.yml --env-file .env build` → push delle immagini `db api app redis proxy`.
- `.github/` contiene anche solo `ISSUE_TEMPLATE/` (`bug_report.yaml`, `feature_request.md`) — nessun altro workflow.

## Input
Push (merge) sul branch `main`.

## Output
Immagini Docker aggiornate pubblicate su `ghcr.io/poveroh/*`.

## Dipendenze
GitHub Actions, `docker/login-action`, Docker Buildx, i Dockerfile e il compose locale descritti in `containerizzazione-docker-compose`.

## Esempio d'uso
Nessuna azione manuale richiesta: il workflow si attiva automaticamente ad ogni push su `main`. Per replicarlo localmente:
```bash
cp .env.example .env
docker compose -f docker/docker-compose.local.yml --env-file .env build
```

## Limiti e note
- **Non esiste alcuna pipeline di test o lint in CI**: nessuna delle regole "run `npm run build`/`npm run format` before committing" viene verificata automaticamente su GitHub Actions — l'unica rete di sicurezza automatica è l'hook pre-commit locale (`qualita-codice-lint-format-precommit`), che ogni sviluppatore può bypassare con `--no-verify`.
- Il workflow pubblica ad ogni push su `main`, senza step di approvazione o tag di versione: non c'è distinzione tra build "di sviluppo" e release taggate.
