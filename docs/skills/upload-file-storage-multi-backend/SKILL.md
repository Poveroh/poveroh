---
name: upload-file-storage-multi-backend
description: >
  Descrive come vengono gestiti gli upload di file (Multer) e lo storage
  multi-provider (locale, AWS S3, GCS, Azure, DigitalOcean) tramite
  MediaService e la libreria beycloud. Usa questa skill quando devi
  aggiungere un upload a un nuovo endpoint, capire come viene generato
  l'URL CDN di un file, o configurare un nuovo backend di storage.
---

# Upload file e storage multi-backend

## Quando usarla / quando NON usarla
Usarla per: aggiungere `upload.single()`/`upload.array()` a una route, salvare un file tramite `this.media`/`this.saveFile`, o cambiare `FILE_STORAGE_MODE`.

Non usarla per: la cifratura dei contenuti (i file non sono cifrati da questo layer, vedi invece `cifratura-e-gestione-segreti` per le credenziali) o l'architettura generale dei service (`architettura-api-backend-layered`).

## Come funziona
- **Multer**: configurato in `apps/api/src/middleware/upload.middleware.ts` con `multer.memoryStorage()`, esportato come `export const upload = multer({ storage })`, applicato a livello di singola route (`upload.single('file')` o `upload.array(...)`) — es. in `routes/category.ts` per l'icona di una categoria.
- **`MediaService`** (`apps/api/src/api/v1/modules/base/media.service.ts`): istanziato come `new MediaService(userId, location)`, costruisce `baseUrl = path.join(userId, location)` (namespacing per utente e per modulo) e delega l'upload effettivo a `this.uploadClient = getUploadClient()`. `BaseService` esporta un getter `protected get media()` che istanzia automaticamente `MediaService` con l'utente corrente e la `location` del service.
- **Abstraction di storage** (`apps/api/src/utils/storage.ts`): costruita sul package terzo `beycloud` (`BeyCloud`, `ClientProvider`). Il backend è selezionato dalla variabile d'ambiente `FILE_STORAGE_MODE`, uno tra `local | aws | gcloud | azure | digitalocean`, ciascuno con la propria config (es. locale: `CDN_LOCAL_DATA_PATH`; AWS: `AWS_BUCKET`/`AWS_REGION`/chiavi di accesso; analogamente per GCS/Azure/DigitalOcean — vedi `docs/ENV_SETUP.md` per l'elenco completo delle variabili).
- `isLocalStorageMode` determina se `MediaService` ritorna un URL CDN completo (`new URL(filePath, baseCdnUrl)`, dove `baseCdnUrl` punta a `cdn.poveroh.local` in locale) oppure il path di storage grezzo (per i provider cloud, dove l'URL pubblico è gestito dal provider stesso).
- **Convenzione di uso nei service**: chiamare `this.saveFile(entityId, file)` o accedere a `this.media` — mai istanziare `MediaService`/il client di storage direttamente in un modulo di dominio.

## Input
Un `Express.Multer.File` (upload in memoria) più `userId`/`location` (dal contesto del service chiamante).

## Output
Un URL (CDN o path di storage, secondo `FILE_STORAGE_MODE`) persistibile su un campo del modello Prisma corrispondente (es. l'icona di una categoria, il logo di un veicolo).

## Dipendenze
`multer ^2.2.0`, `beycloud ^1.1.2`, uno tra i provider cloud configurati (nessuna dipendenza obbligatoria se si usa lo storage locale).

## Esempio d'uso
```ts
// route
router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), categoryController.createCategory.bind(categoryController))

// service (extends BaseService)
async createCategory(payload: CreateCategoryRequest, file?: Express.Multer.File) {
    const iconUrl = file ? await this.media.saveFile(categoryId, file) : undefined
    // ...
}
```

## Limiti e note
- Con `multer.memoryStorage()`, i file transitano interamente in RAM prima di essere inviati al backend di storage: non c'è streaming diretto su disco/cloud, il che pone un limite implicito alla dimensione massima ragionevole di un upload (nessun limite esplicito di dimensione è stato trovato configurato su `multer({ storage })`).
- Il comportamento di generazione URL (CDN vs path grezzo) dipende interamente da `isLocalStorageMode`: passare da locale a cloud (o viceversa) in produzione richiede attenzione perché gli URL già persistiti nel DB non vengono retroattivamente convertiti.
