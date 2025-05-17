import { AppContextProvider } from '@/context/appContext'
import { ThemeProviders } from '@/providers/themeProvider'
import { Toaster } from '@poveroh/ui/components/sonner'
import { TooltipProvider } from '@poveroh/ui/components/tooltip'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export async function Providers({ children }: { children: React.ReactNode }) {
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <ThemeProviders>
                <AppContextProvider>
                    <TooltipProvider>
                        <Toaster richColors />
                        {children}
                    </TooltipProvider>
                </AppContextProvider>
            </ThemeProviders>
        </NextIntlClientProvider>
    )
}
