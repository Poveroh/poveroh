'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'

import type { BankSyncConnectionData, LinkBankSyncAccountForm } from '@poveroh/types'

import Modal from '@/components/modal/modal'
import { BankAppMappingForm } from '@/components/form/bank-app-mapping-form'
import { useModal } from '@/hooks/use-modal'
import { useError } from '@/hooks/use-error'
import { useBankSyncConnections } from '@/hooks/use-bank-sync-connections'
import { FormRef } from '@/types'
import { MODAL_IDS } from '@/types/constant'

export function BankAccountMappingDialog() {
    const t = useTranslations()
    const { handleError } = useError()
    const { linkAccountsMutation } = useBankSyncConnections()

    const modalManager = useModal<BankSyncConnectionData>(MODAL_IDS.BANK_APP_ACCOUNT_MAPPING)

    const formRef = useRef<FormRef | null>(null)

    const handleFormSubmit = async (payload: LinkBankSyncAccountForm) => {
        if (modalManager.loading || !modalManager.item) return

        try {
            modalManager.setLoading(true)

            const response = await linkAccountsMutation.mutateAsync({
                path: { connectionId: modalManager.item.id },
                body: { mappings: payload.mappings }
            })

            if (!response?.data) return

            modalManager.closeModal()
            toast.success(t('bankSync.toast.accountsLinked'))
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<string>
            modalId={MODAL_IDS.BANK_APP_ACCOUNT_MAPPING}
            open={modalManager.isOpen}
            title={modalManager.item?.institutionName ?? ''}
            description={t('bankSync.mapping.subtitle')}
            footer={{
                show: true
            }}
            onClick={() => formRef.current?.submit()}
            decoration={{
                dialogWidth: 'sm:w-[720px]',
                iconLogo: { name: '', mode: 'ICON' }
            }}
        >
            <div className='flex flex-col space-y-6 w-full'>
                {modalManager.isOpen && modalManager.item && (
                    <BankAppMappingForm
                        ref={formRef}
                        connectionId={modalManager.item.id}
                        dataCallback={handleFormSubmit}
                    />
                )}
            </div>
        </Modal>
    )
}
