import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { toast } from '@poveroh/ui/components/sonner'
import { useTransaction } from '@/hooks/use-transaction'
import { TransactionForm } from '../form/transaction-form'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { DeleteModal } from '../modal/delete-modal'
import { useError } from '@/hooks/use-error'
import {
    CreateTransactionRequest,
    CreateUpdateTransactionRequest,
    TransactionData,
    UpdateTransactionRequest
} from '@poveroh/types'
import { MODAL_IDS } from '@/types/constant'
import { FormRef } from '@/types'

export function TransactionDialog() {
    const t = useTranslations()
    const { createMutation, updateMutation, deleteMutation } = useTransaction()
    const { handleError } = useError()

    const modalManager = useModal<TransactionData>(MODAL_IDS.TRANSACTION)
    const deleteModalManager = useDeleteModal<TransactionData>()

    const formRef = useRef<FormRef | null>(null)

    const onCreate = async (payload: CreateTransactionRequest, files: File[]) => {
        const response = await createMutation.mutateAsync({
            body: {
                data: payload,
                file: files
            }
        })

        if (!response?.success || !response.data) {
            modalManager.setLoading(false)
            return
        }

        if (modalManager.keepAdding.checked) {
            formRef.current?.reset()
        } else {
            modalManager.closeModal()
        }

        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateTransactionRequest, files: File[]) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateMutation.mutateAsync({
            path: { id: modalManager.item.id },
            body: {
                data: payload,
                file: files
            }
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateTransactionRequest, files: File[]) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateTransactionRequest, files)
            } else {
                await onCreate(payload as CreateTransactionRequest, files)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)

        const res = await deleteMutation.mutateAsync({
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
            <Modal<TransactionData>
                modalId={MODAL_IDS.TRANSACTION}
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
                onClick={() => formRef.current?.submit()}
                onDeleteClick={() => {
                    deleteModalManager.openModal(modalManager.item)
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
