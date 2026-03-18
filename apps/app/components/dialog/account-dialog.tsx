import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { FinancialAccountData } from '@poveroh/types/contracts'
import { toast } from '@poveroh/ui/components/sonner'
import { useFinancialAccount } from '@/hooks/use-account'
import { AccountForm } from '../form/account-form'
import { useModal } from '@/hooks/use-modal'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export function AccountDialog() {
    const t = useTranslations()
    const { createFinancialAccount, updateFinancialAccount, deleteFinancialAccount } = useFinancialAccount()

    const modalId = 'account'
    const modalManager = useModal<FinancialAccountData>(modalId)
    const deleteModalManager = useDeleteModal<FinancialAccountData>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData | Partial<FinancialAccountData>) => {
        modalManager.setLoading(true)

        let res: FinancialAccountData | null

        // edit dialog
        if (modalManager.inEditingMode && modalManager.item) {
            const body = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data

            const response = await updateFinancialAccount({
                path: { id: modalManager.item.id },
                body
            })

            res = (response?.data as FinancialAccountData | undefined) ?? null

            if (!res) return

            modalManager.closeModal()
        } else {
            // new dialog
            const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data
            const files = data instanceof FormData ? data.getAll('file').filter(item => item instanceof File) : []

            const response = await createFinancialAccount({
                body: {
                    data: bodyData,
                    file: files as Array<Blob | File>
                }
            })

            res = (response?.data as FinancialAccountData | undefined) ?? null

            if (!res) return

            if (modalManager.keepAdding.checked) {
                formRef.current?.reset()
            } else {
                modalManager.closeModal()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
                b: t(modalManager.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        modalManager.setLoading(false)
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        const res = await deleteFinancialAccount({
            path: { id: deleteModalManager.item.id }
        })

        deleteModalManager.setLoading(false)

        if (res?.success) {
            deleteModalManager.closeModal()

            if (modalManager.item && modalManager.item.id === deleteModalManager.item.id) {
                modalManager.closeModal()
            }
        }
    }

    return (
        <>
            <Modal<FinancialAccountData>
                modalId={modalId}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('accounts.modal.newTitle')
                }
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.logoIcon ?? '',
                        mode: 'LOGO',
                        circled: false
                    }
                }}
                footer={{
                    show: true
                }}
                onClick={() => formRef.current?.submit()}
                onDeleteClick={() => {
                    deleteModalManager.openModal(modalManager.item)
                }}
            >
                <div className='flex flex-col space-y-6 w-full'>
                    <AccountForm
                        ref={formRef}
                        initialData={modalManager.item ?? null}
                        inEditingMode={modalManager.inEditingMode}
                        dataCallback={handleFormSubmit}
                    />
                </div>
            </Modal>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('accounts.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
