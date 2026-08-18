---
name: gestione-errori-validazione-risposte-api
description: >
  Descrive la gerarchia di errori HttpError, le risposte standard
  ResponseHelper e la validazione delle richieste con parseRequestBody + Zod
  nel backend Express. Usa questa skill quando devi lanciare un errore
  tipizzato in un service, formattare una risposta API, o validare il
  body/i parametri di un nuovo endpoint.
---

# Gestione errori, validazione e risposte API

## Quando usarla / quando NON usarla
Usarla per: scegliere quale `HttpError` lanciare, capire come un controller deve gestire try/catch, o validare l'input di un endpoint con uno schema Zod.

Non usarla per: la definizione degli schema Zod condivisi lato contratto OpenAPI (vedi `pipeline-contratti-api-openapi-codegen`) o l'architettura generale a livelli (vedi `architettura-api-backend-layered`).

## Come funziona
- **Gerarchia errori** — `apps/api/src/utils/errors.ts`: classe base `HttpError extends Error { statusCode, message, details? }`; sottoclassi `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `ValidationError` (422), `InternalServerError` (500).
- **Risposte standard** — `apps/api/src/utils/response.ts`, classe `ResponseHelper` con metodi statici: `success`, `created`, `noContent`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `serverError`, `custom`, e `handleError(res, error)` — quest'ultimo logga sempre l'errore (`logger.error(error)`), poi: se `error instanceof HttpError` risponde `res.status(error.statusCode).json({ success: false, message, error: details })`, altrimenti ricade su `serverError`.
- **Convenzione nei controller**: ogni metodo è avvolto in un `try { ... } catch (error) { return ResponseHelper.handleError(res, error) }` — non ci sono altre strategie di gestione errori nei controller.
- **Validazione** — `apps/api/src/utils/validation.ts`, funzione `parseRequestBody<TSchema extends z.ZodType>(schema, body): z.infer<TSchema>`: se `isMultipartBody(body)` (oggetto con un campo stringa `data`, tipico degli upload multipart) fa `JSON.parse(body.data)` prima di validare; poi chiama `schema.parse(payload)`. Qualunque fallimento di parsing/validazione viene rilanciato come `new BadRequestError('Invalid request body', error)` — quindi ogni errore di validazione arriva sempre al client come 400, mai come eccezione grezza.
- Gli schema passati a `parseRequestBody` provengono sempre dal package condiviso `@poveroh/schemas` (Zod `^4.3.6`), mai definiti localmente nel controller.

## Input
`req.body` (JSON o multipart con campo `data`), uno schema Zod importato da `@poveroh/schemas`.

## Output
- Payload tipizzato e validato (`z.infer<TSchema>`) per il service, oppure
- Risposta HTTP 400 con messaggio `'Invalid request body'` se la validazione fallisce, oppure
- Risposta HTTP con lo `statusCode` specifico dell'`HttpError` lanciato più in profondità nel service.

## Dipendenze
Zod `^4.3.6`, `@poveroh/schemas` (schema Zod generati/condivisi), nessuna libreria di gestione errori esterna (implementazione custom).

## Esempio d'uso
```ts
async createCategory(req: Request, res: Response) {
    try {
        const payload = parseRequestBody(CreateCategoryRequestSchema, req.body)
        const data = await this.categoryService.createCategory(payload, req.file)
        return ResponseHelper.created(res, data)
    } catch (error) {
        return ResponseHelper.handleError(res, error)
    }
}

// nel service, per un vincolo di business:
if (!category) throw new NotFoundError('Category not found')
```

## Limiti e note
- `parseRequestBody` normalizza sempre gli errori di validazione a `BadRequestError` (400): non distingue "campo mancante" da "formato non valido" a livello di status code — il dettaglio resta nel campo `error`/`details` della risposta.
- Non c'è un middleware centralizzato di error-handling Express (`app.use((err, req, res, next) => ...)`): la gestione è delegata per intero a ogni singolo controller tramite `ResponseHelper.handleError`.
