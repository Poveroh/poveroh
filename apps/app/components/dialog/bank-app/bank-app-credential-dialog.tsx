import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { useModal } from '@/hooks/use-modal'
import { useError } from '@/hooks/use-error'
import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'
import { useBankSyncConnectLaunch } from '@/hooks/use-bank-sync-connect-launch'
import { FormRef } from '@/types'
import { MODAL_IDS } from '@/types/constant'
import { BankSyncProvider, UpdateBankSyncProviderAppCredentialRequest } from '@poveroh/types'
import { BankAppCredentialForm } from '@/components/form/bank-app-credential-form'
import { BankSyncConnectLauncher } from '@/components/bank-sync/connect-launchers/bank-sync-connect-launcher'

export function BankAppCredentialDialog() {
    const t = useTranslations()
    const { handleError } = useError()
    const { createConnectionMutation } = useBankSyncConnections()
    const { launching, startLaunch, completeLaunch, cancelLaunch } = useBankSyncConnectLaunch()

    const modalManager = useModal<BankSyncProvider>(MODAL_IDS.BANK_APP_CREDENTIALS)

    const formRef = useRef<FormRef | null>(null)

    const handleFormSubmit = async (payload: UpdateBankSyncProviderAppCredentialRequest) => {
        if (modalManager.loading || !modalManager.item) return

        try {
            modalManager.setLoading(true)

            const response = await createConnectionMutation.mutateAsync({
                body: { providerId: modalManager.item.id, appCredentials: payload.credentials }
            })

            if (!response?.data) return

            const { connection, connectUrl } = response.data

            if (connectUrl) {
                startLaunch({
                    connectionId: connection.id,
                    connectUrl,
                    providerId: modalManager.item.id,
                    providerLabel: modalManager.item.label
                })
                modalManager.closeModal()
                return
            }

            toast.success(t('bankSync.toast.connected', { a: modalManager.item.label }))
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <>
            <Modal<BankSyncProvider>
                modalId={MODAL_IDS.BANK_APP_CREDENTIALS}
                open={modalManager.isOpen}
                title={modalManager.item?.label || ''}
                footer={{
                    show: true
                }}
                onClick={() => formRef.current?.submit()}
            >
                <div className='flex flex-col space-y-6 w-full'>
                    {modalManager.isOpen && modalManager.item && (
                        <BankAppCredentialForm
                            ref={formRef}
                            initialData={null}
                            provider={modalManager.item}
                            inEditingMode={false}
                            dataCallback={handleFormSubmit}
                        />
                    )}
                </div>
            </Modal>

            <BankSyncConnectLauncher launching={launching} onSuccess={completeLaunch} onExit={cancelLaunch} />
        </>
    )
}
