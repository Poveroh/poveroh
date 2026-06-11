import { useTranslations } from 'next-intl'
import { useRef } from 'react'

import { CreateFinancialAccountBalanceRequest, FinancialAccountBalanceData } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'

import Modal from '@/components/modal/modal'
import { AccountSnapshotForm } from '../form/account-snapshot-form'
import { useAccountBalance } from '@/hooks/use-account-balance'
import { useModal } from '@/hooks/use-modal'
import { useError } from '@/hooks/use-error'
import { MODAL_IDS } from '@/types/constant'

export function AccountSnapshotDialog() {
    const t = useTranslations()
    const { createAccountBalance } = useAccountBalance()
    const { handleError } = useError()

    const modalManager = useModal<FinancialAccountBalanceData>(MODAL_IDS.ACCOUNT_SNAPSHOT)

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (payload: CreateFinancialAccountBalanceRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            const response = await createAccountBalance(payload)

            if (!response) return

            modalManager.closeModal()
            toast.success(t('accounts.snapshot.success'))
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal<FinancialAccountBalanceData>
            modalId={MODAL_IDS.ACCOUNT_SNAPSHOT}
            open={modalManager.isOpen}
            title={t('accounts.snapshot.modal.title')}
            description={t('accounts.snapshot.modal.description')}
            footer={{
                show: true
            }}
            onClick={() => formRef.current?.submit()}
        >
            <div className='flex flex-col space-y-6 w-full'>
                <AccountSnapshotForm
                    ref={formRef}
                    accountId={modalManager.preConfig?.financialAccountId ?? ''}
                    initialData={modalManager.item ?? null}
                    inEditingMode={modalManager.inEditingMode}
                    dataCallback={handleFormSubmit}
                />
            </div>
        </Modal>
    )
}
