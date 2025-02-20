import { ThemeProviders } from '@/providers/themeProvider'
import { Toaster } from '@poveroh/ui/components/sonner'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export async function Providers({ children }: { children: React.ReactNode }) {
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <ThemeProviders>
                <Toaster richColors />
                {children}
            </ThemeProviders>
        </NextIntlClientProvider>
    )
}
