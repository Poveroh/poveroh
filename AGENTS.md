# Poveroh Development Guide for AI Agents

You are a senior Poveroh engineer working in an npm/Turbo monorepo. You prioritize type safety, clean architecture, and small, reviewable diffs.

## What is Poveroh

Poveroh is an open-source, self-hostable web platform for tracking personal finances. It aggregates multiple bank accounts into a single view and lets users:

- **Record transactions** — manually or by importing CSV/PDF bank statements
- **Categorize spending** — with customizable categories and subcategories
- **Track subscriptions** — monitor recurring payments across accounts
- **Snapshot net worth** — on the last day of each month, capture a snapshot of all account balances and asset values to build a historical wealth timeline
- **Track investments** — add financial products (ETFs, stocks, bonds, crypto, real estate, insurance, collectibles)
- **Generate reports** — analyze spending patterns, net worth evolution, and asset allocation over time
- **Dashboard** — customizable overview with charts and key financial metrics

The platform is designed for a single user (or household) who self-hosts the instance. All data stays on the user's own infrastructure.

## Do

- Use `import type { X }` for TypeScript type imports
- Use early returns to reduce nesting: `if (!data) throw new NotFoundError('...')`
- Use `HttpError` subclasses (`BadRequestError`, `NotFoundError`, etc.) for API errors in services and controllers
- Use `ResponseHelper` static methods (`success()`, `created()`, `handleError()`) for all API responses
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- Import shared types from `@poveroh/types`, schemas from `@poveroh/schemas`, Prisma client from `@poveroh/prisma`
- Use `@/` path alias for local imports within each app (e.g., `@/src/utils`, `@/api/client.gen`)
- Add translations to i18n files for all user-facing UI strings (next-intl)
- Use `select` in Prisma queries when you only need specific fields
- Run `npm run build` before committing — the pre-commit hook enforces this
- Run `npm run format` before committing — the pre-commit hook enforces this
- Instantiate services with userId: `new CategoryService(req.user.id)`
- Use Zod schemas from `@poveroh/schemas` for both API input validation and frontend form validation
- Use Zod schemas to add new types, then generate it using `npm run openapi:generate`
- Always add comments before function in API function like services function, helpers function
- Where possible and needed, add comments before function in frontend APP function

## Don't

- Never use `as any` — use proper type-safe solutions instead
- Never commit secrets, API keys, or `.env` files
- Never modify auto-generated files directly (`packages/contracts/dist/`, `apps/app/api/*.gen.ts`)
- Never put business logic in controllers — that belongs in services
- Never skip the build before pushing — the pre-commit hook runs `npm run build` and `npm run format`
- Never create UI components in `apps/app/` that should be reusable — put them in `packages/ui`
- Never import from `packages/contracts` directly in the frontend — use `@poveroh/types` instead
- Never add comments that simply restate what the code does
- Never create types that are shared between API and APP in specific file. Use Zod schemas and generate it `npm run openapi:generate`

## PR Size Guidelines

- **Lines changed**: Keep PRs under 500 lines of code (additions + deletions)
- **Files changed**: Keep PRs under 10 code files
- **Single responsibility**: Each PR should do one thing well

Lock files, auto-generated files, and documentation are excluded from the count.

### How to Split Large Changes

1. **By layer**: Separate database/schema changes, backend logic, and frontend UI
2. **By feature component**: API endpoint PR, then UI PR, then integration PR
3. **By refactor vs feature**: Preparatory refactoring in a separate PR before new functionality
4. **By dependency order**: Infrastructure first, then features that depend on it

## Commands

```bash
# Development
npm run dev              # Start API (3001) + App (3000) dev servers
npm run dev:api          # Start only API
npm run dev:app          # Start only frontend
npm run dev:storybook    # Start Storybook (6006)

# Build
npm run build            # Build all packages then all apps
npm run build:packages   # Build shared packages only (order: contracts → types → prisma → utils → schemas)
npm run build:api        # Build API only
npm run build:app        # Build frontend only

# Code quality
npm run lint             # Lint all workspaces via Turbo
npm run format           # Prettier format all files

# Setup (requires Docker running)
npm run setup            # Full setup: proxy, DB, Redis
npm run setup:db         # Docker DB + Prisma generate + migrate
npm run setup:redis      # Docker Redis
npm run setup:env        # Generate .env files from .env.example
npm run setup:data --user=<id>  # Seed database with fake data

# Prisma
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Create and apply dev migration
npm run prisma:deploy    # Apply migrations (production)
npm run prisma:studio    # Open Prisma Studio GUI

# OpenAPI codegen
npm run openapi:generate         # Full pipeline: API spec → client SDK → format → build packages
npm run openapi:generate-api     # Generate API server routes from spec
npm run openapi:generate-client  # Generate frontend API client SDK

# Docker
npm run docker-dev       # All services locally (db, api, app, redis, proxy)
npm run docker           # Production deployment

# Cleanup
npm run clean            # Remove node_modules + build artifacts
npm run clean:build      # Remove only build artifacts (.next, dist, .turbo)
npm run clean:data       # Clean seeded database data
```

## Build Order

Packages must build before apps. The required sequence:

1. `contracts` → 2. `types` → 3. `prisma` → 4. `utils` → 5. `schemas` → then apps (api, app, storybook)

`npm run build:packages` handles steps 1-5. `npm run build` runs everything including apps via Turbo.

## Pre-commit Hook

Husky runs `npm run build` and `npm run format` on every commit. If the build fails, the commit is blocked. Fix the build before retrying.

## Boundaries

### Always do

- Run `npm run build` before committing (the hook enforces this anyway)
- Run `npm run format` to fix code style
- Regenerate OpenAPI client after API contract changes: `npm run openapi:generate`
- Regenerate Prisma client after schema changes: `npm run prisma:migrate`
- Follow conventional commits for commit messages

### Ask first

- Adding new npm dependencies
- Schema changes to `packages/prisma/schema.prisma`
- Changes affecting multiple packages simultaneously
- Deleting files or removing features
- Docker/infrastructure changes

### Never do

- Commit secrets, API keys, or `.env` files
- Use `as any` type casting
- Force push or rebase shared branches
- Modify generated files (`packages/contracts/dist/`, `apps/app/api/*.gen.ts`)
- Skip hooks with `--no-verify`

## Project Structure

```
apps/
├── api/                         # Express.js REST API (port 3001)
│   └── src/
│       ├── index.ts             # Express setup, middleware, route mounting
│       ├── middleware/
│       │   ├── auth.middleware.ts    # Better-Auth session + JWT fallback → req.user
│       │   └── upload.middleware.ts  # Multer file uploads
│       ├── utils/
│       │   ├── errors.ts        # HttpError classes (BadRequest, NotFound, etc.)
│       │   ├── response.ts      # ResponseHelper (success, created, handleError, etc.)
│       │   ├── logger.ts        # Winston logger
│       │   ├── redis.ts         # Redis client
│       │   └── storage.ts       # File storage abstraction (local/AWS/GCS/Azure/DO)
│       ├── lib/
│       │   └── auth.ts          # Better-Auth instance
│       └── api/v1/
│           ├── controllers/     # Thin route handlers → delegate to services
│           ├── services/        # Business logic with userId context
│           │   └── base.service.ts  # Base class: new Service(userId, location)
│           ├── routes/          # Express route definitions
│           ├── helpers/         # Query filtering, import parsing
│           └── content/template/    # Default data templates
│
├── app/                         # Next.js 16 frontend (App Router, port 3000)
│   ├── app/
│   │   ├── (admin)/             # Authenticated routes
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── subscriptions/
│   │   │   └── (settings)/      # accounts, categories, imports, settings
│   │   ├── (auth)/              # sign-in, sign-up, onboarding, change-password
│   │   └── logout/
│   ├── components/              # App-specific components
│   │   ├── fields/              # Form field components (24 types)
│   │   ├── form/                # Form wrappers
│   │   ├── dashboard/           # Dashboard-specific
│   │   ├── dialog/, drawer/, modal/  # Overlays
│   │   ├── table/               # Data tables (@tanstack/react-table)
│   │   └── skeleton/            # Loading states
│   ├── hooks/                   # 30+ custom hooks
│   │   ├── form/                # Form-specific hooks (16+)
│   │   ├── dashboard/           # Dashboard hooks
│   │   └── use-*.ts             # Entity hooks (auth, transaction, category, etc.)
│   ├── store/                   # Zustand stores (account, auth, drawer, modal, etc.)
│   ├── providers/               # React context (auth, theme, zod-locale)
│   ├── lib/
│   │   ├── api-client.ts        # Axios-based API client wrapping auto-generated SDK
│   │   └── auth-token.ts        # JWT token management
│   └── config/                  # App config, navigation, sidebar
│
└── storybook/                   # Storybook 10 for @poveroh/ui components

packages/
├── contracts/                   # Auto-generated TypeScript types from OpenAPI spec — DO NOT EDIT
├── types/                       # Shared TypeScript types and interfaces
├── schemas/                     # Zod validation schemas (shared API + frontend)
├── prisma/                      # Prisma ORM, schema.prisma, migrations
├── ui/                          # Shared React component library (shadcn/ui + Radix UI)
├── utils/                       # Shared utility functions
├── openapi/                     # OpenAPI spec generation from Zod schemas
├── eslint-config/               # Shared ESLint configuration
└── tsconfig/                    # Shared TypeScript configurations

docker/                          # Docker Compose files (local + production)
infra/                           # Dockerfiles for db, redis, proxy (nginx)
scripts/                         # Setup, data seeding, deployment scripts
docs/                            # ENV_SETUP.md, CONTRIBUTING.md, API_AUTH.md
```

### Key files

- Database schema: `packages/prisma/schema.prisma`
- API routes: `apps/api/src/api/v1/routes/`
- API services: `apps/api/src/api/v1/services/`
- Error classes: `apps/api/src/utils/errors.ts`
- Response helpers: `apps/api/src/utils/response.ts`
- Frontend API client: `apps/app/lib/api-client.ts`
- Auto-generated SDK: `apps/app/api/client.gen.ts`, `apps/app/api/sdk.gen.ts`, `apps/app/api/types.gen.ts`
- Shared types: `packages/types/src/`
- Validation schemas: `packages/schemas/src/`
- Environment template: `.env.example`
- Docker (dev): `docker/docker-compose.local.yml`
- Docker (prod): `docker/docker-compose.prod.yml`

## Tech Stack

| Layer                | Technology                                                         |
| -------------------- | ------------------------------------------------------------------ |
| **Frontend**         | Next.js 16 (App Router), React 19, TypeScript                      |
| **Styling**          | Tailwind CSS, shadcn/ui (Radix UI), Recharts                       |
| **State**            | Zustand (client), TanStack React Query (server)                    |
| **Forms**            | React Hook Form + Zod validation                                   |
| **Backend**          | Express.js 4, TypeScript, Node.js >= 22                            |
| **Auth**             | Better-Auth (sessions) + JWT fallback                              |
| **Database**         | PostgreSQL via Prisma ORM 7                                        |
| **Cache**            | Redis 5                                                            |
| **File storage**     | Beycloud SDK (local, AWS S3, GCS, Azure Blob, DigitalOcean Spaces) |
| **API contracts**    | OpenAPI spec → auto-generated client SDK (Hey API)                 |
| **i18n**             | next-intl                                                          |
| **Monorepo**         | Turbo 2.7, npm workspaces                                          |
| **Containerization** | Docker, Docker Compose, NGINX proxy                                |
| **Component docs**   | Storybook 10 + Chromatic                                           |
| **Code quality**     | ESLint, Prettier, Husky pre-commit hooks                           |
| **Drag & drop**      | @dnd-kit                                                           |
| **Tables**           | @tanstack/react-table                                              |

## Naming Conventions

- Variables/functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Classes: PascalCase (suffix component props with Props, e.g. ButtonProps)
- Files/directories: kebab-case with descriptive suffixes, hook included (.component.tsx, .- service.ts, .entity.ts, .dto.ts, .module.ts). Example `use-category.ts`
- TypeScript generics: descriptive names
- When creating a new Zod schema, use the prefixes **Create**, **Get**, **Update**, or **Delete** when appropriate.

## Comments

- Use short-form comments (//), not JSDoc blocks
- Explain WHY (business logic), not WHAT
- Do not comment obvious code
- Multi-line comments use multiple // lines, not /\*\* \*/

## Code Examples

### Good API controller pattern

```typescript
// Controller: thin, delegates to service, uses typed errors
static async readCategoryById(req: Request, res: Response) {
    try {
        const id = getParamString(req.params, 'id')
        if (!id) throw new BadRequestError('Missing category ID in path')

        const categoryService = new CategoryService(req.user.id)
        const data = await categoryService.getCategoryById(id)

        if (!data) throw new NotFoundError('Category not found')

        return ResponseHelper.success<CategoryData>(res, data)
    } catch (error) {
        return ResponseHelper.handleError(res, error)
    }
}
```

### Good service pattern

```typescript
// Service: extends BaseService, owns business logic, uses Prisma directly
export class CategoryService extends BaseService {
    constructor(userId: string) {
        super(userId, 'category') // location used for file uploads
    }

    async getCategories(filters: CategoryFilters, skip: number, take: number): Promise<CategoryData[]> {
        const userId = this.getUserId()
        return await prisma.category.findMany({
            where: { userId, ...buildWhere(filters) },
            skip,
            take
        })
    }
}
```

### Good error handling

```typescript
// Good — Descriptive error with typed HttpError subclass
throw new BadRequestError('Data not provided')
throw new NotFoundError('Category not found')

// Bad — Generic error with no type
throw new Error('Something went wrong')
```

### Good Prisma query

```typescript
// Good — Use select for performance when you only need specific fields
const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
        id: true,
        name: true,
        email: true
    }
})

// Bad — Fetches all fields including potentially sensitive ones
const user = await prisma.user.findUnique({
    where: { id: userId }
})
```

### Good imports

```typescript
// Good — Type imports and package imports
import type { CategoryData } from '@poveroh/types'
import prisma from '@poveroh/prisma'
import { BadRequestError, NotFoundError, ResponseHelper } from '@/src/utils'

// Bad — Non-type import for types, deep package paths
import { CategoryData } from '@poveroh/types'
import { PrismaClient } from '@prisma/client'
```

### Good frontend hook usage

```typescript
// Good — Custom hook wrapping TanStack Query
const { data: categories, isLoading } = useCategory()

// Good — Form with Zod schema from @poveroh/schemas
const form = useForm<CreateCategoryRequest>({
    resolver: zodResolver(createCategorySchema)
})
```

## Environment

- Node.js >= 22 required
- `.env` for local dev (DATABASE_HOST=localhost:5432)
- `.env.production` for Docker deployments (DATABASE_HOST=db.poveroh.local:5432)
- Copy `.env.example` to `.env` or run `npm run setup:env`
- Local proxy maps subdomains: `app.poveroh.local`, `api.poveroh.local`, `cdn.poveroh.local`, `studio.poveroh.local`
- File storage mode configured via `FILE_STORAGE_MODE` env variable (local, aws, gcloud, azure, digitalocean)

## Workflows: What to Do After Common Changes

### After changing the Prisma schema

1. `npm run prisma:migrate` — creates migration + regenerates client
2. `npm run build:packages` — rebuild dependent packages
3. Update Zod schemas in `packages/schemas/` if models changed
4. `npm run openapi:generate` — regenerate API spec and client SDK

### After changing API endpoints or request/response shapes

1. `npm run openapi:generate` — regenerates frontend client SDK
2. Update types in `packages/types/` if needed
3. Update Zod schemas in `packages/schemas/` if validation changed

### After adding a new UI component

1. Add reusable components to `packages/ui/` via `npm run ui:add`
2. App-specific components go in `apps/app/components/`
3. Document reusable components in `apps/storybook/`

### After adding a new dependency

1. Add to the correct workspace (`apps/api`, `apps/app`, or specific `packages/*`)
2. Run `npm install` from root
3. Run `npm run build` to verify nothing breaks

## When Stuck

- Ask a clarifying question before making large speculative changes
- Propose a short plan for complex tasks
- Fix build errors before test failures — they're often the root cause
- Run `npm run prisma:generate` if you see missing type/enum errors
- Run `npm run openapi:generate` if frontend types don't match the API
- Run `npm run clean:build && npm run build` for stale cache issues
- Check `docs/` for detailed documentation (ENV_SETUP.md, API_AUTH.md, CONTRIBUTING.md)
