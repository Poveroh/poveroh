# Riprogettazione del modulo Import

Piano di refactor del modulo `imports`: due sorgenti di ingresso (parsing CSV e ricezione di transazioni già normalizzate da bank-sync o da altri canali futuri) che confluiscono in un unico flusso di creazione dell'Import, con una fase di arricchimento estendibile (categoria, sottocategoria, subscription) eseguita da un worker.

> Revisione 2 — incorpora le decisioni prese nella review del piano. Le modifiche rispetto alla revisione 1 sono elencate in §12.

---

## 1. Stato attuale

### Come funziona oggi

| Aspetto               | CSV                                                               | Bank-sync                                                                          |
| --------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Punto di ingresso     | `POST /imports` → `ImportController.createImport`                 | job `bank-sync.sync-connection` → `BankSyncService.syncConnection`                 |
| Parsing               | `HowIParsedYourDataAlgorithm.parseCSVFile` (in-request, sincrono) | adapter provider → `ExternalTransaction[]`                                         |
| Creazione Import      | `ImportService.createImport` (batch unico)                        | `ImportService.getOrCreateBankSyncImport` (batch riaperto per account+connessione) |
| Creazione transazioni | `ImportHelper.normalizeTransaction` (batch)                       | `ImportService.createEnrichedTransaction` (una alla volta)                         |
| Arricchimento         | `ImportHelper.enrichTransaction`                                  | stesso metodo                                                                      |
| Stato iniziale        | `IMPORT_PENDING`                                                  | `IMPORT_PENDING`                                                                   |
| Review                | drawer import → approve/reject → `completeImport`                 | identica                                                                           |

I due flussi convergono già a livello di **persistenza** (stessa tabella `Import`, stesso enum `TransactionStatus`, stesso ciclo di review), ma **non a livello di orchestrazione**: sono due percorsi di codice paralleli che duplicano batching e creazione righe, con due API interne diverse su `ImportService`.

### Problemi da risolvere

1. **Nessun flusso unico di ingestione.** `createImport` (CSV, batch) e `createEnrichedTransaction` (bank-sync, singola) sono due implementazioni della stessa cosa. Ogni nuova sorgente futura ne aggiungerebbe una terza.
2. **Sorgente dell'import non persistita.** L'unico indizio è il testo del titolo generato server-side e, indirettamente, `Transaction.bankConnectionId`. La UI non può distinguere né filtrare per sorgente in modo affidabile.
3. **Arricchimento non batchato e non estendibile.** `enrichTransaction` fa **due query Prisma per ogni riga**, in sequenza: un CSV da 800 movimenti significa 1600 query seriali dentro una richiesta HTTP. La logica è hardcoded (exact match su `title` + `amount` + `currency`), senza punto di estensione per Rules o LLM.
4. **Nessun collegamento reale con le Subscription.** Il match con una subscription oggi copia solo `title` e `icon`; non esiste `Transaction.subscriptionId`, quindi l'informazione "questa transazione è il pagamento di questo abbonamento" viene persa subito dopo l'import.
5. **Tutto sincrono nella richiesta HTTP.** Upload, salvataggio file, parsing e arricchimento avvengono dentro `POST /imports`. Il job `import.parse-csv` esiste in `JobMap` ma il suo handler fa solo un `logger.info` e nessuno lo dispatcha: è scaffolding morto.
6. **Nessuna auto-approvazione.** Lo stato iniziale `IMPORT_PENDING` è hardcoded in due punti.
7. **Errori di parsing silenziosi.** `parseCSVFile` ritorna `errors: []` che il service ignora: un CSV non riconosciuto produce un import vuoto senza alcun segnale all'utente.
8. **Tipi Prisma usati come contratto interno.** `ImportHelper.normalizeTransaction` restituisce `Prisma.TransactionCreateManyInput[]` e `Prisma.AmountCreateManyInput[]`, che attraversano il confine helper → service → repository. `ReadedTransaction.originalRow` è tipizzato `Record<string, any>`, vietato dalle regole di progetto.

---

## 2. Architettura di destinazione

```
                 ┌──────────────────────┐        ┌──────────────────────────┐
   CSV upload ──►│  file su storage     │        │  BankSyncService         │
  (HTTP, files)  │  (staging naturale)  │        │  adapter → candidate     │
                 └──────────┬───────────┘        └────────────┬─────────────┘
                            │                                 │ staging su DB
                            ▼                                 ▼
                 ┌───────────────────────────────────────────────────────────┐
                 │  ImportIngestionService.ingest(ImportIngestionRequest)     │
                 │  crea Import (source, sourceReference, status PROCESSING)  │
                 │  + persiste l'input della sorgente + dispatch job          │
                 └────────────────────────────┬──────────────────────────────┘
                                              │  job `import.process`
                                              ▼
                 ┌───────────────────────────────────────────────────────────┐
                 │  ImportProcessingService (worker)                          │
                 │  1. reader della sorgente → ImportCandidateTransaction[]    │
                 │  2. EnrichmentPipeline.run(candidates)                      │
                 │  3. crea Transaction + Amount in IMPORT_PENDING             │
                 │  4. autoApprove? → completeImport                           │
                 │  5. status = PENDING_REVIEW | FAILED                        │
                 └───────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                            review in UI (invariata) → complete → COMPLETED
```

### Il punto di estensione: il reader della sorgente

Il worker non sa da dove arrivano le transazioni: chiede a un reader.

```ts
interface ImportSourceReader {
    readonly source: ImportSourceEnum
    read(importId: string): Promise<ImportCandidateTransaction[]>
}
```

Due implementazioni:

- **`CsvImportSourceReader`** — legge le righe `ImportFile` dell'import, recupera i file dallo storage (`MediaService.readFile`, aggiunto per questo) e li parsa. Gli errori del parser, oggi ignorati, vengono loggati con il nome del file.
- **`ExternalImportSourceReader`** — legge le righe `ImportStagedTransaction` dell'import.

Il reader si limita a leggere: la cancellazione delle righe staged non è sua, la fa il processing service dentro la stessa transazione che crea le transazioni definitive. Tenerla fuori dall'interfaccia evita che il tipo del client transazionale di Prisma finisca in `@poveroh/types`.

Da lì in poi il flusso è **identico byte per byte** per entrambe le sorgenti. Aggiungere una sorgente futura significa scrivere un reader e registrarlo in una mappa.

### Perché la staging table serve solo alle sorgenti esterne

Questa è la risposta alla domanda "la staging la usa solo bank-sync?": **sì, e il motivo è asimmetrico nei due casi.**

- Per il **CSV** il file salvato su storage _è già_ la staging area. Il parsing è deterministico e ripetibile: se il job fallisce a metà, al retry si riparsa lo stesso file e si riottengono le stesse righe. Scrivere N righe su DB per poi cancellarle sarebbe lavoro puro senza guadagno.
- Per **bank-sync** no. Le transazioni arrivano da una chiamata remota con un **cursore che avanza**: `client.syncTransactions` restituisce `nextCursor`, e una volta salvato quel cursore il provider non restituirà più quelle transazioni. Se il job fallisse dopo l'avanzamento del cursore e i dati vivessero solo nel payload Redis, sarebbero persi in modo irrecuperabile. Persisterli su DB prima di considerare consumato il cursore è ciò che rende il flusso sicuro.

**Ciclo di vita delle righe staged:** vengono cancellate nella **stessa transazione DB** in cui vengono create le `Transaction` e gli `Amount` definitivi — o entrambe le cose avvengono, o nessuna. Se il job fallisce prima, restano e il retry le ritrova (nessuna doppia lettura dal provider). In più `onDelete: Cascade` sull'`Import` le rimuove se l'import viene eliminato prima di essere elaborato. Non sono un archivio storico: sono una coda di consegna durevole.

### Pipeline di arricchimento

```
EnrichmentPipeline
 ├─ prepare()  ── una query per l'intero batch, non per riga
 ├─ RulesStrategy            (priorità 10 — placeholder, no-op finché il modulo Rules non esiste)
 ├─ SubscriptionStrategy     (priorità 20 — assegna subscriptionId, icon, title, categoria ereditata)
 ├─ HistoryStrategy          (priorità 30 — categoria/sottocategoria/nota da transazioni approvate simili)
 └─ (futuro) LlmStrategy     (priorità 90 — solo sui campi rimasti vuoti)
```

Ogni strategia riempie **solo i campi ancora vuoti** (first-wins per campo, strategie ordinate per priorità). Aggiungere una strategia significa scrivere una classe e registrarla in un array: nessuna modifica al flusso.

---

## 3. Contratti e tipi

Requisito vincolante: **nessun tipo Prisma attraversa i confini dei moduli**. Ogni struttura che passa da un layer all'altro è generata da uno schema Zod registrato su OpenAPI, seguendo il pattern degli altri moduli (`packages/openapi/schemas/*.schema.ts` → `npm run openapi:generate` → `@poveroh/contracts` → riesportato da `@poveroh/types`). I tipi `Prisma.*` restano confinati **dentro** `import.repository.ts`, che è l'unico punto autorizzato a tradurre un DTO in input Prisma.

### 3.1 Enum nuovi — `packages/openapi/schemas/enum.schema.ts`

```ts
/**
 * Import status enum representing the import lifecycle, from worker processing to completed review
 */
export const ImportStatusEnum = z
    .enum(['PROCESSING', 'PENDING_REVIEW', 'COMPLETED', 'FAILED'])
    .openapi('ImportStatusEnum')

/**
 * Import source enum representing where an import's transactions came from
 */
export const ImportSourceEnum = z.enum(['CSV', 'BANK_SYNC', 'MANUAL', 'API']).openapi('ImportSourceEnum')

/**
 * Enrichment strategy enum representing which strategy produced an enrichment value
 */
export const EnrichmentStrategyEnum = z
    .enum(['RULE', 'SUBSCRIPTION', 'HISTORY', 'LLM'])
    .openapi('EnrichmentStrategyEnum')
```

`ImportStatus` **sostituisce** `TransactionStatus` su `Import.status`: i due cicli di vita sono diversi e condividerli costringeva a inventare valori privi di senso per una delle due entità. `TransactionStatus` resta invariato per `Transaction`. Corrispondenze:

| Prima (`TransactionStatus`)                | Dopo (`ImportStatus`)                           |
| ------------------------------------------ | ----------------------------------------------- |
| —                                          | `PROCESSING` (nuovo: in coda o in elaborazione) |
| `IMPORT_PENDING`                           | `PENDING_REVIEW`                                |
| `APPROVED`                                 | `COMPLETED`                                     |
| `IMPORT_REJECTED` (mai scritto dal codice) | eliminato                                       |
| —                                          | `FAILED` (nuovo)                                |

`EnrichmentStrategyEnum` serve al logging della pipeline e alla telemetria del worker; **non** viene persistito su `Transaction` (vedi §5).

### 3.2 Schemi nuovi — `packages/openapi/schemas/import.schema.ts`

```ts
/**
 * A normalized transaction ready to be turned into an Import transaction, whatever the source that
 * produced it: the CSV parser, a bank-sync provider, or a future integration
 */
export const ImportCandidateTransactionSchema = z
    .object({
        date: z.string().datetime(),
        title: z.string().nonempty(),
        amount: z.number(),
        currency: CurrencyEnum,
        action: TransactionActionEnum,
        externalTransactionId: z.string().nullable().optional(),
        bankSyncAccountId: z.uuid().nullable().optional(),
        rawRow: z.array(z.string()).optional()
    })
    .openapi('ImportCandidateTransaction')

/**
 * The single entry point of the import flow: everything needed to open an import, whatever its source
 */
export const ImportIngestionRequestSchema = z
    .object({
        source: ImportSourceEnum,
        financialAccountId: z.uuid(),
        autoApprove: z.boolean().default(false),
        sourceReference: z.string().nullable().optional(),
        bankConnectionId: z.uuid().nullable().optional(),
        transactions: z.array(ImportCandidateTransactionSchema).optional()
    })
    .openapi('ImportIngestionRequest')

/**
 * The fields an enrichment strategy can contribute to a candidate transaction
 */
export const ImportEnrichmentSchema = z
    .object({
        title: z.string().optional(),
        categoryId: z.uuid().nullable().optional(),
        subcategoryId: z.uuid().nullable().optional(),
        subscriptionId: z.uuid().nullable().optional(),
        icon: z.string().nullable().optional(),
        note: z.string().nullable().optional()
    })
    .openapi('ImportEnrichment')

/**
 * An enrichment result tagged with the strategy that produced it
 */
export const ImportEnrichmentResultSchema = ImportEnrichmentSchema.extend({
    strategy: EnrichmentStrategyEnum
}).openapi('ImportEnrichmentResult')

/**
 * A candidate transaction after enrichment: everything the repository needs to persist a
 * Transaction and its Amount, with no Prisma type crossing the module boundary
 */
export const ImportTransactionDraftSchema = z
    .object({
        id: z.uuid(),
        importId: z.uuid(),
        financialAccountId: z.uuid(),
        date: z.string().datetime(),
        title: z.string().nonempty(),
        action: TransactionActionEnum,
        amount: z.number(),
        currency: CurrencyEnum,
        categoryId: z.uuid().nullable(),
        subcategoryId: z.uuid().nullable(),
        subscriptionId: z.uuid().nullable(),
        icon: z.string().nullable(),
        note: z.string().nullable(),
        bankConnectionId: z.uuid().nullable(),
        bankSyncAccountId: z.uuid().nullable(),
        externalTransactionId: z.string().nullable()
    })
    .openapi('ImportTransactionDraft')
```

`ImportTransactionDraft` è il tipo che **sostituisce** la coppia `Prisma.TransactionCreateManyInput` / `Prisma.AmountCreateManyInput` oggi restituita da `ImportHelper.normalizeTransaction`. La pipeline produce draft; `ImportRepository.createTransactionDrafts(drafts)` è l'unico punto che li spacchetta nelle due `createMany` Prisma.

### 3.3 Schemi modificati

```ts
export const ImportSchema = z
    .object({
        id: z.uuid(),
        userId: z.uuid(),
        title: z.string(),
        financialAccountId: z.string().nonempty(),
        status: ImportStatusEnum, // era TransactionStatusEnum
        source: ImportSourceEnum, // nuovo
        sourceReference: z.string().nullable(), // nuovo — providerId per bank-sync
        bankConnectionId: z.uuid().nullable(), // nuovo
        autoApprove: z.boolean(), // nuovo
        failureReason: z.string().nullable(), // nuovo — messaggio d'errore quando status = FAILED
        transactions: z.array(TransactionSchema).optional(),
        files: z.array(ImportFileSchema).optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Import')

export const CreateImportRequestSchema = ImportSchema.pick({ financialAccountId: true })
    .extend({ autoApprove: z.coerce.boolean().optional().default(false) })
    .openapi('CreateImportRequest')

export const ImportFiltersSchema = z
    .object({
        id: ImportParamsId,
        title: StringFilterSchema.optional(),
        source: ImportSourceEnum.optional(), // nuovo
        date: DateFilterSchema.optional(),
        includeTransactions: z.boolean().optional().default(true)
    })
    .partial()
    .openapi('ImportFilters')
```

`autoApprove` usa `z.coerce.boolean()` perché `POST /imports` è multipart: il campo arriva come stringa.

`TransactionSchema` guadagna `subscriptionId: z.uuid().nullable()`.

### 3.4 Tipi da correggere in `packages/types/src/lib/import.ts`

| Tipo attuale                                          | Destino                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ReadedTransaction`                                   | **eliminato**, sostituito da `ImportCandidateTransaction` (Zod)                                                    |
| `TransactionEnrichment`                               | **eliminato**, sostituito da `ImportEnrichment` (Zod)                                                              |
| `ValueReturned`                                       | rinominato `CsvParseResult`, con `transactions: ImportCandidateTransaction[]`                                      |
| `FieldMapping`                                        | resta (tipo interno del parser CSV), invariato                                                                     |
| `ReadedTransaction.originalRow?: Record<string, any>` | diventa `rawRow?: string[]` (le celle della riga), eliminando la violazione della regola sui `Record<string, any>` |

### 3.5 Le due interfacce che restano TypeScript scritto a mano

`ImportSourceReader` (§2) e `ImportEnrichmentStrategy` (§5) sono **interfacce con metodi**, non DTO: Zod descrive dati, non comportamenti, e non c'è modo di generarle. Vivono quindi in `packages/types/src/lib/import.ts` come interfacce TypeScript, esattamente come `BankSyncAdapter` in `packages/types/src/lib/bank-sync.ts`. I loro parametri e valori di ritorno sono però tutti tipi Zod-generati.

---

## 4. Modello dati

### `Import` — campi nuovi e modificati

| Campo              | Tipo           | Note                                                                                                        |
| ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `status`           | `ImportStatus` | **cambia tipo**: da `TransactionStatus` a `ImportStatus`, default `PROCESSING`                              |
| `source`           | `ImportSource` | `CSV \| BANK_SYNC \| MANUAL \| API`                                                                         |
| `sourceReference`  | `String?`      | `providerId` per bank-sync                                                                                  |
| `bankConnectionId` | `String?`      | FK → `BankConnection`, `onDelete: SetNull`                                                                  |
| `autoApprove`      | `Boolean`      | default `false`                                                                                             |
| `failureReason`    | `String?`      | messaggio d'errore quando `status = FAILED`, incluse le diagnostiche di parsing oggi silenziose             |
| `title`            | `String`       | **invariato**, resta generato dal server (vedi issue [#200](https://github.com/Poveroh/poveroh/issues/200)) |

Indici nuovi: `@@index([userId, source])`, `@@index([status])` (già presente, ora sul nuovo enum).

Migration: la colonna cambia tipo enum, quindi serve un `USING` esplicito con la mappa di §3.1, più il backfill di `source` (`BANK_SYNC` per gli import le cui transazioni hanno `bankConnectionId` valorizzato, `CSV` per tutti gli altri) e di `bankConnectionId` sull'import, derivato dalle sue transazioni.

### `Transaction` — campo nuovo

| Campo            | Tipo      | Note                                                 |
| ---------------- | --------- | ---------------------------------------------------- |
| `subscriptionId` | `String?` | FK → `Subscription`, `onDelete: SetNull`, con indice |

Nessun campo di audit sull'arricchimento (vedi §5).

### `ImportStagedTransaction` — nuovo modello

```prisma
model ImportStagedTransaction {
  id                    String            @id @default(uuid())
  importId              String
  date                  DateTime
  title                 String
  amount                Decimal           @db.Decimal(20, 2)
  currency              Currency
  action                TransactionAction
  externalTransactionId String?
  bankSyncAccountId     String?
  createdAt             DateTime          @default(now())

  import Import @relation(fields: [importId], references: [id], onDelete: Cascade)

  @@unique([importId, externalTransactionId])
  @@index([importId])
}
```

`@@unique([importId, externalTransactionId])` rende idempotente lo staging su retry dello stesso run di sync.

### `BankConnection` — campo nuovo

`autoApproveTransactions Boolean @default(false)`: sceglie per singola connessione se le transazioni sincronizzate passano dalla review o sono approvate direttamente. Alimenta `Import.autoApprove`. Default `false`, cioè il comportamento attuale.

---

## 5. Arricchimento

### L'interfaccia

```ts
interface ImportEnrichmentStrategy {
    readonly strategy: EnrichmentStrategyEnum
    readonly priority: number
    prepare(userId: string, candidates: ImportCandidateTransaction[]): Promise<void>
    enrich(candidate: ImportCandidateTransaction): ImportEnrichmentResult | null
}
```

`prepare()` è il punto in cui ogni strategia carica **in una sola query** tutto ciò che le serve per l'intero batch. `enrich()` è poi puramente in-memory: il problema N+1 attuale scompare per costruzione, e una strategia non può reintrodurlo perché non ha modo di fare I/O nel ciclo.

### SubscriptionStrategy

1. Carica le subscription attive dell'utente (`isEnabled: true`, `deletedAt: null`).
2. Match su titolo normalizzato + importo + valuta. La normalizzazione rimuove numeri di carta, date e spazi multipli e passa a maiuscolo (`PAYPAL *NETFLIX 12/03` → `PAYPAL NETFLIX`).
3. Assegna `subscriptionId`, `icon` (`appearanceLogoIcon`), `title`.
4. `Subscription` non ha un `categoryId`: la categoria viene ereditata dalla categoria più frequente fra le transazioni **già approvate** collegate a quella stessa subscription (una sola query aggregata in `prepare`). Alla prima esecuzione non produce categoria; dalla seconda in poi sì. L'aggiunta di `Subscription.categoryId`, che renderebbe l'assegnazione deterministica già al primo match, è tracciata in issue [#201](https://github.com/Poveroh/poveroh/issues/201) come PR successiva.

### HistoryStrategy

Sostituisce l'attuale `enrichTransaction` mantenendone la semantica, ma:

- una sola query per batch: carica le transazioni `APPROVED` dell'utente i cui titoli normalizzati compaiono nel batch, con `select` sui soli campi necessari;
- match a due livelli: prima titolo normalizzato **+** importo/valuta (match forte, eredita anche `note`), poi solo titolo normalizzato (match debole, eredita solo categoria e sottocategoria);
- a parità di match vince la categoria più frequente, poi la più recente.

### RulesStrategy

Registrata con la priorità più alta ma con `prepare()` che non carica nulla e `enrich()` che ritorna `null` finché il modello `Rule` non esiste. Serve a fissare il contratto: quando il modulo Rules arriverà, l'unico lavoro sarà implementare questi due metodi.

### Perché non persistiamo la provenienza della categoria

La revisione 1 proponeva `Transaction.categorySource`. Rimosso. Alternative valutate:

| Opzione                          | Valutazione                                                                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Non persistere nulla** ✅   | Scelta. L'informazione non cambia ciò che l'utente fa in review (approva o corregge), e `subscriptionId` già racconta da solo il caso più interessante: "questa è la rata di questo abbonamento".                                |
| B. Colonna su `Transaction`      | Una colonna su una tabella grande e a vita lunga per un dato utile solo nei minuti fra import e review. Se un giorno servisse, è una colonna additiva e non breaking: si aggiunge senza toccare nulla di ciò che costruiamo ora. |
| C. Audit sulla staging table     | Asimmetrico: il CSV non passa dallo staging, quindi il dato esisterebbe solo per bank-sync.                                                                                                                                      |
| D. Tabella `ImportEnrichmentLog` | Una tabella e un ciclo di vita in più per un dato di cui non è chiaro l'uso.                                                                                                                                                     |

Per misurare la qualità delle strategie — l'unico uso concreto che il campo avrebbe avuto — la pipeline emette un riepilogo strutturato nei log del worker (quante transazioni arricchite per strategia, quante rimaste senza categoria) usando `EnrichmentStrategyEnum`. Nessuna modifica allo schema, stessa informazione.

---

## 6. Struttura del modulo

```
apps/api/src/api/v1/modules/imports/
├── import.controller.ts               invariato nella superficie, delega alla nuova ingestion
├── import.service.ts                  ciclo di vita: read, update, approve, complete, rollback, delete
├── import.repository.ts               + staging, + campi sorgente, + createTransactionDrafts
├── ingestion/
│   ├── import-ingestion.service.ts    UNICO punto di creazione di un Import
│   └── readers/
│       ├── csv-import.reader.ts       ImportFile → parser → candidate
│       └── external-import.reader.ts  ImportStagedTransaction → candidate
├── processing/
│   └── import-processing.service.ts   worker: legge, arricchisce, persiste, auto-approva
└── enrichment/
    ├── enrichment.pipeline.ts
    └── strategies/
        ├── rules.strategy.ts          placeholder registrato ma inattivo
        ├── subscription.strategy.ts
        └── history.strategy.ts
```

`apps/api/src/api/v1/helpers/import.helper.ts` viene eliminato: `enrichTransaction` è sostituita dalla pipeline, `normalizeTransaction` diventa la funzione che trasforma candidate + enrichment in `ImportTransactionDraft` dentro `import-processing.service.ts`.

---

## 7. Flussi

### CSV

1. `POST /imports` (multipart, invariato) → il controller valida `CreateImportRequest`, ora con `autoApprove` opzionale.
2. `ImportIngestionService.ingest({ source: 'CSV', ... })`: salva i file su storage, crea l'`Import` con `source: 'CSV'` e `status: 'PROCESSING'`, crea le righe `ImportFile`, dispatcha `import.process`.
3. Risposta HTTP immediata con l'`ImportData` in `PROCESSING`: l'import compare subito in lista con l'indicatore di elaborazione.
4. Il worker parsa, arricchisce, crea le transazioni in `IMPORT_PENDING` e porta l'import a `PENDING_REVIEW`. Gli errori del parser (oggi ignorati) finiscono in `failureReason`; se non è stata prodotta alcuna transazione, lo stato diventa `FAILED`.

### Bank-sync — e cosa succede a `modified` e `removed`

Il provider risponde a `syncTransactions` con tre liste: `added`, `modified`, `removedExternalIds`. Riguardano cose diverse e non possono seguire lo stesso percorso.

- **`added`** sono movimenti che il provider ci manda per la prima volta. Nella quasi totalità dei casi non esistono ancora nel nostro DB: sono **nuove transazioni**, e devono passare dall'import per essere arricchite e riviste dall'utente.
- **`modified`** sono movimenti **già sincronizzati in passato**, che il provider ha aggiornato: una transazione passata da _pending_ a definitiva, un importo rettificato, una descrizione cambiata. Nel nostro DB esistono già come `Transaction`, spesso già `APPROVED` e già conteggiate nel saldo del conto. Se le facessimo passare dall'ingestion creeremmo un **duplicato** della stessa transazione e metteremmo in review un movimento che l'utente aveva già approvato mesi fa. Vanno invece aggiornate sul posto, ed è esattamente ciò che `BankSyncService.upsertTransaction` fa oggi, ricalcolando il saldo quando la transazione toccata era già approvata.
- **`removedExternalIds`** sono movimenti che il provider ha cancellato (tipicamente un _pending_ mai andato a buon fine). Vanno soft-deleted, con ricalcolo del saldo se erano approvati: `BankSyncService.removeTransactions`, invariato.

Il criterio operativo non è quindi "in quale lista sta", ma **se il movimento esiste già da noi**. Per ogni transazione in `added ∪ modified`, `BankSyncService` verifica la presenza di un `Amount` con `(bankSyncAccountId, externalTransactionId)`:

- **esiste** → update in place nel `BankSyncService`, come oggi. Non tocca gli import.
- **non esiste** → diventa una `ImportCandidateTransaction`.

Questo copre anche il caso limite in cui una transazione compare in `modified` senza essere mai stata registrata da noi (un primo sync che l'aveva persa): viene trattata come nuova e passa correttamente dall'import.

Le candidate raccolte in tutto il run vengono consegnate in **una sola chiamata** a `ImportIngestionService.ingest({ source: 'BANK_SYNC', sourceReference: providerId, bankConnectionId, autoApprove: connection.autoApproveTransactions, transactions })`, che riusa l'import aperto per account+connessione (la logica di `findOpenBankSyncImport`, spostata lì) o ne crea uno nuovo, scrive le righe staged e dispatcha il job. `getOrCreateBankSyncImport` e `createEnrichedTransaction` vengono rimossi da `ImportService`.

La dedup resta garantita su due livelli: `@@unique([importId, externalTransactionId])` sullo staging e `@@unique([bankSyncAccountId, externalTransactionId])` su `Amount`.

### Auto-approvazione

Quando `Import.autoApprove` è `true`, al termine dell'elaborazione il worker esegue lo stesso percorso di `completeImport` (transazioni → `APPROVED`, import → `COMPLETED`, ricalcolo di saldi e snapshot dalla data più vecchia). Nessuna duplicazione: la parte transazionale di `completeImport` viene estratta in un metodo privato riusato da entrambi i chiamanti.

---

## 8. Worker

`JobMap` — `import.parse-csv` (mai dispatchato) viene sostituito da:

```ts
'import.process': {
    userId: string
    importId: string
}
```

L'handler segue il pattern di `bank-sync.handlers.ts`:

```ts
'import.process': async ({ userId, importId }) => {
    await contextService.runWithContext({ user: { ...DEFAULT_USER, id: userId } }, async () => {
        await new ImportProcessingService().process(importId)
    })
}
```

Dispatch con `deduplicationId: \`import:${importId}\``per evitare doppie elaborazioni dello stesso import,`attempts: 3`e backoff esponenziale. Ogni fallimento definitivo porta lo stato a`FAILED`con il messaggio in`failureReason`, così l'errore è visibile in UI invece di restare nei log.

---

## 9. Frontend

- **`ImportData`** espone `status` (nuovo enum), `source`, `sourceReference`, `autoApprove`, `failureReason`.
- **`ImportsItem`** mostra un badge della sorgente accanto al titolo (`imports.source.CSV`, `imports.source.BANK_SYNC`, ...) e il conteggio delle transazioni. Il titolo resta quello generato dal server finché non viene chiusa la issue [#200](https://github.com/Poveroh/poveroh/issues/200); i titoli generati vengono resi uniformi (`Import via bank sync by {provider} at {date}`, `Import via CSV at {date}`).
- **Stato di elaborazione**: con `status: 'PROCESSING'` l'item mostra un indicatore e non è apribile; `useImport()` abilita un `refetchInterval` finché esiste almeno un import in `PROCESSING` e lo disattiva quando non ce ne sono più (lo `staleTime: Infinity` attuale va reso condizionale). `FAILED` mostra `failureReason`.
- **`getStatusColor`** e le chiavi i18n `imports.status.*` vanno riscritte sul nuovo enum; il ramo `IMPORT_REJECTED`, oggi irraggiungibile, sparisce.
- **Review**: `TransactionApprovalItem` mostra il collegamento alla subscription riconosciuta quando `subscriptionId` è valorizzato.
- **Auto-approve**: checkbox nel form di import CSV e toggle per connessione nelle impostazioni bank-sync.

Nessun endpoint cambia; cambiano i valori di `status` e si aggiungono campi a `ImportData`.

---

## 10. Stacked PR

`gh` è autenticato, `graphite` non è installato. Git è 2.51, quindi `git rebase --update-refs` è disponibile: è ciò che rende gestibile una stack senza tool esterni, perché aggiorna in automatico i branch intermedi quando si rebasa la base.

Consiglio di attivarlo una volta per tutte:

```bash
git config rebase.updateRefs true
```

Struttura della stack, con base sul branch corrente:

```
main
└── feat/bank-sync                    (branch corrente, base della stack)
    └── feat/import-contracts          PR 1
        └── feat/import-enrichment     PR 2
            └── feat/import-ingestion  PR 3
                └── feat/import-worker PR 4
                    └── feat/import-bank-sync PR 5
                        └── feat/import-ui     PR 6
```

Per ogni anello:

```bash
git checkout -b feat/import-enrichment feat/import-contracts
# ... commit ...
git push -u origin feat/import-enrichment
gh pr create --base feat/import-contracts --head feat/import-enrichment \
  --title "feat(import): add the enrichment pipeline" --body "Parte 2/6 — stack: #<n PR 1>"
```

Quando una PR a monte riceve modifiche in review, si rebasa la stack dal punto toccato:

```bash
git checkout feat/import-ui                  # la punta della stack
git rebase --update-refs feat/import-contracts
git push --force-with-lease origin feat/import-enrichment feat/import-ingestion feat/import-worker feat/import-bank-sync feat/import-ui
```

Quando una PR viene mergiata, GitHub ribasa automaticamente la base della PR successiva sul branch di destinazione. Le PR vanno mergiate **in ordine**, dal basso della stack verso l'alto.

La base è `feat/bank-sync` (decisa in review). Il branch contiene già 10 commit e non ha ancora una PR aperta: va aperta anche quella verso `main`, così `feat/bank-sync` diventa il primo anello della catena e l'intera stack è reviewabile in ordine. Far partire la stack da `main` non era praticabile senza mergiare prima quel branch, dato che la PR 5 modifica `BankSyncService`, che su `main` non esiste ancora.

### Contenuto delle PR

> **Stato al 26/08/2026.** Sono state aperte due PR — [#203](https://github.com/Poveroh/poveroh/pull/203) (contratti) e [#204](https://github.com/Poveroh/poveroh/pull/204) (pipeline) — piu' la PR base [#202](https://github.com/Poveroh/poveroh/pull/202) di `feat/bank-sync`. Il resto del lavoro (ingestione, worker, bank-sync, UI) e' stato scritto su `feat/import-ingestion` senza aprire altre PR, su richiesta. Le PR 3-6 della tabella qui sotto descrivono quindi contenuto gia' implementato ma non ancora proposto in review.

| #   | Branch                   | Titolo                                                                        | Contenuto                                                                                                                                                                                         | File |
| --- | ------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | `feat/import-contracts`  | `feat(import): add import source, status and staging schema`                  | Prisma (`ImportStatus`, `ImportSource`, campi su `Import`/`Transaction`/`BankConnection`, `ImportStagedTransaction`), migration con backfill, tutti gli schemi Zod di §3, rigenerazione contratti | ~7   |
| 2   | `feat/import-enrichment` | `feat(import): add the enrichment pipeline`                                   | `enrichment/`, interfaccia strategia, `history` + `subscription` + `rules` placeholder; ancora invocata in modo sincrono al posto di `enrichTransaction`                                          | ~8   |
| 3   | `feat/import-ingestion`  | `refactor(import): unify ingestion behind a single service`                   | `ingestion/`, i due reader, `ImportTransactionDraft` al posto dei tipi Prisma, `createImport` che delega                                                                                          | ~8   |
| 4   | `feat/import-worker`     | `feat(import): process imports in the worker`                                 | `processing/`, job `import.process`, handler, stati `PROCESSING`/`FAILED`, auto-approve, propagazione errori di parsing                                                                           | ~7   |
| 5   | `feat/import-bank-sync`  | `refactor(bank-sync): route synced transactions through the import ingestion` | `BankSyncService` usa `ingest`, rimozione di `getOrCreateBankSyncImport` e `createEnrichedTransaction`                                                                                            | ~5   |
| 6   | `feat/import-ui`         | `feat(app): show import source and processing state`                          | `ImportsItem`, `useImport`, i18n, badge sorgente, nuovo enum di stato, toggle auto-approve                                                                                                        | ~9   |

---

## 11. Follow-up tracciati su GitHub

- [#200](https://github.com/Poveroh/poveroh/issues/200) — titolo dell'import modificabile dall'utente e label di default derivata da sorgente + data via i18n.
- [#201](https://github.com/Poveroh/poveroh/issues/201) — `Subscription.categoryId` per una categorizzazione deterministica al primo match.

---

## 12. Modifiche rispetto alla revisione 1

| Punto                     | Revisione 1                                          | Revisione 2                                                                                                                                      |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stato dell'import         | campo `processingStatus` separato accanto a `status` | un solo `status`, con enum dedicato `ImportStatus` che sostituisce `TransactionStatus` su `Import`. I contratti cambiano, come concordato        |
| Titolo                    | `title` reso nullable, label derivata in UI          | `title` invariato, generato dal server; l'enhancement è tracciato in [#200](https://github.com/Poveroh/poveroh/issues/200)                       |
| Staging                   | entrambe le sorgenti                                 | solo le sorgenti esterne; per il CSV il file su storage è già la staging area. Il flusso resta unico grazie all'interfaccia `ImportSourceReader` |
| Provenienza categoria     | campo `Transaction.categorySource`                   | nessun campo persistito; riepilogo strutturato nei log del worker                                                                                |
| Tipi                      | `Prisma.TransactionCreateManyInput` fra i layer      | tutto Zod-generato (§3); Prisma confinato dentro il repository                                                                                   |
| `Subscription.categoryId` | da confermare                                        | rimandato, tracciato in [#201](https://github.com/Poveroh/poveroh/issues/201)                                                                    |
| PR                        | 6 PR sequenziali                                     | 6 PR come stack GitHub, con la procedura di rebase in §10                                                                                        |

---

## 13. Scelte emerse durante l'implementazione

Cose decise scrivendo il codice, non previste dal piano:

- **Il controller chiama direttamente `ImportIngestionService`.** `ImportService` non espone piu' `createImport`: se lo facesse, la catena `ImportService -> Ingestion -> Processing -> ImportService` (necessaria per l'auto-approvazione) diventerebbe un ciclo di import. Il controller istanzia i due service, restando comunque sottile.
- **L'auto-approvazione riusa `completeImport`.** `ImportService.approveAllTransactions` porta le transazioni da `IMPORT_PENDING` a `IMPORT_APPROVED` e poi chiama `completeImport`, cosi' il ricalcolo di saldi e snapshot non viene duplicato.
- **`ImportTransactionDraft` porta anche `userId`.** Ogni riga appartiene a un utente e il worker non ha una request da cui dedurlo.
- **`ImportProcessingTarget`** e' lo schema che il repository restituisce al processing (sorgente, conto, connessione, auto-approvazione), invece di rileggere l'intero import.
- **`failureReason` si azzera da solo.** `updateStatus` lo pulisce a ogni transizione fuori da `FAILED`, cosi' un retry riuscito non lascia in vista l'errore del tentativo precedente.
- **`MediaService.readFile` + `toFileBuffer`.** Il worker non ha piu' il buffer dell'upload, quindi serviva poter rileggere il file: `toFileBuffer` normalizza le tre forme diverse che i provider di storage restituiscono (Buffer in locale, byte array su AWS, stream su Azure e GCS).
- **Il polling della lista usa `useQuery`, non `useQueries`.** Con `useQueries` il callback di `refetchInterval` faceva collassare l'inferenza dei tipi sul risultato; per una query sola `useQuery` e' comunque la scelta giusta.
- **La checkbox di auto-approvazione riusa `IgnoreField`**, che e' gia' una checkbox parametrica per nome ed etichetta, invece di introdurre un nuovo componente.
