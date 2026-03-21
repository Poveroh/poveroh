import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/use-transaction'
import { TransactionForm } from '../form/transaction-form'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { TransactionData } from '@poveroh/types'

export function TransactionDialog() {
    const t = useTranslations()

    const { createTransaction, updateTransaction, deleteTransaction } = useTransaction()

    const modalId = 'transaction'
    const modalManager = useModal<TransactionData>(modalId)
    const deleteModalManager = useDeleteModal<TransactionData>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData | Partial<TransactionData>) => {
        if (modalManager.loading) return // Prevent multiple submissions

        modalManager.setLoading(true)

        try {
            let res: TransactionData | null

            // edit dialog
            if (modalManager.inEditingMode && modalManager.item) {
                const body = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data

                const response = await updateTransaction({
                    path: { id: modalManager.item.id },
                    body
                })

                res = (response?.data as TransactionData | undefined) ?? null

                if (!res) {
                    modalManager.setLoading(false)
                    return
                }

                modalManager.closeModal()
            } else {
                // new dialog
                const bodyData = data instanceof FormData ? JSON.parse(String(data.get('data') || '{}')) : data
                const files = data instanceof FormData ? data.getAll('file').filter(item => item instanceof File) : []

                const response = await createTransaction({
                    body: {
                        data: bodyData,
                        file: files as Array<Blob | File>
                    }
                })

                res = (response?.data as TransactionData | undefined) ?? null

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
            const res = await deleteTransaction({
                path: { id: deleteModalManager.item.id }
            })

            if (res?.success) {
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
            <Modal<TransactionData>
                modalId={modalId}
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
                                  mode: 'ICON',
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
                        initialData={modalManager.item ?? null}
                        inputStyle='contained'
                        inEditingMode={modalManager.inEditingMode || false}
                        dataCallback={handleFormSubmit}
                    />
                )}
            </Modal>

            <DeleteModal
                title={deleteModalManager.item ? deleteModalManager.item.title : ''}
                description={t('transactions.modal.deleteDescription')}
                loading={deleteModalManager.loading}
                open={deleteModalManager.isOpen}
                closeDialog={deleteModalManager.closeModal}
                onConfirm={onDelete}
            />
        </>
    )
}
