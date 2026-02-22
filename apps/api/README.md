# Tipi OpenAPI per il Server

## 📋 Panoramica

I tipi TypeScript sono automaticamente generati dalla specifica OpenAPI (`openapi.json`) usando `openapi-typescript`. Questo garantisce che i controller Express abbiano type-safety completo.

## 🚀 Generazione Tipi

### Comandi Disponibili

```bash
# Dal root del progetto - genera sia client che server
npm run openapi:generate

# Solo tipi server
npm run openapi:generate-server

# Solo client frontend
npm run openapi:generate-client

# Da apps/api
cd apps/api && npm run openapi:generate-types
```

### Output

I tipi vengono generati in:

```
apps/api/src/generated/openapi.ts
```

⚠️ **File auto-generato** - Non modificare manualmente! Viene rigenerato ad ogni esecuzione dello script.

## 📖 Come Usare i Tipi

### 1. Importare i Tipi

```typescript
import { components, paths } from '../../../generated/openapi'
// oppure path relativo dalla tua posizione
```

### 2. Tipi dagli Schemi (components)

```typescript
// Schemi base
type User = components['schemas']['User']
type Transaction = components['schemas']['Transaction']
type FinancialAccount = components['schemas']['FinancialAccount']

// Enums
type TransactionAction = components['schemas']['TransactionAction']
// 'INCOME' | 'EXPENSES' | 'TRANSFER'

type TransactionStatus = components['schemas']['TransactionStatus']
// 'APPROVED' | 'REJECTED' | 'IMPORT_PENDING' | ...

// Filtri
type TransactionFilters = components['schemas']['TransactionFilters']
type FilterOptions = components['schemas']['FilterOptions']

// Collections (responses con paginazione)
type TransactionCollection = components['schemas']['TransactionCollection']
```

### 3. Tipi dalle Operazioni API (paths)

```typescript
// Request body
type CreateTransactionBody = paths['/transaction']['post']['requestBody']['content']['application/json']

// Response
type CreateTransactionResponse = paths['/transaction']['post']['responses']['200']['content']['application/json']

// Query parameters
type GetTransactionsQuery = paths['/transaction']['get']['parameters']['query']

// Path parameters
type TransactionIdParam = paths['/transaction/{id}']['put']['parameters']['path']
```

### 4. Controller Type-Safe

```typescript
import { Request, Response } from 'express'
import { components, paths } from '@/generated/openapi'

type CreateTransactionRequest = paths['/transaction']['post']['requestBody']['content']['application/json']
type CreateTransactionResponse = paths['/transaction']['post']['responses']['200']['content']['application/json']
type ErrorResponse = components['schemas']['ErrorResponse']

export class TransactionController {
    static async create(
        req: Request<{}, CreateTransactionResponse, CreateTransactionRequest>,
        res: Response<CreateTransactionResponse | ErrorResponse>
    ) {
        try {
            const txData = req.body

            // TypeScript conosce esattamente i campi!
            // txData.title: string
            // txData.action: 'INCOME' | 'EXPENSES' | 'TRANSFER'
            // txData.date: string (ISO date)
            // txData.amounts: Amount[]

            const transaction = await prisma.transaction.create({
                data: {
                    ...txData,
                    userId: req.user.id
                }
            })

            res.status(200).json(transaction)
        } catch (error) {
            res.status(500).json({
                message: 'An error occurred',
                error
            })
        }
    }
}
```

### 5. Middleware Type-Safe

```typescript
import { Request, Response, NextFunction } from 'express'
import { components } from '@/generated/openapi'

type ErrorResponse = components['schemas']['ErrorResponse']

export function validateTransactionAction(req: Request, res: Response<ErrorResponse>, next: NextFunction) {
    const { action } = req.body

    const validActions: components['schemas']['TransactionAction'][] = ['INCOME', 'EXPENSES', 'TRANSFER']

    if (!validActions.includes(action)) {
        return res.status(400).json({
            message: `Invalid action. Must be one of: ${validActions.join(', ')}`
        })
    }

    next()
}
```

## 🎯 Esempi Pratici

Vedi [account-typed.example.ts](./src/api/v1/controllers/account-typed.example.ts) per esempi completi di:

- ✅ Controller con tipi completi (request/response)
- ✅ Gestione query parameters tipizzati
- ✅ Validazione enum con type guards
- ✅ Helper functions type-safe
- ✅ Middleware con type safety

## 🔄 Workflow

1. **Modifica `openapi.json`** con nuovi endpoint o schemi
2. **Rigenera i tipi**: `npm run openapi:generate-server`
3. **Usa i tipi** nei controller
4. TypeScript ti avvisa se qualcosa non corrisponde alla spec!

## 🆚 Differenza Client vs Server

| Aspetto | Client (apps/app)       | Server (apps/api)          |
| ------- | ----------------------- | -------------------------- |
| Tool    | `@hey-api/openapi-ts`   | `openapi-typescript`       |
| Output  | Client completo + types | Solo types                 |
| Uso     | Chiamate API fetch      | Type safety controller     |
| File    | `generated/api/`        | `src/generated/openapi.ts` |

## 💡 Best Practices

1. **Rigenera sempre i tipi** dopo aver modificato `openapi.json`
2. **Non modificare** `src/generated/openapi.ts` manualmente
3. **Usa i tipi** nei controller invece di `any` o `unknown`
4. **Valida enum** usando type guards
5. **Typecast** le response Prisma al tipo OpenAPI quando necessario

## 🚨 Troubleshooting

### I tipi non si trovano

```bash
# Rigenera i tipi
npm run openapi:generate-server

# Riavvia TypeScript server in VS Code
Cmd+Shift+P → "Restart TypeScript Server"
```

### Errori di tipo dopo la generazione

Verifica che:

- `openapi.json` sia valido JSON
- I tipi nel database Prisma corrispondano alla spec OpenAPI
- Hai eseguito il typecast dove necessario: `as CreateTransactionResponse`

### Build fallisce

Assicurati che `src/generated/` non sia in `.gitignore` se fai build in CI/CD, oppure aggiungi `npm run openapi:generate-server` come step di pre-build.

---

**Documentazione completa**: [docs/OPENAPI.md](../../../docs/OPENAPI.md)
