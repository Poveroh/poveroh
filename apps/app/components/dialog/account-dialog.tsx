import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useRef } from 'react'
import { AppearanceMode, IFinancialAccount } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useAccount } from '@/hooks/use-account'
import { AccountForm } from '../form/account-form'
import { useModal } from '@/hooks/use-modal'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export function AccountDialog() {
    const t = useTranslations()
    const { addAccount, editAccount, removeAccount } = useAccount()

    const modalManager = useModal<IFinancialAccount>()
    const deleteModalManager = useDeleteModal<IFinancialAccount>()

    const formRef = useRef<HTMLFormElement | null>(null)

    const handleFormSubmit = async (data: FormData) => {
        modalManager.setLoading(true)

        let res: IFinancialAccount | null

        // edit dialog
        if (modalManager.inEditingMode && modalManager.item) {
            res = await editAccount(modalManager.item.id, data)

            if (!res) return

            modalManager.closeModal()
        } else {
            // new dialog
            res = await addAccount(data)

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

        const res = await removeAccount(deleteModalManager.item.id)

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
            <Modal<IFinancialAccount>
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('accounts.modal.newTitle')
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
                    <AccountForm
                        ref={formRef}
                        initialData={modalManager.item}
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
