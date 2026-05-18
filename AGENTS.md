# Poveroh Agent Profiles

This file defines specialized agent profiles for working on the Poveroh codebase. Each profile has a specific scope, set of rules, and verification steps. All agents must follow the base rules in [CLAUDE.md](CLAUDE.md) in addition to the profile-specific rules below.

---

## Backend Agent

**Role**: Express.js API development — services, controllers, routes, middleware, database queries.

**Scope**: `apps/api/`, `packages/prisma/`, `packages/schemas/`, `packages/types/`, `packages/queue/`

### Rules

- API features live in `apps/api/src/api/v1/modules/<feature>/` with colocated `*.controller.ts`, `*.service.ts`, and, when Prisma access is non-trivial, `*.repository.ts`
- Business logic belongs in module services, never in controllers
- Controllers are thin: extract params/body/query/files, validate with Zod via `parseRequestBody`, instantiate services without passing `userId`, delegate, return response
- Always extend `BaseService` for new services and call `super('entity-location')`; read the authenticated user through  `this.context.currentUser`
- Use `this.saveFile(entityId, file)` or `this.media` for uploads so files are stored under the current context user and service location
- Use `HttpError` subclasses for errors (`BadRequestError`, `NotFoundError`, `ConflictError`, `ValidationError`, etc.)
- Always wrap controller bodies in `try/catch` with `ResponseHelper.handleError(res, error)` in the catch
- Use `ResponseHelper.success<T>(res, data)` for 200, `ResponseHelper.created<T>(res, data)` for 201
- Keep Prisma calls in services only for workflow-heavy logic; otherwise use module repositories for CRUD, filtering, soft deletes, and DTO mapping
- Repository reads use named `select` objects with `satisfies Prisma.*Select`, `Prisma.*GetPayload`, and `toData()` mappers when database types differ from API DTOs (`Decimal`, `Date`, nullable fields)
- Use `select` in Prisma queries when you don't need all fields, and always scope user-owned data by `userId`
- Use `buildWhere()` for list filters instead of building ad hoc Prisma filter objects in controllers
- Prefer soft deletes with `deletedAt` for user data that must preserve history, and exclude `deletedAt` rows from normal reads
- Import Prisma client from `@poveroh/prisma`, never instantiate `PrismaClient` directly
- Add comments before every service and helper function explaining the business logic
- Keep request context centralized in `apps/api/src/api/v1/modules/base/context.service.ts`; do not add facade files or wrapper functions that duplicate `ContextService` methods
- Use the shared `AppContext` and `User` types from `@poveroh/types` for application context; do not create parallel context/user types such as `RequestContext` or `RequestUser`
- API service and helper comments use JSDoc blocks with `@param` and `@returns` where applicable, and must stay consistent with surrounding project style
- Use `eventBus.emit()` for decoupled side effects after committed service workflows; event handlers must be best-effort and must not break the main workflow
- Queue job payload types live in `@poveroh/types` (`JobMap`, `JobHandlers`, `JobDispatcher`); runtime queue factories come from `@poveroh/queue`
- Worker jobs run outside HTTP requests, so wrap service calls in `contextService.runWithContext({ user }, callback)` with a full shared `User`/`AppContext`
- Route files live in `apps/api/src/api/v1/routes/`, apply `AuthMiddleware.isAuthenticated` to protected endpoints, apply `upload.single()`/`upload.array()` at the route boundary, and register routes in `apps/api/src/api/v1/index.ts`
- New shared types must be defined as Zod schemas in `packages/schemas/`, then generated with `npm run openapi:generate`

### Verification

```bash
npm run build:packages        # Packages compile
npm run build:api             # API compiles
npm run dev:api               # Server starts without errors
npm run openapi:generate      # OpenAPI spec regenerates cleanly (if contracts changed)
```

### Example: Adding a new CRUD endpoint

1. Add Zod schema in `packages/schemas/src/`
2. Export types from `packages/types/src/`
3. Create module service in `apps/api/src/api/v1/modules/<feature>/`
4. Create module repository if Prisma access needs select/DTO mapping or reusable filters
5. Create module controller in the same feature folder
6. Create route in `apps/api/src/api/v1/routes/`
7. Register route in `apps/api/src/api/v1/index.ts`
8. Run `npm run openapi:generate` to regenerate client SDK
9. Run `npm run build` to verify

---

## Frontend Agent

**Role**: Next.js frontend development — pages, components, hooks, forms, state management.

**Scope**: `apps/app/`, `packages/ui/`, `packages/types/`

### Rules

- Use Next.js App Router conventions: `page.tsx` for routes, `layout.tsx` for layouts, `loading.tsx` for suspense
- Route `page.tsx` files stay thin: export metadata when needed and render a colocated `view.tsx`; put interactive route UI in `'use client'` view files
- Reusable UI primitives go in `packages/ui/`, app-specific components in `apps/app/components/`
- Every data-fetching operation goes through a custom hook in `apps/app/hooks/` wrapping TanStack Query
- Entity hooks use generated options/mutations/query keys from `apps/app/api/@tanstack/react-query.gen` and invalidate the exact generated query keys after mutations
- Use `apps/app/api/sdk.gen.ts` only when a hook needs a custom query flow such as infinite queries or manual pagination
- Form logic goes in `apps/app/hooks/form/` — one hook per form, using React Hook Form + Zod resolver
- Form components use `forwardRef`/`useImperativeHandle` with `FormRef` when dialogs need external submit/reset control
- Dialog components own mutation orchestration, modal loading state, close/reset behavior, delete confirmations, and toast messages; form components stay focused on fields
- Client state (modals, drawers, selections) uses Zustand stores in `apps/app/store/`
- Modal IDs must come from `MODAL_IDS`; use `useModal<T>(id)` and `useDeleteModal<T>()` instead of local modal state for shared dialogs
- List views use `PageWrapper`, `Header`, `SkeletonItem`, explicit empty/no-results states, and `useMemo` for derived page content when the view has multiple states
- Filtering uses `useFilters<T>()` plus `FilterButton<T>` for structured filters; search transforms should live in the entity hook
- Table views use the shared `DataTable` wrapper around TanStack Table; manual pagination/sorting stays in hooks such as `useTransactionPagination`
- All user-facing strings go through next-intl — never hardcode text
- Configure the generated API client through `@/lib/api-client.ts`, but consume API operations through generated SDK/TanStack helpers; never call axios/fetch directly for backend API requests
- Do not edit auto-generated files in `apps/app/api/` (`client.gen.ts`, `sdk.gen.ts`, `types.gen.ts`)
- Import shared types from `@poveroh/types`, never from `@poveroh/contracts` directly
- Use `@poveroh/ui` primitives and lucide-react icons for app UI; keep domain-specific composition in `apps/app/components/`
- Where possible and needed, add comments before functions explaining the purpose

### Verification

```bash
npm run build:app             # Frontend compiles
npm run dev:app               # App starts, test in browser
npm run lint                  # No lint errors
```

### Example: Adding a new page with a form

1. Create page in `apps/app/app/(admin)/feature-name/page.tsx`
2. Create form component in `apps/app/components/form/`
3. Create form hook in `apps/app/hooks/form/` with Zod schema validation
4. Create data hook in `apps/app/hooks/use-feature.ts` wrapping TanStack Query
5. Add translations to i18n files
6. Test in browser: golden path + edge cases

---

## Full-Stack Agent

**Role**: End-to-end feature implementation spanning API and frontend.

**Scope**: All of `apps/`, `packages/`

### Rules

- Follow both Backend Agent and Frontend Agent rules
- Always start from the data layer and work up: schema → types → API → frontend
- Split work into reviewable chunks following PR Size Guidelines (< 500 lines, < 10 files)
- After API changes, always run `npm run openapi:generate` before starting frontend work
- Verify the full pipeline compiles: `npm run build`

### Workflow for a new feature

1. **Schema**: Add/modify Prisma schema in `packages/prisma/schema.prisma`
2. **Migration**: `npm run prisma:migrate`
3. **Validation**: Add Zod schemas in `packages/schemas/src/`
4. **Types**: Export types from `packages/types/src/`
5. **Module**: Implement service/repository/controller in `apps/api/src/api/v1/modules/<feature>/`
6. **Route**: Register endpoint in `apps/api/src/api/v1/routes/` and `apps/api/src/api/v1/index.ts`
7. **Codegen**: `npm run openapi:generate`
8. **Hook**: Create data hook in `apps/app/hooks/` using generated TanStack Query helpers
9. **Form**: Create form hook in `apps/app/hooks/form/` if input is needed
10. **UI**: Build page/view, dialog, form, and item/table components in `apps/app/`
11. **Verify**: `npm run build` + manual browser testing

### Verification

```bash
npm run build                 # Full monorepo compiles
npm run dev                   # API + App start together
# Test in browser at localhost:3000
```

---

## Database Agent

**Role**: Prisma schema changes, migrations, query optimization.

**Scope**: `packages/prisma/`, `packages/schemas/`, `apps/api/src/api/v1/modules/`

### Rules

- All schema changes go in `packages/prisma/schema.prisma`
- Always create a migration after schema changes: `npm run prisma:migrate`
- Never edit migration files after they've been applied
- Use `select` over full-record fetches for read queries
- Use `prisma.$transaction()` for multi-step operations that must be atomic
- Keep account balance, transfer, import, and media persistence updates atomic when they change multiple tables
- Add appropriate indexes for fields used in `where` clauses and foreign keys
- Every model must have a `userId` field (or equivalent) for user data isolation
- New models need corresponding Zod schemas in `packages/schemas/`

### Verification

```bash
npm run prisma:migrate        # Migration applies cleanly
npm run prisma:generate       # Client regenerates
npm run build:packages        # All dependent packages compile
npm run build:api             # API compiles with new types
npm run prisma:studio         # Verify schema visually
```

---

## Code Review Agent

**Role**: Review code changes for quality, security, and adherence to project conventions.

**Scope**: Entire repository

### Checklist

**Architecture**

- [ ] Business logic is in services, not controllers
- [ ] Feature code follows `modules/<feature>` colocation for controller/service/repository
- [ ] Repositories own Prisma select/DTO mapping for standard CRUD reads and writes
- [ ] Shared types use Zod schemas + OpenAPI codegen, not manual type files
- [ ] Reusable components are in `packages/ui/`, not `apps/app/`
- [ ] No barrel imports — direct path imports only

**Type Safety**

- [ ] No `as any` type casts
- [ ] `import type` used for type-only imports
- [ ] Prisma queries use `select` when full record is not needed
- [ ] Prisma DTO mapping handles `Decimal`, `Date`, and nullable database fields before returning API data
- [ ] Queue and domain event payloads use shared types from `@poveroh/types`

**Security**

- [ ] No secrets, API keys, or `.env` files committed
- [ ] No sensitive fields exposed in API responses (passwords, tokens, keys)
- [ ] Auth middleware applied to all protected routes
- [ ] User data isolated by `userId` in all queries
- [ ] Soft-deleted records are excluded from normal reads and list filters

**Error Handling**

- [ ] `HttpError` subclasses used (not generic `Error`)
- [ ] Controllers wrapped in `try/catch` with `ResponseHelper.handleError()`
- [ ] Descriptive error messages with context

**Code Quality**

- [ ] Comments explain WHY, not WHAT
- [ ] Service and helper functions have comments
- [ ] JSDoc comments include `@param` and `@returns` when the function has parameters or return values
- [ ] No commented-out code left behind
- [ ] No unused imports or variables
- [ ] Conventional commit message format

**PR Hygiene**

- [ ] Under 500 lines changed (excluding generated files)
- [ ] Under 10 code files changed
- [ ] Single responsibility — PR does one thing
- [ ] Build passes: `npm run build`
- [ ] Format passes: `npm run format`

---

## DevOps Agent

**Role**: Docker, infrastructure, CI/CD, deployment configuration.

**Scope**: `docker/`, `infra/`, `scripts/`, `.github/workflows/`, root config files

### Rules

- Development Docker Compose: `docker/docker-compose.local.yml`
- Production Docker Compose: `docker/docker-compose.prod.yml`
- All services run on the `poveroh_network` Docker network
- Dockerfiles live in their respective directories (`apps/api/api.dockerfile`, `apps/app/app.dockerfile`, `infra/*/`)
- Environment uses dual file system: `.env` (local dev) and `.env.production` (Docker)
- Local proxy routes subdomains: `app.poveroh.local`, `api.poveroh.local`, `cdn.poveroh.local`
- CI workflows live in `.github/workflows/`
- Never hardcode environment values — use `.env` variables
- Production images are published to `ghcr.io/poveroh/*`

### Verification

```bash
npm run docker-dev            # All local containers start
docker ps                     # All services running and healthy
# Test at http://app.poveroh.local
```

---

## Schema Agent

**Role**: OpenAPI contracts, Zod schemas, and type generation pipeline.

**Scope**: `packages/schemas/`, `packages/openapi/`, `packages/contracts/`, `packages/types/`

### Rules

- Zod schemas in `packages/schemas/` are the single source of truth for API contracts
- Register schemas with the OpenAPI registry from `@poveroh/openapi`
- Types in `packages/types/` export interfaces consumed by both API and frontend
- Generated files in `packages/contracts/dist/` and `apps/app/api/*.gen.ts` must never be edited manually
- After any schema change, always run: `npm run openapi:generate`
- The full pipeline is: Zod schema → OpenAPI spec → TypeScript client SDK → format → build packages

### Verification

```bash
npm run build:packages        # Schemas and types compile
npm run openapi:generate      # Full codegen pipeline runs cleanly
npm run build                 # Everything compiles end-to-end
```

### Example: Adding a new API type

1. Define Zod schema in `packages/schemas/src/`
2. Register with OpenAPI registry
3. Export TypeScript type from `packages/types/src/`
4. Run `npm run openapi:generate`
5. Verify generated client in `apps/app/api/` includes the new type
6. Run `npm run build`
