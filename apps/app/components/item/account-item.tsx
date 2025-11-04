import { BrandIcon } from '../icon/brand-icon'
import { IFinancialAccount } from '@poveroh/types'
import { useFinancialAccount } from '@/hooks/use-account'
import { OptionsPopover } from '../navbar/options-popover'

type AccountItemProps = {
    account: IFinancialAccount
    openDelete: (item: IFinancialAccount) => void
    openEdit: (item: IFinancialAccount) => void
}

export function AccountItem({ account, openDelete, openEdit }: AccountItemProps) {
    const { TYPE_LIST } = useFinancialAccount()

    const type = TYPE_LIST.find(tp => tp.value == account.type)

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
            <OptionsPopover<IFinancialAccount>
                data={account}
                openDelete={openDelete}
                openEdit={openEdit}
            ></OptionsPopover>
        </div>
    )
}
