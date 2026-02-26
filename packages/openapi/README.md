# @poveroh/openapi

Shared API contract types generated from `openapi.json`.

## Generate

From repository root:

```bash
npm run openapi:generate
```

This flow generates:

- `apps/api/src/generated/openapi.ts` (server-side OpenAPI typings)
- `packages/contracts/src/generated/openapi.ts` (shared DTO/API contract typings)
- `apps/app/generated/api/*` (typed API client)
