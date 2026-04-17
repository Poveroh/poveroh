'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { AccountBalanceSnapshotForm } from '@/components/form/account-balance-snapshot-form'
import { useSnapshot } from '@/hooks/use-snapshot'
import { useModal } from '@/hooks/use-modal'
import { useError } from '@/hooks/use-error'
import { CreateSnapshotAccountBalanceRequest, SnapshotAccountBalance } from '@poveroh/types'
import { FormRef } from '@/types'

export function AccountBalanceSnapshotDialog() {
    const t = useTranslations()
    const { createSnapshotAccountBalance } = useSnapshot()
    const { handleError } = useError()

    const modalId = 'account-snapshot'
    const modalManager = useModal<SnapshotAccountBalance>(modalId)

    const formRef = useRef<FormRef | null>(null)

    const handleSubmit = async (payload: CreateSnapshotAccountBalanceRequest) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            const res = await createSnapshotAccountBalance(payload)

            if (!res) return

            formRef.current?.reset()

            toast.success(t('accounts.snapshot.success'))

            modalManager.closeModal()
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    return (
        <Modal
            modalId={modalId}
            open={modalManager.isOpen}
            title={t('accounts.snapshot.modal.title')}
            description={t('accounts.snapshot.modal.description')}
            footer={{
                show: true
            }}
            onClick={() => formRef.current?.submit()}
        >
            <div className='flex flex-col space-y-6 w-full'>
                <AccountBalanceSnapshotForm
                    ref={formRef}
                    initialData={modalManager.item ?? null}
                    initialAccountId={modalManager.preConfig?.accountId}
                    dataCallback={handleSubmit}
                />
            </div>
        </Modal>
    )
}
