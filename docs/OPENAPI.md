# Implementazione OpenAPI - Guida Completa

## 📋 Panoramica

Questo progetto ora utilizza **OpenAPI 3.0** per garantire type-safety completo tra client e server. L'approccio utilizzato è **Contract-Last** (Code-First), dove la specifica OpenAPI viene mantenuta manualmente e il client TypeScript viene generato automaticamente.

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                        OPENAPI SPEC                         │
│                  apps/api/openapi.json                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
  ┌──────────┐      ┌────────────┐
  │  SERVER  │      │   CLIENT   │
  │ Swagger  │      │ TypeScript │
  │    UI    │      │  Generated │
  └──────────┘      └────────────┘
```

## 🚀 Setup Completato

### 1. **Server Express** (apps/api)

- ✅ Swagger UI configurato su `/v1/api-docs`
- ✅ Spec OpenAPI JSON disponibile su `/v1/openapi.json`
- ✅ Dipendenze installate: `swagger-ui-express`

### 2. **Client Next.js** (apps/app)

- ✅ Generatore client installato: `@hey-api/openapi-ts`
- ✅ Client TypeScript type-safe generato in `generated/api/`
- ✅ Configurazione client in `lib/api-client.ts`
- ✅ Esempio di utilizzo in `services/transaction-example.service.ts`

## 📚 Come Usare

### Documentazione API Interattiva

Avvia il server e visita:

```
http://localhost:3001/v1/api-docs
```

Qui puoi:

- Vedere tutti gli endpoint disponibili
- Testare le chiamate API direttamente dal browser
- Vedere schemi di richieste/risposte

### Usare il Client Generato

Il client generato fornisce **type-safety completo** per tutte le chiamate API:

```typescript
import {
  getTransaction,
  postTransaction,
  type GetTransactionResponses
} from '@/lib/api-client'

// GET - Type-safe query parameters
const response = await getTransaction({
  query: {
    skip: 0,
    take: 10,
    sortBy: 'date',
    sortOrder: 'desc'
  }
})

// POST - Type-safe body
const newTransaction = await postTransaction({
  body: {
    title: 'Spesa supermercato',
    action: 'EXPENSES',
    date: new Date().toISOString(),
    amounts: [...]
  }
})

// TypeScript conosce esattamente la struttura della risposta!
console.log(response.data?.data) // Transaction[]
console.log(response.data?.total) // number
```

### Rigenerare il Client

Ogni volta che modifichi `openapi.json`, rigenera il client:

```bash
# Dal root del progetto
npm run openapi:generate

# Oppure da apps/app
cd apps/app && npm run openapi:generate
```

⚠️ **IMPORTANTE**: Il client viene rigenerato automaticamente solo quando esegui il comando. Ricorda di farlo dopo ogni modifica alla spec OpenAPI!

## 🔄 Workflow di Sviluppo

### Scenario 1: Nuovo Endpoint API

1. **Implementa l'endpoint sul server** (apps/api)
2. **Aggiorna `openapi.json`** con il nuovo endpoint
3. **Rigenera il client**: `npm run openapi:generate`
4. **Usa il nuovo endpoint type-safe nel frontend**

### Scenario 2: Modifica Endpoint Esistente

1. **Modifica l'endpoint sul server**
2. **Aggiorna la spec in `openapi.json`**
3. **Rigenera il client**: `npm run openapi:generate`
4. TypeScript ti segnalerà automaticamente le breaking changes nel frontend!

## 📁 File Importanti

| File                                               | Descrizione                      |
| -------------------------------------------------- | -------------------------------- |
| `apps/api/openapi.json`                            | Specifica OpenAPI (manuale)      |
| `apps/api/src/api/v1/index.ts`                     | Configurazione Swagger UI        |
| `apps/app/openapi-ts.config.ts`                    | Configurazione generatore client |
| `apps/app/lib/api-client.ts`                       | Client configurato per l'uso     |
| `apps/app/generated/api/`                          | Client generato (in .gitignore)  |
| `apps/app/services/transaction-example.service.ts` | Esempi di utilizzo               |

## 🎯 Vantaggi

✅ **Type Safety End-to-End**: Errori catturati a compile-time, non a runtime  
✅ **Auto-Complete**: IntelliSense completo in VS Code  
✅ **Documentazione Automatica**: Swagger UI sempre aggiornato  
✅ **Meno Errori**: Validazione automatica dei tipi  
✅ **Refactoring Sicuro**: TypeScript rileva breaking changes  
✅ **Onboarding Veloce**: Documentazione API interattiva per nuovi sviluppatori

## 📝 Script NPM Disponibili

```bash
# Genera client TypeScript dal openapi.json
npm run openapi:generate

# Mostra URL della documentazione Swagger UI
npm run openapi:docs
```

## 🔍 Confronto: Prima vs Dopo

### Prima (Chiamate Axios Manuali)

```typescript
// ❌ Nessun type checking
// ❌ Possibili typo negli URL
// ❌ Struttura response non validata
const response = await axios.get('/transaction', {
    params: { skip: 0, take: 10 }
})
// any type 😱
```

### Dopo (Client OpenAPI Type-Safe)

```typescript
// ✅ Type checking completo
// ✅ URL validati
// ✅ Response strutturata e validata
const response = await getTransaction({
    query: { skip: 0, take: 10 }
})
// TransactionCollection type 🎉
```

## 🤝 Best Practices

1. **Mantieni sempre sincronizzato `openapi.json`** con il codice del server
2. **Rigenera il client** dopo ogni modifica alla spec
3. **Non modificare mai manualmente** i file in `generated/api/`
4. **Usa sempre il client da** `@/lib/api-client` invece di axios diretto
5. **Testa le API** usando Swagger UI prima di integrarle nel frontend

## 🚨 Troubleshooting

### Il client non si genera

```bash
cd apps/app
rm -rf generated/api
npm run openapi:generate
```

### TypeScript segnala errori dopo la generazione

- Assicurati che `openapi.json` sia valido
- Rigenera il client con `npm run openapi:generate`
- Riavvia il TypeScript server in VS Code: `Cmd+Shift+P` → "Restart TS Server"

### Swagger UI non carica

- Verifica che il server sia avviato su porta 3001
- Controlla che `openapi.json` sia valido JSON

## 📖 Risorse

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [@hey-api/openapi-ts Docs](https://heyapi.vercel.app/)
- [Axios Documentation](https://axios-http.com/)

---

**Nota**: Questo approccio "Contract-Last" è ideale per progetti esistenti. Se parti da zero, considera un approccio "Contract-First" dove scrivi prima la spec OpenAPI e poi generi sia server che client.
