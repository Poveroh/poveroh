import { BrandIcon } from '../icon/BrandIcon'
import { IBankAccount } from '@poveroh/types'
import { useBankAccount } from '@/hooks/useBankAccount'
import { OptionsPopover } from '../navbar/OptionsPopover'

type BankAccountItemProps = {
    account: IBankAccount
    openDelete: (item: IBankAccount) => void
    openEdit: (item: IBankAccount) => void
}

export function BankAccountItem({ account, openDelete, openEdit }: BankAccountItemProps) {
    const { getTypeList } = useBankAccount()

    const type = getTypeList().find(tp => tp.value == account.type)

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
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
