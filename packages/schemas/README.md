# @poveroh/schemas

Shared Zod schemas used across the monorepo.

This package currently re-exports schemas from `packages/openapi/schemas` as a temporary bridge.
Recommended next steps:

- Move schema files into this package's `src/` folder and export them from `src/index.ts`.
- Update `packages/openapi` to import from `@poveroh/schemas` for generation.
- Run `npm install` in root to pick up the new package and then `npm run build:packages`.
