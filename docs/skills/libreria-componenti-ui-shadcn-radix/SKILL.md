---
name: libreria-componenti-ui-shadcn-radix
description: >
  Descrive la libreria di componenti UI condivisa (packages/ui), costruita
  su Tailwind CSS, Radix UI e le convenzioni shadcn (cva, cn()), incluso il
  dark mode via next-themes. Usa questa skill quando devi creare/riusare
  un componente UI, capire come importare un primitivo da @poveroh/ui, o
  aggiungere una nuova variante con class-variance-authority.
---

# Libreria componenti UI (shadcn/Radix)

## Quando usarla / quando NON usarla
Usarla per: importare/creare componenti in `packages/ui`, capire lo stile shadcn/Radix del progetto, gestire varianti con `cva`.

Non usarla per: componenti specifici di una feature applicativa che non devono essere riusabili (quelli vivono in `apps/app/components/`, fuori da questo package).

## Come funziona
- Stack: Tailwind CSS `^3.4.14`, primitivi Radix UI (`@radix-ui/react-{dialog,dropdown-menu,select,tabs,tooltip,checkbox,switch,popover,radio-group,navigation-menu,collapsible,label,separator,slot,aspect-ratio,alert-dialog}`), convenzioni shadcn/ui (`components.json`: `style: "new-york"`, `baseColor: "zinc"`, `iconLibrary: "lucide"`), `class-variance-authority` (`cva`) più `cn()` in `packages/ui/src/lib/utils.ts` (`twMerge(clsx(inputs))`), icone via `lucide-react`.
- Struttura: `packages/ui/src/components/` (33 file: `button.tsx`, `dialog.tsx`, `select.tsx`, `sidebar.tsx`, `chart.tsx` [recharts], `form.tsx`, `calendar.tsx` [react-day-picker], `sheet.tsx`, `drawer.tsx` [vaul], `sonner.tsx`, ecc.), `packages/ui/src/hooks/`, `packages/ui/src/lib/`, `packages/ui/src/styles/globals.css`.
- **Nessun barrel `src/index.ts`**: il `package.json` mappa gli export per sotto-percorso (`"./components/*"`, `"./lib/*"`, `"./hooks/*"`, più `"./globals.css"`, `"./tailwind.config"`, `"./postcss.config"`) — si importa sempre il file specifico, es. `@poveroh/ui/components/button`.
- Pattern canonico, `packages/ui/src/components/button.tsx`: mappa di varianti con `cva`, `React.forwardRef`, supporto `asChild` basato su Radix `Slot`.
- **Styling**: fonte di verità in `packages/ui/tailwind.config.ts` (`darkMode: ['class']`, colori tema guidati da CSS variable, plugin `tailwindcss-animate`); sia `apps/app/tailwind.config.ts` sia `apps/app/postcss.config.mjs` si limitano a ri-esportare da `@poveroh/ui/tailwind.config`/`postcss.config`.
- **Dark mode**: gestito da `next-themes` — `apps/app/providers/theme-provider.tsx` wrappa `NextThemesProvider` con `attribute='class'`, `defaultTheme='dark'`, `enableSystem`.

## Input
Import diretto di un componente/hook/util dal sotto-percorso desiderato di `@poveroh/ui`.

## Output
Componenti React stilizzati e accessibili (via Radix), coerenti col tema chiaro/scuro dell'app.

## Dipendenze
Tailwind CSS `^3.4.14`, Radix UI, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^2.5.4`, `tailwindcss-animate ^1.0.7`, `lucide-react`, `next-themes`.

## Esempio d'uso
```tsx
import { Button } from '@poveroh/ui/components/button'
import { cn } from '@poveroh/ui/lib/utils'

<Button variant='outline' className={cn('mt-2', isActive && 'border-primary')}>Salva</Button>
```

## Limiti e note
- Prima di creare un nuovo componente in `apps/app`, la convenzione di progetto richiede di verificare che non esista già un equivalente in `packages/ui`/`apps/app/components` — questo package è la fonte primaria per i primitivi riusabili, i componenti specifici di dominio (item di lista, form per entità, ecc.) restano invece in `apps/app/components/`.
- Assenza totale di Storybook operativo per documentare visivamente questi componenti: `apps/storybook` esiste come cartella ma senza `package.json`/non tracciata da git (vedi nota in `architettura-monorepo-turborepo`).
