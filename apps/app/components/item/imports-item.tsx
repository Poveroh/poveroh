import { OptionsPopover } from '../navbar/options-popover'
import { useTranslations } from 'next-intl'
import { cn } from '@poveroh/ui/lib/utils'
import { Badge } from '@poveroh/ui/components/badge'
import { ImportData } from '@poveroh/types'
import { useFinancialAccount } from '@/hooks/use-account'

type ImportsItemProps = {
    imports: ImportData
    openDelete: (item: ImportData) => void
    openEdit: (item: ImportData) => void
    onRollback: (item: ImportData) => void
}

export function ImportsItem({ imports, openDelete, openEdit, onRollback }: ImportsItemProps) {
    const t = useTranslations()
    const { accountQuery } = useFinancialAccount()

    const isCompleted = imports.status === 'COMPLETED'
    const isProcessing = imports.status === 'PROCESSING'
    const isFailed = imports.status === 'FAILED'
    const canOpen = !isCompleted && !isProcessing

    const account = accountQuery.data?.data.find(acc => acc.id === imports.financialAccountId)
    const formattedDate = new Date(imports.createdAt).toLocaleDateString()
    const transactionCount = imports.transactions?.length ?? 0

    const sourceLabel = imports.sourceReference
        ? `${t(`imports.source.${imports.source}`)} · ${imports.sourceReference}`
        : t(`imports.source.${imports.source}`)

    const getStatusColor = () => {
        switch (imports.status) {
            case 'PROCESSING':
            case 'PENDING_REVIEW':
                return 'text-warning'
            case 'COMPLETED':
                return 'text-success'
            case 'FAILED':
                return 'text-danger'
            default:
                return ''
        }
    }

    return (
        <div
            className={cn(
                'flex flex-row justify-between items-start w-full p-5 border-border gap-5',
                canOpen && 'cursor-pointer'
            )}
            onClick={() => canOpen && openEdit(imports)}
        >
            <div className='flex flex-col space-y-1'>
                <p className='font-bold'>{imports.title}</p>
                <div className='flex flex-row items-center gap-2'>
                    <Badge variant='secondary'>{sourceLabel}</Badge>
                    <p className={cn('sub')}>&bull;</p>
                    <p className='sub'>{account?.title}</p>
                    {transactionCount > 0 && (
                        <>
                            <p className={cn('sub')}>&bull;</p>
                            <p className='sub'>{t('imports.transactionCount', { count: transactionCount })}</p>
                        </>
                    )}
                </div>
                {isFailed && imports.failureReason && <p className='text-danger'>{imports.failureReason}</p>}
            </div>
            <div className='flex flex-row items-start space-x-3'>
                <div className='flex flex-col items-end space-y-1'>
                    <p className='sub'>{formattedDate}</p>
                    <p className={getStatusColor()}>{t(`imports.status.${imports.status}`)}</p>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <OptionsPopover<ImportData>
                        data={imports}
                        buttons={[
                            {
                                onClick: item => openEdit(item),
                                label: t('buttons.editItem'),
                                icon: 'pencil',
                                hide: !canOpen
                            },
                            {
                                onClick: item => onRollback(item),
                                label: t('imports.rollback.title'),
                                icon: 'undo',
                                hide: !isCompleted
                            },
                            {
                                onClick: item => openDelete(item),
                                label: t('buttons.deleteItem'),
                                variant: 'danger',
                                icon: 'trash-2'
                            }
                        ]}
                    ></OptionsPopover>
                </div>
            </div>
        </div>
    )
}
