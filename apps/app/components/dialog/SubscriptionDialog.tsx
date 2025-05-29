import { useTranslations } from 'next-intl'
import { Modal } from '../modal/form'
import { useRef, useState } from 'react'
import { Currencies, CyclePeriod, IBrand, ISubscription, RememberPeriodType } from '@poveroh/types'
import { toast } from '@poveroh/ui/components/sonner'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { SubscriptionForm } from '../form/SubscriptionsForm'
import { SubscriptionsSelector } from '../form/SubscriptionsSelector'
import { Button } from '@poveroh/ui/components/button'
import { DialogFooter } from '@poveroh/ui/components/dialog'

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

    const [fromTemplate, setFromTemplate] = useState(true)
    const [mode, setMode] = useState<'template' | 'editor'>(props.inEditingMode ? 'editor' : 'template')
    const [localSubscription, setLocalSubscription] = useState(props.initialData)
    const formRef = useRef<HTMLFormElement | null>(null)

    const [loading, setLoading] = useState(false)
    const [keepAdding, setKeepAdding] = useState(false)
    const [title, setTitle] = useState(
        props.inEditingMode && props.initialData
            ? t('subscriptions.modal.editTitle', { a: props.initialData?.title })
            : t('subscriptions.modal.newTitle')
    )

    const handleFormSubmit = async (data: FormData) => {
        setLoading(true)

        let res: ISubscription | null

        // edit dialog
        if (props.inEditingMode && props.initialData) {
            res = await editSubscription(props.initialData.id, data)

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

    const onTemplateSelected = (brand: IBrand) => {
        setLocalSubscription({
            id: '',
            user_id: '',
            created_at: new Date().toISOString(),
            title: brand.name,
            description: '',
            amount: 0,
            currency: 'USD' as Currencies,
            logo: brand.logo,
            icon: undefined,
            first_payment: new Date().toISOString(),
            cycle_number: '1',
            cycle_period: 'MONTH' as CyclePeriod,
            remember_period: 'DAY' as RememberPeriodType,
            bank_account_id: '',
            is_enabled: true
        })
        setFromTemplate(true)
        setTitle(brand.name)
        setMode('editor')
    }

    return (
        <Modal
            open={props.open}
            title={title}
            icon={localSubscription?.logo}
            iconMode='img'
            iconCircled={true}
            handleOpenChange={props.closeDialog}
            loading={loading}
            inEditingMode={props.inEditingMode}
            keepAdding={keepAdding}
            setKeepAdding={() => setKeepAdding(x => !x)}
            dialogHeight={props.dialogHeight}
            showFooter={mode == 'editor'}
            contentHeight='h-[60vh]'
            customFooter={
                mode === 'template' ? (
                    <DialogFooter>
                        <Button type='button' onClick={() => setMode('editor')} className='w-full'>
                            {t('subscriptions.buttons.addCustom')}
                        </Button>
                    </DialogFooter>
                ) : undefined
            }
            onClick={() => formRef.current?.submit()}
        >
            {mode == 'template' ? (
                <SubscriptionsSelector dataCallback={onTemplateSelected} closeDialog={props.closeDialog} />
            ) : (
                <div className='flex flex-col space-y-6 w-full'>
                    <SubscriptionForm
                        ref={formRef}
                        fromTemplate={fromTemplate}
                        initialData={localSubscription}
                        inEditingMode={props.inEditingMode}
                        dataCallback={handleFormSubmit}
                        closeDialog={props.closeDialog}
                    />
                </div>
            )}
        </Modal>
    )
}
