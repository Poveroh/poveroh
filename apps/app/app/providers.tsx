import { AppContextProvider } from '@/context/AppContext'
import { DeleteModalContextProvider } from '@/context/DeleteModalContext'
import { ModalContextProvider } from '@/context/ModalContext'
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
                    <ModalContextProvider>
                        <DeleteModalContextProvider>
                            <TooltipProvider>
                                <Toaster richColors />
                                {children}
                            </TooltipProvider>
                        </DeleteModalContextProvider>
                    </ModalContextProvider>
                </AppContextProvider>
            </ThemeProviders>
        </NextIntlClientProvider>
    )
}
