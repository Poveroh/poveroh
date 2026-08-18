---
name: gestione-stato-client-zustand
description: >
  Descrive i pattern di stato client con Zustand: store semplici in-memory,
  store persistiti con il middleware persist, e la convenzione tra stato
  globale condiviso e stato locale di pagina. Usa questa skill quando devi
  aggiungere un nuovo store Zustand, decidere se persistere lo stato, o
  capire se uno store esistente va riusato o clonato in variante locale.
---

# Gestione dello stato client con Zustand

## Quando usarla / quando NON usarla
Usarla per: creare/estendere uno store Zustand, decidere persist vs non-persist, o separare stato condiviso da stato locale di una pagina.

Non usarla per: lo stato server-derivato (cache di query/mutation, vedi `client-api-generato-e-tanstack-query`) o lo stato di un singolo form (vedi `gestione-form-react-hook-form-zod`).

## Come funziona
- **Store semplice**, esempio (`apps/app/store/account.store.ts`): `create<FinancialAccountStore>((set, get) => ({...}))`, espone azioni CRUD-style su un array di cache in-memory, consumato con `useFinancialAccountStore()`.
- **Store persistito**, esempio (`apps/app/store/chart-range.store.ts`):
  ```ts
  export const useChartRangeStore = create<ChartRangeStore>()(
      persist(set => ({ range: '30D', setRange: range => set(() => ({ range })) }), { name: 'chart-range' })
  )
  ```
- **Store auth/utente** (`apps/app/store/auth.store.ts`): esporta `useUserStore` — non usa il middleware `persist` di Zustand, ma scrive manualmente su `storage` (un wrapper su `localStorage`) dentro `setUser`. Consumato direttamente in `hooks/use-auth.ts` e in `components/other/route-guard.tsx`.
- **Convenzione condiviso vs locale** (confermata dal codice): uno store persistito come `chartRange` è condiviso in tutta l'app — non va riusato per stato che deve restare locale a una singola pagina (altrimenti si mutano dati ovunque). Per questo caso si crea una variante locale (es. `useLocalChartRange`) tenendo gli helper puri (calcoli su date, opzioni) in un modulo `lib/` condiviso da entrambe le varianti.

## Input
Azioni invocate dai componenti (es. `setRange('90D')`, `addAccount(account)`).

## Output
Stato client sincrono, letto reattivamente da qualunque componente che chiama l'hook dello store; per gli store persistiti, anche una copia in `localStorage`.

## Dipendenze
`zustand ^5.0.3` (con il middleware `persist` per gli store persistiti).

## Esempio d'uso
```ts
// store semplice
export const useMyStore = create<MyStore>(set => ({
    items: [],
    addItem: item => set(state => ({ items: [...state.items, item] }))
}))

// consumo
const items = useMyStore(state => state.items)
```

## Limiti e note
- `useUserStore` non usa il middleware `persist` standard ma una scrittura manuale su storage: un pattern diverso dal resto degli store persistiti, da tenere a mente per non confondersi cercando `persist(...)` nel file.
- Non c'è un limite/convenzione codificata a livello di tipo tra "store condiviso" e "store locale": la distinzione è solo di naming/documentazione (`use-local-chart-range` vs `use-chart-range`), non imposta dal compilatore.
