Poveroh is an open-source web platform for tracking personal finances. It is a TypeScript monorepo managed with Turborepo and npm workspaces.

PROJECT STRUCTURE

apps/api Express.js REST API (Node.js)
apps/app Next.js frontend (App Router)
apps/storybook Storybook component explorer

packages/types Shared TypeScript types and enums
packages/prisma Prisma client and database schema
packages/utils Shared utility functions
packages/ui Shared React UI components (shadcn/ui based)
packages/schemas Zod validation schemas
packages/contracts Auto-generated OpenAPI DTO types (do not edit manually)
packages/openapi OpenAPI spec generation tooling
packages/eslint-config Shared ESLint config
packages/tsconfig Shared TypeScript config

TECH STACK

Backend: Node.js >= 22, Express.js, Prisma ORM, PostgreSQL, Redis, better-auth
Frontend: Next.js 14 (App Router), TailwindCSS, TanStack Query, hey-api client, better-auth
Tooling: Turborepo, Prettier, Husky, Docker Compose

DEVELOPMENT WORKFLOW

Run npm install from the repo root to install all dependencies.

Before first run, execute npm run setup to start Docker containers for PostgreSQL, Redis, and the local proxy/CDN.

Start dev servers with npm run dev (starts api and app together). Use npm run dev:api or npm run dev:app to start individually.

The local proxy routes traffic using these hostnames (added to /etc/hosts by npm run setup:proxy):
app.poveroh.local -> frontend (port 3000)
api.poveroh.local -> backend (port 3001)
cdn.poveroh.local -> file storage
studio.poveroh.local -> Prisma Studio

Environment files: copy .env.example to .env for local dev. The root .env is the single source of truth — all tools load it explicitly (nodemon via --env-file, Next.js via dotenv-cli, Prisma CLI via --env-file, Docker Compose via --env-file flag). Do not create .env files in subdirectories. Use .env.production for Docker deployments.

The development branch is main. Branch naming: feature/NAME, fix/NAME, refactor/NAME.

OPENAPI AND API CONTRACTS

The API exposes an OpenAPI spec. Types and client hooks are auto-generated from it.

When you change API request/response shapes, run:
npm run openapi:generate

This updates packages/contracts (shared DTOs), and apps/app/api (typed client + TanStack Query hooks).

Never edit files inside packages/contracts or apps/app/api by hand. They are generated.

Swagger UI is available at http://localhost:3001/v1/api-docs when the API is running.

API PATTERNS (apps/api)

Routes are in apps/api/src/api/v1/routes/
Controllers are in apps/api/src/api/v1/controllers/
Services contain business logic in apps/api/src/api/v1/services/
Helpers are in apps/api/src/api/v1/helpers/

All routes require authentication by default via better-auth middleware. Auth is session-cookie based.

Responses go through the shared response utility in apps/api/src/utils/response.ts.

Prisma client is imported from packages/prisma. Use the shared PrismaClient instance.

File storage is abstracted via apps/api/src/utils/storage.ts and supports local, AWS S3, GCS, Azure, and DigitalOcean Spaces. The mode is set by FILE_STORAGE_MODE env var.

FRONTEND PATTERNS (apps/app)

The app uses Next.js App Router. Admin pages live under app/(admin)/.

Data fetching uses TanStack Query. Import generated hooks from apps/app/api/@tanstack/react-query.gen.

The hey-api client in apps/app/lib/api-client.ts is pre-configured with credentials: include so session cookies are sent automatically on every request. No extra auth setup needed.

For public (unauthenticated) API calls, pass withoutAuth() as the options argument.

Custom wrapper hooks live in apps/app/hooks/ and expose simplified interfaces over TanStack Query hooks.

After mutations, invalidate the relevant query keys to keep data fresh:
queryClient.invalidateQueries({ queryKey: ['getTransactions'] })

Query keys match the generated operation names (e.g. getTransactions, getFinancialAccounts).

UI components come from packages/ui. Add new shadcn components with npm run ui:add from the repo root.

Translations are in apps/app/i18n/locales/. Always add keys for both en and any other supported locales when adding new UI text.

PRISMA AND DATABASE

Schema is at packages/prisma/prisma/schema.prisma.

After editing the schema run:
npm run prisma:migrate (development, creates migration files)
npm run prisma:generate (regenerates Prisma client)
npm run prisma:deploy (applies migrations in production)

Open Prisma Studio with npm run prisma:studio.

BUILD

Build all packages first, then apps:
npm run build:packages
npm run build

Individual builds: npm run build:api, npm run build:app.

PACKAGES MUST BE BUILT BEFORE APPS. Always run npm run build:packages if you change anything in packages/.

CODE STYLE

Use Prettier for formatting: npm run format.
Run linting with npm run lint.
TypeScript strict mode is enabled. Avoid using any.
Keep business logic in services, not controllers or routes.
