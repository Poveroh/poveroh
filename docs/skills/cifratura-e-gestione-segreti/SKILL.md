---
name: cifratura-e-gestione-segreti
description: >
  Descrive le utility di cifratura del backend (apps/api/src/utils/crypto.ts):
  AES-256-GCM, envelope encryption per le chiavi utente, e cifratura con
  application-secret a domini separati per le credenziali dei provider
  esterni. Usa questa skill quando devi salvare in modo sicuro una
  credenziale/API key di un provider esterno, o capire come vengono
  protetti i segreti nel database.
---

# Cifratura e gestione dei segreti

## Quando usarla / quando NON usarla
Usarla per: cifrare/decifrare credenziali di provider esterni (market-data, bank-sync) o comprendere l'envelope encryption delle chiavi utente.

Non usarla per: l'autenticazione/sessione dell'utente stesso (vedi `autenticazione-sessioni-better-auth`, che usa cookie/token, non questa cifratura).

## Come funziona
- `apps/api/src/utils/crypto.ts` usa esclusivamente il modulo built-in `node:crypto` (nessuna libreria esterna di cifratura).
- **Derivazione chiave**: `deriveKey(secret, salt)` via `scryptSync(secret, salt, KEY_BYTES, SCRYPT_PARAMS)`; `deriveApplicationKey(secret, domain)` via `createHash('sha256').update('poveroh:' + domain + ':' + secret).digest()` — il `domain` separa criptograficamente gli usi (es. credenziali market-data vs bank-sync) anche condividendo lo stesso secret applicativo.
- **Cifrario**: AES-256-GCM (`createCipheriv('aes-256-gcm', key, iv)` / `createDecipheriv`), implementato in `encryptWithKey`/`decryptWithKey`.
- **Funzioni pubbliche principali**:
  - `generateAndWrapUserEncryptionKey(secret): { uek, envelope }` — genera una UEK (User Encryption Key) casuale e la avvolge con una KEK derivata dalla password dell'utente.
  - `unwrapUserEncryptionKey(secret, envelope): Buffer` — l'inverso.
  - `rewrapUserEncryptionKey(uek, newSecret): EncryptionEnvelope` — usato per la rotazione password.
  - `encryptPayload`/`decryptPayload` — basati sulla UEK, per credenziali di proprietà dell'utente.
  - `encryptPayloadWithApplicationSecret`/`decryptPayloadWithApplicationSecret(secret, record, domain = CREDENTIAL_DOMAIN_MARKET_DATA)` — basati sul secret applicativo, con domini come `CREDENTIAL_DOMAIN_MARKET_DATA` e `CREDENTIAL_DOMAIN_BANK_SYNC`.
  - `safeEquals` — confronto a tempo costante (timing-safe) di buffer.
  - `toPrismaBytes` — conversione verso il tipo `Bytes` di Prisma.
- **Consumatori**: `MarketDataCredentialService`, `BankSyncAppCredentialService`, `BankConnectionService` (`bank-connection.service.ts:264-305`) — ognuno usa un tag di versione dell'algoritmo (es. `BANK_SYNC_CREDENTIAL_ALGO_V1`, `CREDENTIAL_PAYLOAD_ALGO_V1`); i record con algoritmo legacy vengono rifiutati, obbligando l'utente a riconnettere/ri-salvare la credenziale.
- **Storage**: i campi cifrati sono colonne Prisma `Bytes` (`ciphertext`/`iv`/`authTag`/`algo`) sui modelli `MarketDataProviderCredential`, `BankSyncProviderCredential`, `BankConnection`.

## Input
Un secret applicativo (`config.JWT_KEY`/equivalente) o la password dell'utente, più il payload in chiaro da proteggere (es. API key di un provider).

## Output
Un record cifrato `{ ciphertext, iv, authTag, algo }` pronto per essere persistito come `Bytes` su Prisma; in lettura, il payload originale decifrato (o un errore se l'`algo` non è supportato).

## Dipendenze
`node:crypto` (nativo, nessuna dipendenza esterna), colonne `Bytes` su Prisma.

## Esempio d'uso
```ts
const record = encryptPayloadWithApplicationSecret(config.JWT_KEY, { apiKey: 'xxx' }, CREDENTIAL_DOMAIN_MARKET_DATA)
await prisma.marketDataProviderCredential.create({ data: { ...toPrismaBytes(record), userId } })

// in lettura
const { apiKey } = decryptPayloadWithApplicationSecret(config.JWT_KEY, record, CREDENTIAL_DOMAIN_MARKET_DATA)
```

## Limiti e note
- Esiste anche uno schema Zod condiviso `EncryptedPayloadSchema` (`packages/openapi/schemas/base.schema.ts`, introdotto nel commit `1c13bdf8`) che **non è ancora referenziato da nessun path/schema** — sembra codice preparatorio non collegato: l'implementazione realmente in uso è quella descritta qui, non quello schema.
- Un cambio di `algo`/versione dell'algoritmo invalida i record esistenti cifrati con la versione precedente: non esiste una migrazione automatica, solo il rifiuto esplicito e la richiesta di ri-salvare la credenziale.
