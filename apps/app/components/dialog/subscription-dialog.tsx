import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useEffect, useRef, useState } from 'react'
import { AppearanceMode, Currencies, CyclePeriod, IBrand, ISubscription, RememberPeriod } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useSubscription } from '@/hooks/use-subscriptions'
import { SubscriptionForm } from '../form/subscriptions-form'
import { SubscriptionsSelector } from '../form/subscriptions-selector'
import { Button } from '@poveroh/ui/components/button'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useModal } from '@/hooks/use-modal'

export function SubscriptionDialog() {
    const t = useTranslations()
    const { addSubscription, editSubscription, removeSubscription } = useSubscription()

    const modalId = 'subscription'
    const modalManager = useModal<ISubscription>(modalId)
    const deleteModalManager = useDeleteModal<ISubscription>()

    const [mode, setMode] = useState<string>(modalManager.inEditingMode ? 'editor' : 'template')
    const [fromTemplate, setFromTemplate] = useState<boolean>(modalManager.inEditingMode ? false : true)
    const [localSubscription, setLocalSubscription] = useState(modalManager.item)

    const formRef = useRef<HTMLFormElement | null>(null)

    const [title, setTitle] = useState(
        modalManager.inEditingMode && modalManager.item ? modalManager.item.title : t('subscriptions.modal.newTitle')
    )

    useEffect(() => {
        if (modalManager.inEditingMode && modalManager.item) {
            setLocalSubscription(modalManager.item)
            setTitle(modalManager.item.title)
            setMode('editor')
        }
    }, [modalManager.inEditingMode, modalManager.item])

    useEffect(() => {
        if (modalManager.isOpen && !modalManager.inEditingMode) {
            clearUp()
        }
    }, [modalManager.isOpen])

    const clearUp = () => {
        setMode('template')
        setFromTemplate(true)
        setLocalSubscription(undefined)
        setTitle(t('subscriptions.modal.newTitle'))
    }

    const handleFormSubmit = async (data: FormData | Partial<ISubscription>) => {
        if (data instanceof FormData) {
            throw new Error('FormData handling not implemented for subscriptions')
        } else {
            modalManager.setLoading(true)

            let res: ISubscription | null

            // edit dialog
            if (modalManager.inEditingMode && modalManager.item) {
                res = await editSubscription(modalManager.item.id, data)

                if (!res) return

                modalManager.closeModal()
            } else {
                // new dialog
                res = await addSubscription(data)

                if (!res) return

                if (modalManager.keepAdding.checked) {
                    formRef.current?.reset()
                    clearUp()
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
    }

    const onTemplateSelected = (brand: IBrand) => {
        setLocalSubscription({
            id: '',
            userId: '',
            createdAt: new Date().toISOString(),
            title: brand.name,
            description: '',
            amount: 0,
            currency: Currencies.USD,
            appearanceMode: AppearanceMode.LOGO,
            appearanceLogoIcon: brand.logo,
            firstPayment: new Date().toISOString(),
            cycleNumber: '1',
            cyclePeriod: CyclePeriod.MONTH,
            rememberPeriod: RememberPeriod.SAME_DAY,
            financialAccountId: '',
            isEnabled: true
        })
        setTitle(brand.name)
        setFromTemplate(true)
        setMode('editor')
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)
        const res = await removeSubscription(deleteModalManager.item.id)
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
            <Modal
                modalId={modalId}
                open={modalManager.isOpen}
                title={title}
                decoration={{
                    iconLogo: {
                        name: localSubscription?.appearanceLogoIcon || '',
                        mode: localSubscription?.appearanceMode || AppearanceMode.LOGO,
                        circled: true
                    },
                    contentHeight: 'h-[60vh]'
                }}
                footer={{
                    show: true,
                    customFooter:
                        mode === 'template' ? (
                            <Button
                                type='button'
                                onClick={() => {
                                    setFromTemplate(false)
                                    setMode('editor')
                                }}
                                className='w-full'
                            >
                                {t('subscriptions.buttons.addCustom')}
                            </Button>
                        ) : undefined
                }}
                onClick={() => formRef.current?.submit()}
                onDeleteClick={() => {
                    deleteModalManager.openModal(modalManager.item)
                }}
            >
                {mode === 'template' ? (
                    <SubscriptionsSelector dataCallback={onTemplateSelected} closeDialog={modalManager.closeModal} />
                ) : (
                    <div className='flex flex-col space-y-6 w-full'>
                        <SubscriptionForm
                            ref={formRef}
                            fromTemplate={fromTemplate}
                            initialData={localSubscription}
                            inEditingMode={modalManager.inEditingMode}
                            dataCallback={handleFormSubmit}
                        />
                    </div>
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
