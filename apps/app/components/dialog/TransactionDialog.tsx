import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/Modal'
import { useRef, useState } from 'react'
import { AppearanceMode, ITransaction } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/useTransaction'
import { TransactionForm } from '../form/TransactionForm'
import { useModal } from '@/hooks/useModal'
import { useDeleteModal } from '@/hooks/useDeleteModal'
import { DeleteModal } from '../modal/DeleteModal'

export function TransactionDialog() {
    const t = useTranslations()

    const { addTransaction, editTransaction, removeTransaction } = useTransaction()

    const modalManager = useModal<ITransaction>()
    const deleteModalManager = useDeleteModal<ITransaction>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [currentAction, setCurrentAction] = useState<string>('EXPENSES')

    const handleFormSubmit = async (data: FormData) => {
        modalManager.setLoading(true)

        let res: ITransaction | null

        // edit dialog
        if (modalManager.inEditingMode && modalManager.item) {
            res = await editTransaction(modalManager.item.id, data)

            if (!res) {
                modalManager.setLoading(false)
                return
            }

            modalManager.closeModal()
        } else {
            // new dialog
            res = await addTransaction(data)

            if (!res) {
                modalManager.setLoading(false)
                return
            }

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

        const res = await removeTransaction(deleteModalManager.item.id)

        deleteModalManager.setLoading(false)

        if (res) {
            deleteModalManager.closeModal()

            if (modalManager.item && modalManager.item.id === deleteModalManager.item.id) {
                modalManager.closeModal()
            }
        }
    }

    return (
        <>
            <Modal<ITransaction>
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('transactions.modal.newTitle')
                }
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.icon ?? '',
                        mode: AppearanceMode.ICON,
                        circled: true
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
                <TransactionForm
                    ref={formRef}
                    initialData={modalManager.item ?? undefined}
                    action={currentAction}
                    inputStyle='contained'
                    inEditingMode={modalManager.inEditingMode || false}
                    setAction={setCurrentAction}
                    handleSubmit={handleFormSubmit}
                ></TransactionForm>
            </Modal>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('bankAccounts.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
