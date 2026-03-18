'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from '@poveroh/ui/components/sonner'
import Modal from '@/components/modal/modal'
import { AccountBalanceSnapshotForm } from '@/components/form/account-balance-snapshot-form'
import { useSnapshot } from '@/hooks/use-snapshot'
import { useModal } from '@/hooks/use-modal'
import { SnapshotAccountBalance } from '@poveroh/types/contracts'
import { CreateSnapshotAccountBalanceRequest } from '@/lib/api-client'

export function AccountBalanceSnapshotDialog() {
    const t = useTranslations()
    const { createSnapshotAccountBalance } = useSnapshot()

    const modalId = 'account-snapshot'
    const modalManager = useModal<SnapshotAccountBalance>(modalId)

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            formRef.current?.reset()
            modalManager.closeModal()
        }
    }

    const handleSubmit = async (data: FormData | Partial<SnapshotAccountBalance>) => {
        modalManager.setLoading(true)

        const res = await createSnapshotAccountBalance(data as Partial<CreateSnapshotAccountBalanceRequest>)

        if (!res) return

        formRef.current?.reset()

        toast.success(t('accounts.snapshot.success'))

        modalManager.setLoading(false)
        modalManager.closeModal()
    }

    return (
        <Modal
            modalId={modalId}
            open={modalManager.isOpen}
            onOpenChange={handleOpenChange}
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
                    inEditingMode={modalManager.inEditingMode}
                    dataCallback={handleSubmit}
                />
            </div>
        </Modal>
    )
}
