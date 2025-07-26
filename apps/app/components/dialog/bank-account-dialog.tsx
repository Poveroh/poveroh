import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { AppearanceMode, IBankAccount } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useBankAccount } from '@/hooks/use-bank-account'
import { BankAccountForm } from '../form/bank-account-form'
import { useModal } from '@/hooks/use-modal'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export function BankAccountDialog() {
    const t = useTranslations()
    const { addBankAccount, editBankAccount, removeBankAccount } = useBankAccount()

    const modalManager = useModal<IBankAccount>()
    const deleteModalManager = useDeleteModal<IBankAccount>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData) => {
        modalManager.setLoading(true)

        let res: IBankAccount | null

        // edit dialog
        if (modalManager.inEditingMode && modalManager.item) {
            res = await editBankAccount(modalManager.item.id, data)

            if (!res) return

            modalManager.closeModal()
        } else {
            // new dialog
            res = await addBankAccount(data)

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

        const res = await removeBankAccount(deleteModalManager.item.id)

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
            <Modal<IBankAccount>
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('bankAccounts.modal.newTitle')
                }
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.logoIcon ?? '',
                        mode: AppearanceMode.LOGO,
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
                    <BankAccountForm
                        ref={formRef}
                        initialData={modalManager.item}
                        inEditingMode={modalManager.inEditingMode}
                        dataCallback={handleFormSubmit}
                        closeDialog={modalManager.closeModal}
                    />
                </div>
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
