# Guida alla Migrazione dei Servizi Esistenti

## Obiettivo

Convertire i servizi esistenti basati su `BaseService` per utilizzare il client OpenAPI type-safe.

## Struttura Attuale vs Nuova

### ❌ Vecchio Approccio (BaseService)

```typescript
// transaction.service.ts
import { ITransaction } from '@poveroh/types'
import { BaseService } from './base.service'

export class TransactionService extends BaseService<ITransaction> {
    constructor() {
        super('/transaction')
    }
}

// Uso
const service = new TransactionService()
const result = await service.read({
    /* filters */
})
```

### ✅ Nuovo Approccio (OpenAPI Client)

```typescript
// transaction.service.ts
import { getTransaction, postTransaction, putTransactionById, deleteTransactionById } from '@/lib/api-client'

export const TransactionService = {
    async getAll(filters?: { skip?: number; take?: number }) {
        const response = await getTransaction({ query: filters })
        return response.data
    },

    async create(data: PostTransactionData['body']) {
        const response = await postTransaction({ body: data })
        return response.data
    },

    async update(id: string, data: PutTransactionByIdData['body']) {
        const response = await putTransactionById({
            path: { id },
            body: data
        })
        return response.data
    },

    async delete(id: string) {
        const response = await deleteTransactionById({ path: { id } })
        return response.data
    }
}
```

## Piano di Migrazione

### Opzione 1: Migrazione Graduale (Consigliata)

Mantieni entrambi gli approcci durante la transizione:

1. **Crea nuovi servizi** con suffisso `.v2.ts`:

    ```
    transaction.service.ts       (vecchio)
    transaction.service.v2.ts    (nuovo)
    ```

2. **Migra componente per componente**:
    - Testa il nuovo servizio in un componente
    - Se funziona, migra altri componenti
    - Quando tutti i componenti usano la v2, elimina il vecchio

3. **Rimuovi i vecchi servizi** quando non sono più usati

### Opzione 2: Migrazione Completa Immediata

Sostituisci tutti i servizi in una volta:

1. **Backup** dei servizi attuali
2. **Converti tutti i servizi** al nuovo approccio
3. **Testa approfonditamente** tutte le funzionalità
4. **Fix degli errori** segnalati da TypeScript

## Esempi di Conversione

### 1. CategoryService

#### Prima

```typescript
// category.service.ts
import { ICategory } from '@poveroh/types'
import { BaseService } from './base.service'

export class CategoryService extends BaseService<ICategory> {
    constructor() {
        super('/category')
    }
}
```

#### Dopo

```typescript
// category.service.ts
import {
    getCategory,
    postCategory,
    putCategoryById,
    deleteCategoryById,
    type PostCategoryData,
    type PutCategoryByIdData
} from '@/lib/api-client'

export const CategoryService = {
    async getAll(filters?: { skip?: number; take?: number }) {
        const response = await getCategory({ query: filters })
        return response.data
    },

    async create(data: PostCategoryData['body']) {
        const response = await postCategory({ body: data })
        return response.data
    },

    async update(id: string, data: PutCategoryByIdData['body']) {
        const response = await putCategoryById({
            path: { id },
            body: data
        })
        return response.data
    },

    async delete(id: string) {
        const response = await deleteCategoryById({ path: { id } })
        return response.data
    }
}
```

### 2. UserService

#### Prima

```typescript
// user.service.ts
import { IUser } from '@poveroh/types'
import { BaseService } from './base.service'

export class UserService extends BaseService<IUser> {
    constructor() {
        super('/user')
    }
}
```

#### Dopo

```typescript
// user.service.ts
import { getUser, putUserById, type PutUserByIdData } from '@/lib/api-client'

export const UserService = {
    async getByEmail(email: string) {
        const response = await getUser({
            query: { email }
        })
        return response.data
    },

    async update(id: string, data: PutUserByIdData['body']) {
        const response = await putUserById({
            path: { id },
            body: data
        })
        return response.data
    }
}
```

## Aggiornamento dei Componenti

### Hook con SWR

#### Prima

```typescript
// use-transactions.ts
import useSWR from 'swr'
import { TransactionService } from '@/services/transaction.service'

const service = new TransactionService()

export function useTransactions(filters?: any) {
    const { data, error, mutate } = useSWR(['/transaction', filters], () => service.read(filters))

    return {
        transactions: data?.data,
        total: data?.total,
        isLoading: !error && !data,
        error,
        mutate
    }
}
```

#### Dopo

```typescript
// use-transactions.ts
import useSWR from 'swr'
import { getTransaction } from '@/lib/api-client'

export function useTransactions(filters?: { skip?: number; take?: number }) {
    const { data, error, mutate } = useSWR(['/transaction', filters], () => getTransaction({ query: filters }))

    return {
        transactions: data?.data?.data,
        total: data?.data?.total,
        isLoading: !error && !data,
        error,
        mutate
    }
}
```

### Server Actions (Next.js)

#### Prima

```typescript
'use server'
import { TransactionService } from '@/services/transaction.service'

export async function createTransaction(formData: FormData) {
    const service = new TransactionService()
    const result = await service.add({
        title: formData.get('title')
        // ...
    })
    return result
}
```

#### Dopo

```typescript
'use server'
import { postTransaction } from '@/lib/api-client'

export async function createTransaction(formData: FormData) {
    const result = await postTransaction({
        body: {
            title: formData.get('title') as string
            // TypeScript ti aiuta con i tipi corretti!
        }
    })
    return result.data
}
```

## Vantaggi della Migrazione

### 1. Type Safety Migliorata

```typescript
// ❌ Prima - any type, nessuna validazione
const data = await service.add({ whatever: 'value' })

// ✅ Dopo - type checking completo
const data = await postTransaction({
    body: {
        title: 'test', // ✅ richiesto
        action: 'EXPENSES', // ✅ enum validato
        date: '2024-01-01' // ✅ formato validato
        // TypeScript segnala campi mancanti o errati!
    }
})
```

### 2. Auto-Complete Intelligente

Il nuovo client fornisce auto-complete per:

- Nomi dei parametri
- Valori degli enum
- Strutture nested
- Campi opzionali vs obbligatori

### 3. Documentazione Inline

Ogni funzione generata include la documentazione da OpenAPI:

```typescript
/**
 * Create transaction
 * @summary Create transaction
 */
export const postTransaction = (options: Options<PostTransactionData>) => { ... }
```

## Checklist Migrazione

- [ ] Installa dipendenze OpenAPI
- [ ] Genera client iniziale
- [ ] Crea servizi v2 per ogni modulo
- [ ] Testa servizi v2 in isolamento
- [ ] Migra componenti uno per uno
- [ ] Aggiorna hook e server actions
- [ ] Testa end-to-end
- [ ] Rimuovi servizi vecchi
- [ ] Rimuovi BaseService se non più usato
- [ ] Aggiorna la documentazione

## Testing

Dopo la migrazione, testa:

```typescript
// Test manuale in console del browser o server action
import { getTransaction, postTransaction } from '@/lib/api-client'

// Test GET
const result = await getTransaction({ query: { skip: 0, take: 10 } })
console.log(result.data)

// Test POST
const newTx = await postTransaction({
    body: {
        title: 'Test',
        action: 'EXPENSES',
        date: new Date().toISOString(),
        amounts: [...]
    }
})
console.log(newTx.data)
```

## Risoluzione Problemi Comuni

### Errore: "Property 'data' does not exist"

Il client OpenAPI restituisce `{ data, error, response }`. Accedi sempre a `.data`:

```typescript
const result = await getTransaction({ query: filters })
const transactions = result.data?.data // Nota il doppio .data
```

### Errore: Type incompatibility

Alcuni tipi potrebbero essere leggermente diversi. Controlla l'OpenAPI spec e aggiorna i tuoi tipi locali.

### Errore: "Cannot find module '@/lib/api-client'"

Assicurati di aver rigenerato il client: `npm run openapi:generate`

---

**Nota**: La migrazione al client OpenAPI è un investimento che ripaga con maggiore affidabilità e produttività dello sviluppo!
