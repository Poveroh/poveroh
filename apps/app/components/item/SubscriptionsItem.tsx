import { BrandIcon } from '../icon/BrandIcon'
import { AppearanceMode, IBankAccount, ISubscription } from '@poveroh/types'
import { OptionsPopover } from '../navbar/OptionsPopover'
import DynamicIcon from '../icon/DynamicIcon'
import icons from 'currency-icons'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { useBankAccount } from '@/hooks/useBankAccount'
import { useEffect, useState } from 'react'

type SubscriptionItemProps = {
    subscription: ISubscription
    openDelete: (item: ISubscription) => void
    openEdit: (item: ISubscription) => void
}

export function SubscriptionItem({ subscription, openDelete, openEdit }: SubscriptionItemProps) {
    const { getNextExecutionText } = useSubscriptions()
    const { getBankAccount } = useBankAccount()
    const currencySymbol = icons[subscription.currency]?.symbol || ''

    const [bankAccount, setBankAccount] = useState<IBankAccount | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const account = await getBankAccount(subscription.bank_account_id)
            setBankAccount(account)
        }
        fetchData()
    }, [subscription])

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='flex items-center justify-center h-[40px] w-[40px]'>
                    {(() => {
                        if (subscription.appearance_mode == AppearanceMode.LOGO) {
                            return <BrandIcon circled icon={subscription.appearance_logo_icon} />
                        } else {
                            return (
                                <DynamicIcon
                                    name={subscription?.appearance_logo_icon || 'landmark'}
                                    className='h-[30px] w-[30px]'
                                />
                            )
                        }
                    })()}
                </div>

                <div className='flex flex-col space-y-1'>
                    <p>{subscription.title}</p>
                    <div className='flex flex-row space-x-2'>
                        <p className='sub'>{bankAccount?.title}</p>
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center space-x-6'>
                <div className='flex flex-col justify-center space-y-1 items-end'>
                    <div className='flex flex-row space-x-1'>
                        <h5 className='font-bold'>{subscription.amount}</h5>
                        <span>{currencySymbol}</span>
                    </div>
                    <p className='sub'>{getNextExecutionText(subscription)}</p>
                </div>
                <OptionsPopover<ISubscription>
                    data={subscription}
                    openDelete={openDelete}
                    openEdit={openEdit}
                ></OptionsPopover>
            </div>
        </div>
    )
}
