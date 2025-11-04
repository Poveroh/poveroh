import { BrandIcon } from '../icon/brand-icon'
import { AppearanceMode, IFinancialAccount, ISubscription } from '@poveroh/types'
import { OptionsPopover } from '../navbar/options-popover'
import DynamicIcon from '../icon/dynamic-icon'
import icons from 'currency-icons'
import { useSubscription } from '@/hooks/use-subscriptions'
import { useAccount } from '@/hooks/use-account'
import { useEffect, useState } from 'react'

type SubscriptionItemProps = {
    subscription: ISubscription
    openDelete: (item: ISubscription) => void
    openEdit: (item: ISubscription) => void
}

export function SubscriptionItem({ subscription, openDelete, openEdit }: SubscriptionItemProps) {
    const { getNextExecutionText } = useSubscription()
    const { getAccount } = useAccount()
    const currencySymbol = icons[subscription.currency]?.symbol || ''

    const [account, setAccount] = useState<IFinancialAccount | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const account = await getAccount(subscription.financialAccountId)
            setAccount(account)
        }
        fetchData()
    }, [subscription])

    return (
        <div
            className='flex flex-row justify-between items-center w-full p-5 border-border cursor-pointer'
            onClick={() => openEdit(subscription)}
        >
            <div className='flex flex-row items-center space-x-5'>
                <div className='flex items-center justify-center h-[40px] w-[40px]'>
                    {(() => {
                        if (subscription.appearanceMode == AppearanceMode.LOGO) {
                            return <BrandIcon circled icon={subscription.appearanceLogoIcon} />
                        } else {
                            return (
                                <DynamicIcon
                                    name={subscription?.appearanceLogoIcon || 'landmark'}
                                    className='h-[30px] w-[30px]'
                                />
                            )
                        }
                    })()}
                </div>

                <div className='flex flex-col space-y-1'>
                    <p>{subscription.title}</p>
                    <div className='flex flex-row space-x-2'>
                        <p className='sub'>{account?.title}</p>
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
