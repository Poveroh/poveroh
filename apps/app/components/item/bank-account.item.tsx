import { Pencil, Trash2 } from 'lucide-react'
import { BrandIcon } from '../icon/brandIcon'
import { IBankAccount } from '@poveroh/types'

type BankAccountItemProps = {
    account: IBankAccount
    openDelete: (item: IBankAccount) => void
    openEdit: (item: IBankAccount) => void
}

export function BankAccountItem({ account, openDelete, openEdit }: BankAccountItemProps) {
    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <BrandIcon icon={account.logo_icon}></BrandIcon>
                <div>
                    <p>{account.title}</p>
                    <p className='sub'>{account.description}</p>
                </div>
            </div>
            <div className='flex flex-col items-center'>
                <div className='flex flex-row space-x-5 items-center'>
                    <Pencil className='cursor-pointer' onClick={() => openEdit(account)} />
                    <Trash2 className='danger cursor-pointer' onClick={() => openDelete(account)} />
                </div>
            </div>
        </div>
    )
}
