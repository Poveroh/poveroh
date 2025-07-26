import { BrandIcon } from '../icon/brand-icon'
import { IBankAccount } from '@poveroh/types'
import { useBankAccount } from '@/hooks/use-bank-account'
import { OptionsPopover } from '../navbar/options-popover'

type BankAccountItemProps = {
    account: IBankAccount
    openDelete: (item: IBankAccount) => void
    openEdit: (item: IBankAccount) => void
}

export function BankAccountItem({ account, openDelete, openEdit }: BankAccountItemProps) {
    const { typeList } = useBankAccount()

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
            <OptionsPopover<IBankAccount> data={account} openDelete={openDelete} openEdit={openEdit}></OptionsPopover>
        </div>
    )
}
