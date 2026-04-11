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
import { useError } from '@/hooks/use-error'
import {
    CreateSubscriptionRequest,
    UpdateSubscriptionRequest,
    CreateUpdateSubscriptionRequest,
    SubscriptionData,
    Brand,
    DEFAULT_SUBSCRIPTION
} from '@poveroh/types'
import { MODAL_IDS } from '@/types/constant'

export function SubscriptionDialog() {
    const t = useTranslations()
    const { createMutation, updateMutation, deleteMutation } = useSubscription()
    const { handleError } = useError()

    const modalManager = useModal<SubscriptionData>(MODAL_IDS.SUBSCRIPTION)
    const deleteModalManager = useDeleteModal<SubscriptionData>()

    const [mode, setMode] = useState<string>(modalManager.inEditingMode ? 'editor' : 'template')
    const [selectedSubscriptionTemplate, setSelectedSubscriptionTemplate] = useState<SubscriptionData | null>(null)

    const formRef = useRef<HTMLFormElement | null>(null)

    useEffect(() => {
        if (modalManager.inEditingMode && modalManager.item) {
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
    }

    const onCreate = async (payload: CreateSubscriptionRequest, files: File[]) => {
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
            clearUp()
        } else {
            modalManager.closeModal()
        }

        toast.success(t('messages.successfully', { a: payload.title ?? '', b: t('messages.uploaded') }))
    }

    const onUpdate = async (payload: UpdateSubscriptionRequest, files: File[]) => {
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

    const handleFormSubmit = async (payload: CreateUpdateSubscriptionRequest, files: File[]) => {
        if (modalManager.loading) return

        try {
            modalManager.setLoading(true)

            if (modalManager.inEditingMode) {
                await onUpdate(payload as UpdateSubscriptionRequest, files)
            } else {
                await onCreate(payload as CreateSubscriptionRequest, files)
            }
        } catch (error) {
            handleError(error)
        } finally {
            modalManager.setLoading(false)
        }
    }

    const onTemplateSelected = (brand: Brand) => {
        setSelectedSubscriptionTemplate({
            ...DEFAULT_SUBSCRIPTION,
            title: brand.name,
            appearanceMode: 'LOGO',
            appearanceLogoIcon: brand.logo,
            appearanceIconColor: brand.color,
            id: '',
            createdAt: '',
            updatedAt: ''
        })
        setMode('editor')
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
            <Modal<SubscriptionData>
                modalId={MODAL_IDS.SUBSCRIPTION}
                open={modalManager.isOpen}
                title={
                    modalManager.inEditingMode && modalManager.item
                        ? modalManager.item.title
                        : t('categories.modal.newTitle')
                }
                footer={{
                    show: true,
                    customFooter:
                        mode === 'template' ? (
                            <Button
                                type='button'
                                onClick={() => {
                                    setMode('editor')
                                }}
                                className='w-full'
                            >
                                {t('subscriptions.buttons.addCustom')}
                            </Button>
                        ) : undefined
                }}
                onClick={() => formRef.current?.submit()}
                onOpenChange={x => {
                    console.log(x)
                }}
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
                            initialData={modalManager.item || selectedSubscriptionTemplate || null}
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
