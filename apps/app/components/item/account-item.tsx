import { BrandIcon } from '../icon/brand-icon'
import { IAccount } from '@poveroh/types'
import { useAccount } from '@/hooks/use-account'
import { OptionsPopover } from '../navbar/options-popover'

type AccountItemProps = {
    account: IAccount
    openDelete: (item: IAccount) => void
    openEdit: (item: IAccount) => void
}

export function AccountItem({ account, openDelete, openEdit }: AccountItemProps) {
    const { typeList } = useAccount()

    const type = typeList.find(tp => tp.value == account.type)

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
            <OptionsPopover<IAccount> data={account} openDelete={openDelete} openEdit={openEdit}></OptionsPopover>
        </div>
    )
}
