import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { useRef, useState } from 'react'
import { ISubscription } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { SubscriptionForm } from '../form/SubscriptionsForm'

type DialogProps = {
    open: boolean
    initialData?: ISubscription | null
    inEditingMode: boolean
    dialogHeight?: string
    closeDialog: () => void
}

export function SubscriptionDialog(props: DialogProps) {
    const t = useTranslations()
    const { addSubscription, editSubscription } = useSubscriptions()

    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const title =
        props.inEditingMode && props.initialData
            ? t('subscriptions.modal.editTitle', { a: props.initialData?.title })
            : t('subscriptions.modal.newTitle')

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ISubscription | null

        // edit dialog
        if (props.inEditingMode) {
            res = await editSubscription(data)

            if (!res) return

            props.closeDialog()
        } else {
            // new dialog
            res = await addSubscription(data)

            if (!res) return

            if (keepAdding) {
                formRef.current?.reset()
            } else {
                props.closeDialog()
            }
        }

        toast.success(
            t('messages.successfully', {
                a: res.title,
                b: t(props.inEditingMode ? 'messages.saved' : 'messages.uploaded')
            })
        )

        setLoading(false)
    }

    return (
        <Modal
            open={props.open}
            title={title}
            icon={props.initialData?.logo}
            iconMode='icon'
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={props.inEditingMode}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            dialogHeight={props.dialogHeight}
            onClick={() => formRef.current?.submit()}
        >
            <div className='flex flex-col space-y-6 w-full'>
                <SubscriptionForm
                    ref={formRef}
                    initialData={props.initialData}
                    inEditingMode={props.inEditingMode}
                    dataCallback={handleFormSubmit}
                    closeDialog={props.closeDialog}
                />
            </div>
        </Modal>
    )
}
