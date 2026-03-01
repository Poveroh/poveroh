import { AppContextProvider } from '@/context/app-context'
import { DeleteModalContextProvider } from '@/context/delete-modal-context'
import { DrawerContextProvider } from '@/context/drawer-context'
import { ModalContextProvider } from '@/context/modal-context'
import { AuthProvider } from '@/providers/auth-provider'
import { ThemeProviders } from '@/providers/theme-provider'
import { Toaster } from '@poveroh/ui/components/sonner'
import { TooltipProvider } from '@poveroh/ui/components/tooltip'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import ZodLocaleProvider from '@/components/ZodLocaleProvider'
import { SwrProvider } from '@/providers/swr-provider'

export async function Providers({ children }: { children: React.ReactNode }) {
    const messages = await getMessages()

    return (
        <NextIntlClientProvider messages={messages}>
            <ZodLocaleProvider />
            <ThemeProviders>
                <SwrProvider>
                    <AuthProvider>
                        <AppContextProvider>
                            <ModalContextProvider>
                                <DrawerContextProvider>
                                    <DeleteModalContextProvider>
                                        <TooltipProvider>
                                            <Toaster richColors />
                                            {children}
                                        </TooltipProvider>
                                    </DeleteModalContextProvider>
                                </DrawerContextProvider>
                            </ModalContextProvider>
                        </AppContextProvider>
                    </AuthProvider>
                </SwrProvider>
            </ThemeProviders>
        </NextIntlClientProvider>
    )
}
