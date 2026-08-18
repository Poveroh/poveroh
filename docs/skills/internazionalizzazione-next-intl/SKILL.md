---
name: internazionalizzazione-next-intl
description: >
  Descrive la configurazione i18n con next-intl: come vengono caricati i
  messaggi, la struttura dei file di locale, e come un componente consuma
  le stringhe tradotte. Usa questa skill quando devi aggiungere una nuova
  stringa utente-visibile, un nuovo file di traduzione, o capire perché una
  chiave di traduzione non viene risolta.
---

# Internazionalizzazione con next-intl

## Quando usarla / quando NON usarla
Usarla per: aggiungere/modificare testo visibile all'utente, capire il caricamento dei messaggi lato server.

Non usarla per: la logica di business dietro le pagine (vedi le skill di architettura frontend/dati).

## Come funziona
- Plugin collegato in `next.config.js` tramite `nextIntlPlugin('./i18n/request.ts')`.
- Config `apps/app/i18n/request.ts`:
  ```ts
  export default getRequestConfig(async () => {
      const locale = 'en'
      return { locale, messages: (await import(`./locales/${locale}.json`)).default }
  })
  ```
  **Nota**: la locale risulta al momento hardcoded a `'en'` in questo file — non è stato trovato un meccanismo di rilevamento dinamico della lingua dell'utente in questo punto (da verificare se altrove nell'app, es. nelle preferenze utente, viene fatto uno switch di locale non ancora collegato qui).
- File di locale: `apps/app/i18n/locales/en.json` (chiavi JSON annidate, es. `modal.delete.title`).
- I messaggi vengono caricati lato server in `apps/app/app/providers.tsx` (`await getMessages()`) e passati a `<NextIntlClientProvider messages={messages}>`.
- Consumo, esempio reale (`apps/app/app/(admin)/transactions/view.tsx`): `import { useTranslations } from 'next-intl'` poi `const t = useTranslations()`.

## Input
Una chiave di traduzione annidata (es. `t('modal.delete.title')`).

## Output
La stringa tradotta corrispondente alla locale corrente, con eventuale interpolazione di parametri supportata da next-intl.

## Dipendenze
`next-intl ^4.9.2`.

## Esempio d'uso
```json
// apps/app/i18n/locales/en.json
{ "transactions": { "empty": "No transactions yet" } }
```
```tsx
const t = useTranslations()
<p>{t('transactions.empty')}</p>
```

## Limiti e note
- Ogni stringa visibile all'utente deve passare da next-intl (convenzione di progetto): non hardcodare testo nei componenti.
- Non è stato confermato se esistano più file di locale oltre a `en.json` o un vero meccanismo di selezione lingua utente end-to-end: **da verificare** prima di assumere che il progetto sia multi-lingua operativo end-to-end nonostante l'infrastruttura next-intl sia pronta.
