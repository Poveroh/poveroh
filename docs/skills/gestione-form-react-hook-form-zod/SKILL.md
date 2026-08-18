---
name: gestione-form-react-hook-form-zod
description: >
  Descrive il pattern di gestione dei form: un hook dedicato per entità in
  apps/app/hooks/form/use-*-form.ts che avvolge React Hook Form con
  zodResolver sugli schema Zod condivisi da @poveroh/schemas. Usa questa
  skill quando devi creare un nuovo form, capire come collegare la
  validazione allo schema di contratto, o dove va salvata la logica di
  submit.
---

# Gestione dei form: React Hook Form + Zod

## Quando usarla / quando NON usarla
Usarla per: creare un nuovo hook `use-*-form.ts`, capire il collegamento tra form e schema Zod condiviso.

Non usarla per: la definizione dello schema Zod stesso a livello di contratto API (vedi `pipeline-contratti-api-openapi-codegen`) o la mutation che il form invoca al submit (vedi `client-api-generato-e-tanstack-query`).

## Come funziona
- Esempio reale (`apps/app/hooks/form/use-account-form.ts`):
  ```ts
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { FinancialAccountFormSchema } from '@poveroh/schemas'

  const form = useForm<FinancialAccountForm>({ resolver: zodResolver(FinancialAccountFormSchema), defaultValues })
  ```
- Gli schema di validazione vivono sempre nel package condiviso `@poveroh/schemas` (mai definiti localmente nel componente/hook) — lo stesso schema Zod è spesso derivato/collegato a quello usato per la validazione lato backend (vedi `pipeline-contratti-api-openapi-codegen`).
- Il pattern si ripete identico in ~20 hook (`use-category-form.ts`, `use-subcategory-form.ts`, `use-transaction-form.ts` — con varianti `income`/`expenses`/`transfer`/`import`, `use-subscriptions-form.ts`, `use-sign-in-form.ts`, `use-sign-up-form.ts`, `use-onboarding-form.ts`, `use-bank-app-credential-form.ts`, `use-bank-account-mapping-form.ts`, ecc.).
- **Convenzione**: l'hook di form resta "sottile" — si occupa solo di `useForm`+validazione+stato locale del form; il salvataggio effettivo viene delegato alla mutation del hook dati dell'entità corrispondente (es. `useAccount().createMutation`), non replicato dentro l'hook di form stesso.
- Componente UI: `packages/ui/src/components/form.tsx` fornisce i primitivi shadcn (`FormField`, `FormItem`, ecc.) che si aspettano il context di React Hook Form.

## Input
Uno schema Zod di form (`@poveroh/schemas`) e, opzionalmente, valori di default (per la modalità "edit").

## Output
Un oggetto `form` (istanza React Hook Form) con validazione automatica basata sullo schema, pronto per essere collegato a un `<Form>`/`<FormField>` di `packages/ui` e a un handler di submit che richiama la mutation appropriata.

## Dipendenze
`react-hook-form ^7.54.2`, `@hookform/resolvers ^5.0.0`, `zod ^4.3.6`, `@poveroh/schemas`.

## Esempio d'uso
```ts
// hooks/form/use-x-form.ts
export const useXForm = (defaultValues?: XForm) => {
    const form = useForm<XForm>({ resolver: zodResolver(XFormSchema), defaultValues })
    return form
}

// componente
const form = useXForm(existingX)
const { createMutation } = useX()
const onSubmit = form.handleSubmit(values => createMutation.mutate({ body: values }))
```

## Limiti e note
- Poiché la validazione dipende interamente dallo schema Zod condiviso, un cambiamento allo schema di contratto (backend) può rompere silenziosamente un form finché non si rigenera/ricontrolla `@poveroh/schemas` — non c'è un test automatico che lo verifichi (nessun framework di test configurato nel repository).
