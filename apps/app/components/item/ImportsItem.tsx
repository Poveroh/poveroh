import { IImport } from '@poveroh/types'
import { OptionsPopover } from '../navbar/OptionsPopover'
import { useTranslations } from 'next-intl'

type ImportsItemProps = {
    imports: IImport
    openDelete: (item: IImport) => void
    openEdit: (item: IImport) => void
}

export function ImportsItem({ imports, openDelete, openEdit }: ImportsItemProps) {
    const t = useTranslations()

    return (
        <div
            className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer'
            onClick={() => openEdit(imports)}
        >
            <div className='flex flex-row items-center space-x-5'>
                <div>
                    <p>{imports.title}</p>
                    <p className='sub'>{t(`imports.status.${imports.status}`)}</p>
                </div>
            </div>
            <OptionsPopover<IImport> data={imports} openDelete={openDelete} openEdit={openEdit}></OptionsPopover>
        </div>
    )
}
