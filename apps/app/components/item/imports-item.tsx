import { IImport, TransactionStatus } from '@poveroh/types'
import { OptionsPopover } from '../navbar/options-popover'
import { useTranslations } from 'next-intl'
import { cn } from '@poveroh/ui/lib/utils'

type ImportsItemProps = {
    imports: IImport
    openDelete: (item: IImport) => void
    openEdit: (item: IImport) => void
}

export function ImportsItem({ imports, openDelete, openEdit }: ImportsItemProps) {
    const t = useTranslations()

    const importApproved = imports.status === TransactionStatus.APPROVED

    return (
        <div
            className={cn(
                'flex flex-row justify-between items-center w-full p-5 border-border',
                !importApproved && 'cursor-pointer'
            )}
            onClick={() => !importApproved && openEdit(imports)}
        >
            <div className='flex flex-row items-center space-x-5'>
                <div>
                    <p>{imports.title}</p>
                    <p className={importApproved ? 'text-success' : 'sub'}>{t(`imports.status.${imports.status}`)}</p>
                </div>
            </div>
            <OptionsPopover<IImport>
                data={imports}
                openDelete={openDelete}
                openEdit={openEdit}
                options={{
                    hideEdit: importApproved
                }}
            ></OptionsPopover>
        </div>
    )
}
