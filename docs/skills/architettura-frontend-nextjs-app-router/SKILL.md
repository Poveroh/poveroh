---
name: architettura-frontend-nextjs-app-router
description: >
  Descrive l'architettura del frontend Next.js (App Router): il pattern di
  split page.tsx/view.tsx, gli alias TypeScript, e la protezione delle route
  lato client tramite RouteGuard (nessun middleware.ts). Usa questa skill
  quando devi creare una nuova pagina/route, capire dove va la logica di
  data-fetching vs la composizione UI, o proteggere una route.
---

# Architettura frontend: Next.js App Router

## Quando usarla / quando NON usarla
Usarla per: creare una nuova route sotto `apps/app/app/`, capire la separazione server/client component, o replicare `RouteGuard`.

Non usarla per: il fetching dati stesso (vedi `client-api-generato-e-tanstack-query`), lo stato client (`gestione-stato-client-zustand`), o i form (`gestione-form-react-hook-form-zod`).

## Come funziona
- Next.js `16.2.12`, React `19.2.0`/React DOM `19.2.0`. App Router confermato: `apps/app/app/layout.tsx`, route group `(admin)`/`(auth)`/`(settings)`, più `app/error.tsx`, `global-error.tsx`, `not-found.tsx`.
- `apps/app/next.config.js`: `output: 'standalone'`, `transpilePackages: ['@poveroh/ui']`, wrappato con `next-intl/plugin` e, condizionalmente, `withSentryConfig`.
- TypeScript: `apps/app/tsconfig.json` estende `@poveroh/tsconfig/nextjs.json`; alias di path: `"@/*": ["./*"]`, `"@poveroh/ui/*"`, `"@poveroh/utils/*"`, `"@poveroh/schemas/*"` (puntano ai package sibling nel workspace).
- **Pattern route/view**, esempio reale (`apps/app/app/(admin)/transactions/`):
  ```tsx
  // page.tsx — server component, nessun 'use client'
  import { Metadata } from 'next'
  import TransactionsView from './view'
  export const metadata: Metadata = { title: 'Transactions' }
  export default function TransactionsPage() { return <TransactionsView /> }
  ```
  `view.tsx` inizia con `'use client'` e contiene tutti gli hook/stato. Lo stesso schema si ripete per `accounts`, `categories`, `imports`, `investments`, `subscriptions`, `onboarding`, `sign-in`, `sign-up`.
- **Nessun `middleware.ts` Next.js**: la protezione delle route è interamente client-side tramite `RouteGuard` (`apps/app/components/other/route-guard.tsx`), che legge `useUserStore()` + `useOnBoardingStepOrder()` e reindirizza con `useRouter().push(redirectTo)` dentro un `useEffect`, mostrando `children` solo se le condizioni sono soddisfatte — usato sia per proteggere le pagine autenticate sia, al contrario, per le pagine di auth (impedendo l'accesso a chi è già loggato).
- **Build tooling**: nessun override custom di webpack/Turbopack oltre a `transpilePackages`/`output: 'standalone'` più i wrapper `next-intl`/Sentry.

## Input
Una route del filesystem sotto `apps/app/app/`.

## Output
Una coppia `page.tsx` (server, metadata) + `view.tsx` (client, logica) renderizzata dall'App Router; eventuale redirect gestito da `RouteGuard`.

## Dipendenze
Next.js `16.2.12`, React `19.2.0`, `@poveroh/tsconfig/nextjs.json`.

## Esempio d'uso
```tsx
// app/(admin)/nuova-pagina/page.tsx
export const metadata: Metadata = { title: 'Nuova pagina' }
export default function Page() { return <NuovaPaginaView /> }

// app/(admin)/nuova-pagina/view.tsx
'use client'
export default function NuovaPaginaView() {
    const { data } = useNuovaEntita() // hook TanStack Query
    return <div>{/* composizione UI */}</div>
}
```

## Limiti e note
- La protezione client-side via `RouteGuard` significa che il contenuto di una pagina protetta viene comunque inviato al browser prima del redirect (nessuna protezione a livello di edge/middleware): non adatta a contenuti che devono restare davvero riservati lato server.
- Non ci sono test end-to-end (nessun Playwright/Cypress) che verifichino il comportamento di `RouteGuard` o dei redirect.
