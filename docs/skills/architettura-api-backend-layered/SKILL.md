---
name: architettura-api-backend-layered
description: >
  Descrive il pattern architetturale a livelli del backend Express (route →
  controller → service → repository), il ciclo di vita della richiesta, la
  classe BaseService e la propagazione del contesto utente via
  AsyncLocalStorage. Usa questa skill quando devi aggiungere un nuovo
  endpoint, un nuovo modulo in apps/api/src/api/v1/modules/, o capire come
  un service accede all'utente autenticato senza riceverlo come parametro
  esplicito.
---

# Architettura backend a livelli (Express)

## Quando usarla / quando NON usarla
Usarla per: aggiungere un endpoint o modulo backend, capire il flusso completo di una richiesta HTTP, o replicare il pattern service/repository su una nuova entità.

Non usarla per: la gestione di errori/validazione nel dettaglio (skill dedicata `gestione-errori-validazione-risposte-api`), l'autenticazione stessa (`autenticazione-sessioni-better-auth`), o l'accesso al database (`livello-dati-prisma-orm`).

## Come funziona
- **Entry point HTTP** (`apps/api/src/index.ts`): importa `./instrument.js` (Sentry, deve precedere ogni altro modulo istrumentato), poi `dotenv.config()`, poi `@poveroh/logger/telemetry`. Registra le subscription dell'event bus (`registerActivitySubscribers()`, `registerMarketSyncSubscribers()`, `registerBankSyncSubscribers()`) prima di accettare richieste.
- **Pipeline middleware** (ordine effettivo): `app.set('trust proxy', true)` → `express.json()` → `cookieParser()` → parser custom per le query string (`qs`) → `cors(corsOptions)` (allow-list esplicita da `ALLOWED_ORIGINS`, `credentials: true`) → `app.options('*', cors(corsOptions))` → middleware passthrough → route di health `GET /` → `app.use('/v1', v1Route)` → `Sentry.setupExpressErrorHandler(app)` (solo se `SENTRY_DSN` è impostato). **Non ci sono** helmet né rate-limiting.
- `startServer()` attende `initRedisClient()` prima di chiamare `app.listen(config.PORT, ...)`.
- **Processo worker separato** (`apps/api/src/api/v1/worker/index.ts`, avviato con `dev:worker`/`start:worker`): non crea un'app Express. Costruisce la config Redis, chiama `createJobDispatcher`/`createJobWorker` da `@poveroh/queue` unendo le handler map di tutti i moduli (`asset.handlers.ts`, `import.handlers.ts`, `snapshot.handlers.ts`, `bank-sync.handlers.ts`), registra gli scheduler cron, e gestisce `SIGINT`/`SIGTERM` per una chiusura ordinata.
- **Pattern a livelli**, esempio concreto sul modulo `categories`:
  - Route `apps/api/src/api/v1/routes/category.ts`: `Router()`, ogni verbo passa per `AuthMiddleware.isAuthenticated` e, se serve un upload, `upload.single('file')`, poi il metodo del controller bindato — es. `router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), categoryController.createCategory.bind(categoryController))`.
  - Controller `.../modules/categories/category.controller.ts`: `class CategoryController { private readonly categoryService = new CategoryService() }`; ogni metodo è un try/catch che chiama `parseRequestBody(CreateCategoryRequestSchema, req.body)`, invoca il service, e ritorna `ResponseHelper.success(res, data)` o `ResponseHelper.handleError(res, error)`.
  - Service `.../modules/categories/category.service.ts`: `class CategoryService extends BaseService { constructor() { super('category') } }`; tiene `private readonly categoryRepository = new CategoryRepository()`; legge `this.context.currentUser.id`; dopo la scrittura chiama `eventBus.emit('category.created', { userId, data })`.
  - Repository `.../modules/categories/category.repository.ts`: wrappa direttamente `prisma`, usa `buildWhere()` per i filtri di lista e oggetti `select` tipizzati (`categorySelect`, `categoryWithSubcategoriesSelect` da `@/types/select`).
- **`BaseService`** (`apps/api/src/api/v1/modules/base/base.service.ts`): il costruttore riceve una stringa `location` (usata per il namespacing dei file media) e imposta `this.context = contextService`; espone getter lazy `protected get media(): MediaService` (`new MediaService(this.context.currentUser.id, this.location)`), `protected get activities()`, `protected get redis()`.
- **Nessun container di dependency injection**: i service vengono istanziati con `new XService()` dentro i controller (o da altri service), senza passare `userId` — lo scoping utente arriva interamente dal contesto AsyncLocalStorage, non dal costruttore.
- **Propagazione del contesto richiesta** (`.../modules/base/context.service.ts`): `class ContextService { private static readonly storage = new AsyncLocalStorage<AppContext>() }`, con `runWithContext<T>(context, callback): T` (wrappa `storage.run`), il getter `currentUser` (legge `getRequestContext().user`), `setCurrentUser`/`patchCurrentUser`, e `getRequestContext()` che lancia un errore se chiamato fuori da uno scope `runWithContext`. Un singleton `export const contextService = new ContextService()` è condiviso ovunque.
  - Nelle richieste HTTP, `AuthMiddleware.isAuthenticated` apre il contesto: `contextService.runWithContext({ user: session.user }, () => next())`.
  - Nei worker/hook (che girano fuori da una richiesta HTTP) il contesto va aperto manualmente, es. `apps/api/src/api/v1/worker/jobs/asset.handlers.ts`: `await contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, async () => {...})`; anche gli hook di better-auth (`databaseHooks.user.create.after`) lo fanno per lo stesso motivo.

## Input
Richiesta HTTP autenticata (per il flusso API) o `userId` esplicito (per job/worker che devono aprire manualmente il contesto).

## Output
Risposta JSON tramite `ResponseHelper`, side-effect emessi come eventi di dominio (`eventBus.emit`) verso i subscriber registrati all'avvio.

## Dipendenze
Express `^4.21.2`, `AsyncLocalStorage` (Node core), `@poveroh/prisma`, `better-auth` (per popolare `req.user`), event bus interno (vedi `event-bus-interno-side-effect`).

## Esempio d'uso
```ts
// Un nuovo endpoint segue sempre questo schema a 3-4 livelli:
router.post('/', AuthMiddleware.isAuthenticated, xController.create.bind(xController))
// controller
async create(req, res) {
  try {
    const payload = parseRequestBody(CreateXRequestSchema, req.body)
    const data = await this.xService.createX(payload)
    return ResponseHelper.created(res, data)
  } catch (error) { return ResponseHelper.handleError(res, error) }
}
// service (extends BaseService, super('x'))
async createX(payload) {
  const userId = this.context.currentUser.id
  const data = await this.xRepository.create(userId, payload)
  await eventBus.emit('x.created', { userId, data })
  return data
}
```

## Limiti e note
- Chiamare un metodo di service (o leggere `this.context.currentUser`) fuori da uno scope `runWithContext` lancia un errore a runtime — è un errore comune quando si scrive codice "standalone" che dimentica di aprire il contesto (tipico nei job worker o negli script una tantum).
- Non essendoci un container DI, ogni service istanzia le proprie dipendenze internamente (`new XRepository()`), il che rende il testing con mock più macchinoso — coerente con l'assenza totale di test automatici nel repository.
