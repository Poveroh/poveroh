import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { AppearanceMode, ITransaction } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/use-transaction'
import { TransactionForm } from '../form/transaction-form'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'

export function TransactionDialog() {
    const t = useTranslations()

    const { addTransaction, editTransaction, removeTransaction } = useTransaction()

    const modalManager = useModal<ITransaction>()
    const deleteModalManager = useDeleteModal<ITransaction>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData) => {
        if (modalManager.loading) return // Prevent multiple submissions

        modalManager.setLoading(true)

        try {
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
        } catch (error) {
            console.error('Error submitting transaction form:', error)
            toast.error(t('messages.error'))
        } finally {
            modalManager.setLoading(false)
        }
    }

    const onDelete = async () => {
        if (!deleteModalManager.item || deleteModalManager.loading) return

        deleteModalManager.setLoading(true)

        try {
            const res = await removeTransaction(deleteModalManager.item.id)

            if (res) {
                deleteModalManager.closeModal()

                if (modalManager.item && modalManager.item.id === deleteModalManager.item.id) {
                    modalManager.closeModal()
                }

                toast.success(
                    t('messages.successfully', {
                        a: deleteModalManager.item.title,
                        b: t('messages.deleted')
                    })
                )
            }
        } catch (error) {
            console.error('Error deleting transaction:', error)
            toast.error(t('messages.error'))
        } finally {
            deleteModalManager.setLoading(false)
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
                decoration={
                    modalManager.item?.icon
                        ? {
                              iconLogo: {
                                  name: modalManager.item.icon,
                                  mode: AppearanceMode.ICON,
                                  circled: true
                              }
                          }
                        : undefined
                }
                footer={{
                    show: true
                }}
                onClick={() => {
                    if (formRef.current && !modalManager.loading) {
                        formRef.current.submit()
                    }
                }}
                onDeleteClick={() => {
                    if (modalManager.item && modalManager.inEditingMode && !modalManager.loading) {
                        deleteModalManager.openModal(modalManager.item)
                    }
                }}
            >
                {modalManager.isOpen && (
                    <TransactionForm
                        ref={formRef}
                        initialData={modalManager.item ?? undefined}
                        inputStyle='contained'
                        inEditingMode={modalManager.inEditingMode || false}
                        dataCallback={handleFormSubmit}
                    />
                )}
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
