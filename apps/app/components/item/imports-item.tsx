import { OptionsPopover } from '../navbar/options-popover'
import { useTranslations } from 'next-intl'
import { cn } from '@poveroh/ui/lib/utils'
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

    const importApproved = imports.status === 'APPROVED'
    const account = accountQuery.data?.data.find(acc => acc.id === imports.financialAccountId)
    const formattedDate = new Date(imports.createdAt).toLocaleDateString()

    const getStatusColor = () => {
        switch (imports.status) {
            case 'IMPORT_PENDING':
                return 'text-warning'
            case 'APPROVED':
                return 'text-success'
            case 'IMPORT_REJECTED':
                return 'text-danger'
            default:
                return ''
        }
    }

    return (
        <div
            className={cn(
                'flex flex-row justify-between items-start w-full p-5 border-border gap-5',
                !importApproved && 'cursor-pointer'
            )}
            onClick={() => !importApproved && openEdit(imports)}
        >
            <div className='flex flex-col space-y-1'>
                <p>{imports.title}</p>
                <p className='sub'>{account?.title}</p>
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
                                hide: importApproved
                            },
                            {
                                onClick: item => onRollback(item),
                                label: t('imports.rollback.title'),
                                icon: 'undo',
                                hide: !importApproved
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
