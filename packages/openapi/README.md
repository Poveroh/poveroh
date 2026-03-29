# @poveroh/openapi

Shared API contract types generated from `openapi.json`.

This package automatically integrates Better Auth endpoints into the OpenAPI specification.

## Generate

From repository root:

```bash
npm run openapi:generate
```

This flow generates:

1. `packages/openapi/better-auth-openapi.json` (Better Auth schema - cached, not committed)
2. `packages/openapi/openapi.json` (merged OpenAPI spec with Better Auth + custom endpoints)
3. `packages/types/src/contracts/*` (shared DTO/API contract typings)
4. `apps/app/api/*` (typed API client with TanStack Query hooks)

## Better Auth Integration

The OpenAPI generation automatically includes Better Auth authentication endpoints:

- Sign in/up (email, social)
- Session management
- Password reset/change
- Email verification
- User profile updates

The integration happens in two steps:

1. `tsx generate-better-auth.ts` - Extracts Better Auth OpenAPI schema
2. `ts-node generate.ts` - Merges Better Auth schema with custom API endpoints
