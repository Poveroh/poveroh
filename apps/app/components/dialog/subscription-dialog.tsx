import { useTranslations } from 'next-intl'
import Modal from '@/components/modal/modal'
import { useEffect, useRef, useState } from 'react'
import { toast } from '@poveroh/ui/components/sonner'
import { useSubscription } from '@/hooks/use-subscriptions'
import { SubscriptionForm } from '../form/subscriptions-form'
import { SubscriptionsSelector } from '../form/subscriptions-selector'
import { Button } from '@poveroh/ui/components/button'
import { DeleteModal } from '../modal/delete-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { useModal } from '@/hooks/use-modal'
import { CreateSubscriptionRequest, SubscriptionData } from '@poveroh/types/contracts'
import { Brand } from '@poveroh/types'

export function SubscriptionDialog() {
    const t = useTranslations()
    const { createSubscription, updateSubscription, deleteSubscription } = useSubscription()

    const modalId = 'subscription'
    const modalManager = useModal<SubscriptionData>(modalId)
    const deleteModalManager = useDeleteModal<SubscriptionData>()

    const [mode, setMode] = useState<string>(modalManager.inEditingMode ? 'editor' : 'template')
    const [fromTemplate, setFromTemplate] = useState<boolean>(modalManager.inEditingMode ? false : true)

    const formRef = useRef<HTMLFormElement | null>(null)

    const [title, setTitle] = useState(
        modalManager.inEditingMode && modalManager.item ? modalManager.item.title : t('subscriptions.modal.newTitle')
    )

    useEffect(() => {
        if (modalManager.inEditingMode && modalManager.item) {
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
        setTitle(t('subscriptions.modal.newTitle'))
    }

    const handleFormSubmit = async (data: Partial<SubscriptionData>) => {
        modalManager.setLoading(true)

        // edit dialog
        if (modalManager.inEditingMode && modalManager.item) {
            const response = await updateSubscription({
                path: { id: modalManager.item.id },
                body: data
            })

            if (!response.success) {
                modalManager.setLoading(false)
                return
            }

            modalManager.closeModal()
        } else {
            // new dialog
            const response = await createSubscription({
                body: {
                    data: data as CreateSubscriptionRequest,
                    file: []
                }
            })

            if (!response?.success || !response.data) {
                modalManager.setLoading(false)
                return
            }

            if (modalManager.keepAdding.checked) {
                formRef.current?.reset()
                clearUp()
            } else {
                modalManager.closeModal()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: data.title!,
                b: t(modalManager.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        modalManager.setLoading(false)
    }

    const onTemplateSelected = (brand: Brand) => {
        // setLocalSubscription({
        //     id: '',
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //     title: brand.name,
        //     description: '',
        //     amount: 0,
        //     currency: 'USD',
        //     appearanceMode: 'LOGO',
        //     appearanceLogoIcon: brand.logo,
        //     firstPayment: new Date().toISOString(),
        //     cycleNumber: 1,
        //     cyclePeriod: 'MONTH',
        //     rememberPeriod: 'SAME_DAY',
        //     financialAccountId: '',
        //     isEnabled: true
        // })
        setTitle(brand.name)
        setFromTemplate(true)
        setMode('editor')
    }

    const onDelete = async () => {
        if (!deleteModalManager.item) return

        deleteModalManager.setLoading(true)
        const res = await deleteSubscription({
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
            <Modal
                modalId={modalId}
                open={modalManager.isOpen}
                title={title}
                decoration={{
                    iconLogo: {
                        name: modalManager.item?.appearanceLogoIcon || '',
                        mode: modalManager.item?.appearanceMode || 'LOGO',
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
                            initialData={modalManager.item ?? null}
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
