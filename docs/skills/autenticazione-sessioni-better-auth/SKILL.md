---
name: autenticazione-sessioni-better-auth
description: >
  Descrive come sessione e autenticazione sono implementate con la libreria
  better-auth, sia lato server (apps/api/src/lib/auth.ts, AuthMiddleware) sia
  lato client (apps/app/lib/auth.ts, useAuth), inclusi cookie
  cross-subdomain, token bearer e il componente RouteGuard. Usa questa skill
  quando devi capire come viene autenticata una richiesta, aggiungere un
  hook al ciclo di vita dell'utente, o modificare la protezione delle route
  lato frontend.
---

# Autenticazione e sessioni con better-auth

## Quando usarla / quando NON usarla
Usarla per: capire il meccanismo di sessione/cookie, aggiungere logica al signup (`databaseHooks`), o modificare `RouteGuard`.

Non usarla per: la cifratura delle credenziali di provider esterni (vedi `cifratura-e-gestione-segreti`) o la propagazione del contesto utente dentro i service (vedi `architettura-api-backend-layered`).

## Come funziona
### Backend
- `apps/api/src/lib/auth.ts` configura `betterAuth` (`better-auth ^1.6.11`):
  - `basePath: '/v1/auth'`, `database: prismaAdapter(prisma, { provider: 'postgresql' })`.
  - Plugin: `openAPI()` (genera lo spec di better-auth, vedi `pipeline-contratti-api-openapi-codegen`), `bearer()`, `customSession(...)` che arricchisce la sessione richiamando `UserService().getUser(user.id)`.
  - `emailAndPassword: { enabled: true, requireEmailVerification: false, autoSignIn: true, minPasswordLength: 6, maxPasswordLength: 128 }`.
  - `session: { expiresIn: 86400, updateAge: 86400, cookieCache, cookieAttributes: { secure: isProduction, sameSite, httpOnly: true, domain: sharedDomain } }` — il domain condiviso permette i cookie cross-subdomain (derivato da `ALLOWED_ORIGINS`/`APP_URL`).
  - `advanced.database.generateId: () => crypto.randomUUID()`, `advanced.cookiePrefix: 'poveroh_auth_'`.
  - `databaseHooks.user.create.before` divide il campo `name` in `name`/`surname`; `databaseHooks.user.create.after` inizializza le preferenze di default (`UserPreferencesService.getPreferences`) e il layout dashboard di default (`DashboardService.saveDashboardLayout`) — questi hook girano fuori dal contesto HTTP, quindi aprono manualmente `contextService.runWithContext(...)`.
- `AuthMiddleware.isAuthenticated` (`apps/api/src/middleware/auth.middleware.ts`) chiama `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })`; se la sessione è valida imposta `req.user` e apre il contesto richiesta (`contextService.runWithContext({ user: session.user }, () => next())`); altrimenti risponde `ResponseHelper.unauthorized`/`forbidden`. Il tipo `Express.Request.user` è tipizzato in modo lasco come `JwtPayload | any` in `apps/api/src/types/express/index.d.ts` — da verificare/irrigidire.
### Frontend
- `apps/app/lib/auth.ts`: `authClient = createAuthClient({ baseURL: appConfig.apiUrl + '/v1/auth', fetchOptions: { credentials: 'include', auth: { type: 'Bearer', token: () => authToken.get() } } })` (better-auth client `^1.4.0`).
- `apps/app/hooks/use-auth.ts` wrappa `authClient.signIn.email` / `signUp.email` / `signOut` e `authClient.useSession()`.
- Storage doppio: un bearer token catturato dall'header di risposta `set-auth-token` viene persistito via `apps/app/lib/auth-token.ts` (`authToken.get()/set()/clear()`); lo stato di sessione/profilo viene invece cacheato in `localStorage` tramite `apps/app/lib/storage.ts` (con `js-cookie` per gli helper sui cookie) e sincronizzato nello store Zustand `useUserStore`.
- **Non esiste un `middleware.ts` Next.js**: la protezione delle route è client-side, tramite il componente `RouteGuard` (`apps/app/components/other/route-guard.tsx`), che legge `useUserStore()` + `useOnBoardingStepOrder()` e reindirizza con `useRouter().push(redirectTo)` dentro un `useEffect`, mostrando `children` solo se le condizioni sono soddisfatte (usato sia per proteggere le pagine autenticate sia, al contrario, per impedire l'accesso alle pagine di login/signup a chi è già loggato).
- Per l'uso del client API generato con/senza autenticazione (cookie automatici vs `withoutAuth()`), vedi anche `docs/API_AUTH.md` nel repository e la skill `client-api-generato-e-tanstack-query`.

## Input
Credenziali email/password (signup/login), cookie di sessione o header `Authorization: Bearer <token>` sulle richieste successive.

## Output
Sessione better-auth (cookie `poveroh_auth_*` + eventuale bearer token), `req.user` popolato lato backend, `useUserStore` popolato lato frontend.

## Dipendenze
`better-auth` (server `^1.6.11`, client `^1.4.0`), Prisma (adapter sessione/utente), Zustand (`useUserStore`), `js-cookie`.

## Esempio d'uso
```ts
// backend: proteggere un endpoint
router.get('/me', AuthMiddleware.isAuthenticated, userController.getMe.bind(userController))

// frontend: login
const { signIn } = useAuth()
await signIn.email({ email, password })
```

## Limiti e note
- `Express.Request.user` è tipizzato come `JwtPayload | any`: un caso di tipizzazione lasca da verificare/irrigidire, in tensione con la regola generale del progetto di non usare `as any`.
- Non c'è validazione runtime delle variabili d'ambiente collegate all'auth (`JWT_KEY`, `ALLOWED_ORIGINS`, ecc.) — vedi la nota trasversale sulla gestione configurazione in `architettura-api-backend-layered`.
- Il reset password "vero" non è stato trovato nel frontend: `/change-password` è solo una pagina informativa statica; il cambio password autenticato avviene altrove, in `/settings/security`.
