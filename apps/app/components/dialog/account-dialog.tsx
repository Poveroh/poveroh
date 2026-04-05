import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import {
    CreateFinancialAccountRequest,
    UpdateFinancialAccountRequest,
    FinancialAccountData,
    CreateUpdateFinancialAccountRequest
} from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useFinancialAccount } from '@/hooks/use-account'
import { AccountForm } from '../form/account-form'
import { useModal } from '@/hooks/use-modal'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useError } from '@/hooks/use-error'
import { MODAL_IDS } from '@/types/constant'

export function AccountDialog() {
    const t = useTranslations()
    const { createMutation, updateMutation, deleteMutation } = useFinancialAccount()
    const { handleError } = useError()

    const modalManager = useModal<FinancialAccountData>(MODAL_IDS.ACCOUNT)
    const deleteModalManager = useDeleteModal<FinancialAccountData>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const onCreate = async (payload: CreateFinancialAccountRequest, files: File[]) => {
        const response = await createMutation.mutateAsync({
            body: {
                data: payload as CreateFinancialAccountRequest,
                file: files as Array<Blob | File>
            }
        })

        if (!response?.success) {
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

    const onUpdate = async (payload: UpdateFinancialAccountRequest, files: File[]) => {
        if (!modalManager.item) {
            throw new Error('No item to update')
        }

        const response = await updateMutation.mutateAsync({
            body: {
                data: payload as CreateFinancialAccountRequest,
                file: files as Array<Blob | File>
            }
        })

        if (!response?.success) {
            return
        }

        modalManager.closeModal()
        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.saved') }))
    }

    const handleFormSubmit = async (payload: CreateUpdateFinancialAccountRequest, files: File[]) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateFinancialAccountRequest, files)
            } else {
                await onCreate(payload as CreateFinancialAccountRequest, files)
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

        if (res.success) {
            deleteModalManager.closeModal()

            if (modalManager.item && modalManager.item.id === deleteModalManager.item.id) {
                modalManager.closeModal()
            }
        }
    }

    return (
        <>
            <Modal<FinancialAccountData>
                modalId={MODAL_IDS.ACCOUNT}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('accounts.modal.newTitle')
                }
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
