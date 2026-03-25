import { BrandIcon } from '../icon/brand-icon'
import { useFinancialAccount } from '@/hooks/use-account'
import { OptionsPopover } from '../navbar/options-popover'
import { useTranslations } from 'next-intl'
import { ExtraButton } from '@/types/options'
import { FinancialAccountData } from '@poveroh/types'

type AccountItemProps = {
    account: FinancialAccountData
    buttons?: ExtraButton<FinancialAccountData>[]
    openDelete: (item: FinancialAccountData) => void
    openEdit: (item: FinancialAccountData) => void
}

export function AccountItem({ account, buttons, openDelete, openEdit }: AccountItemProps) {
    const t = useTranslations()
    const { ACCOUNT_TYPE_CATALOG } = useFinancialAccount()

    const type = ACCOUNT_TYPE_CATALOG.find(tp => tp.value == account.type)

    return (
        <div
            className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer'
            onClick={() => openEdit(account)}
        >
            <div className='flex flex-row items-center space-x-5'>
                <BrandIcon icon={account.logoIcon}></BrandIcon>
                <div>
                    <p>{account.title}</p>
                    <p className='sub'>{type?.label}</p>
                </div>
            </div>
            <OptionsPopover<FinancialAccountData>
                data={account}
                buttons={[
                    {
                        onClick: item => openEdit(item),
                        label: t('buttons.editItem'),
                        icon: 'pencil'
                    },
                    ...(buttons || []),
                    {
                        onClick: item => openDelete(item),
                        variant: 'danger',
                        label: t('buttons.deleteItem'),
                        icon: 'trash-2'
                    }
                ]}
            ></OptionsPopover>
        </div>
    )
}
