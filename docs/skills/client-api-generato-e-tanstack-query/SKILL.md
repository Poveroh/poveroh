---
name: client-api-generato-e-tanstack-query
description: >
  Descrive come il client API generato (hey-api + axios) viene consumato
  lato frontend tramite hook TanStack Query: pattern useQuery/useMutation,
  invalidazione cache, e convenzioni sulle query key. Usa questa skill
  quando devi scrivere un nuovo hook di lettura/scrittura in
  apps/app/hooks/, o capire come invalidare la cache dopo una mutation.
---

# Client API generato e TanStack Query

## Quando usarla / quando NON usarla
Usarla per: scrivere un hook `use-*.ts` che avvolge il client generato, gestire l'invalidazione della cache dopo una mutation, capire autenticazione cookie/bearer sulle chiamate.

Non usarla per: la generazione del client stessa (vedi `pipeline-contratti-api-openapi-codegen`, il passo precedente) o lo state client non derivato dal server (vedi `gestione-stato-client-zustand`).

## Come funziona
- **Config generazione**: `apps/app/openapi-ts.config.ts` (dettagli nella skill `pipeline-contratti-api-openapi-codegen`). Output sotto `apps/app/api/`: `client.gen.ts`, `client/client.gen.ts`, `sdk.gen.ts`, `types.gen.ts`, `schemas.gen.ts`, `@tanstack/react-query.gen.ts`, `core/*.gen.ts`.
- **Client axios**: configurato una sola volta in `apps/app/lib/api-client.ts` (query serializer custom, interceptor per il bearer token via `authToken`, uno shim custom che fa da ponte tra axios e la Fetch API), importato per side-effect in `apps/app/providers/server-provider.tsx` (`import '@/lib/api-client'`). Per le chiamate pubbliche (senza cookie di sessione), il client esporta un helper `withoutAuth()` — vedi `docs/API_AUTH.md` per esempi completi di chiamate autenticate/pubbliche/dirette (senza hook).
- **`QueryClientProvider`**: montato in `apps/app/providers/server-provider.tsx` (`'use client'`, `new QueryClient()` per provider, nessun `defaultOptions` custom — si usano i default di TanStack Query), a sua volta montato in `apps/app/app/providers.tsx` (server component `async` che pre-carica i messaggi next-intl con `getMessages()` prima del render).
- **Pattern di lettura**, esempio reale (`apps/app/hooks/use-account-balance.ts`):
  ```ts
  import { getFinancialAccountBalanceSeriesOptions } from '@/api/@tanstack/react-query.gen'
  export const useAccountBalanceHistory = (accountId: string, from?: string, to?: string) =>
      useQuery({
          ...getFinancialAccountBalanceSeriesOptions({ path: { id: accountId }, query: { from, to } }),
          enabled: Boolean(accountId),
          select: response => (response?.data ?? []) as FinancialAccountBalanceData[]
      })
  ```
- **Pattern di scrittura**, stesso file:
  ```ts
  const createMutation = useMutation({
      ...createFinancialAccountBalanceMutation(),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [{ _id: balanceSeriesQueryId }] })
          queryClient.invalidateQueries({ queryKey: getFinancialAccountsQueryKey() })
      },
      onError: error => handleError(error, 'Error saving balance')
  })
  ```
- **Query key**: hey-api genera funzioni `getXQueryKey(...)` che ritornano array `[{ _id, ...params }]`; l'invalidazione avviene sia richiamando quella funzione sia ricostruendo l'`_id` interno (`[{ _id: balanceSeriesQueryId }]`). Override locali esistono (es. `staleTime: 0` in `use-transaction.ts` per `fetchTransactions`).

## Input
Le funzioni `getXOptions`/`xMutation` generate da hey-api, importate da `@/api/@tanstack/react-query.gen`.

## Output
Un hook (`use-x.ts`) che espone `data`/`isLoading`/`error` (letture) o `mutate`/`isPending` (scritture), con la cache TanStack Query correttamente invalidata dopo ogni mutation.

## Dipendenze
`@tanstack/react-query ^5.94.4`, `axios ^1.15.2`, il client generato in `apps/app/api/`.

## Esempio d'uso
```ts
// lettura
const { data, isLoading } = useAccountBalanceHistory(accountId)

// scrittura con invalidazione
createMutation.mutate({ path: { id: accountId }, body: { amount } })
```

## Limiti e note
- **Non modificare mai** i file `apps/app/api/*.gen.ts`: sono rigenerati da `npm run openapi:generate` (frontend) e ogni modifica manuale va persa.
- Non chiamare mai axios/fetch direttamente nei componenti: usare sempre le funzioni generate, anche per le chiamate "dirette senza hook" (vedi `docs/API_AUTH.md`).
- Esiste anche `docs/TANSTACK_QUERY_USAGE.md` nel repository con esempi aggiuntivi (incluse optimistic update); alcuni esempi in quel documento usano però query key come array di stringhe (es. `['getUser']`) mentre il codice reale ispezionato usa il formato oggetto generato da hey-api (`[{ _id, ...params }]`) — **le due convenzioni non coincidono esattamente**: da verificare/allineare se si scrive nuovo codice, preferendo il formato effettivamente generato (`getXQueryKey()`).
