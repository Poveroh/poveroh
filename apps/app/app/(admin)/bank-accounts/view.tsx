'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { IBankAccount, IBankAccountFilters } from '@poveroh/types'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'

import { Landmark, Search, X } from 'lucide-react'

import Box from '@/components/box/BoxWrapper'
import { BankAccountDialog } from '@/components/dialog/BankAccountDialog'
import { BankAccountItem } from '@/components/item/BankAccountItem'
import { FilterButton } from '@/components/filter/FilterButton'
import { Header } from '@/components/other/HeaderPage'
import SkeletonItem from '@/components/skeleton/SkeletonItem'

import { useBankAccount } from '@/hooks/useBankAccount'
import { useModal } from '@/hooks/useModal'
import { useDeleteModal } from '@/hooks/useDeleteModal'

export default function BankAccountView() {
    const t = useTranslations()

    const { bankAccountCacheList, fetchBankAccount, typeList, accountLoading } = useBankAccount()

    const { openModal } = useModal<IBankAccount>()
    const { openModal: openDeleteModal } = useDeleteModal<IBankAccount>()

    const [localBankAccountList, setLocalBankAccountList] = useState<IBankAccount[]>(bankAccountCacheList)

    const [filters, setFilters] = useState<IBankAccountFilters>({})

    useEffect(() => {
        fetchBankAccount()
    }, [])

    useEffect(() => {
        setLocalBankAccountList(bankAccountCacheList)
    }, [bankAccountCacheList])

    const onFilter = (filter: IBankAccountFilters = {}) => {
        const updatedFilter = { ...filter }

        const filteredList = bankAccountCacheList.filter(account => {
            const titleMatch = updatedFilter.title?.contains
                ? account.title?.toLowerCase().includes(updatedFilter.title.contains.toLowerCase())
                : true

            const descriptionMatch = updatedFilter.description?.contains
                ? account.description?.toLowerCase().includes(updatedFilter.description.contains.toLowerCase())
                : true

            const typeMatch = updatedFilter.type ? account.type === updatedFilter.type : true

            return titleMatch && descriptionMatch && typeMatch
        })

        setFilters(updatedFilter)
        setLocalBankAccountList(filteredList)
    }

    const removeFilter = (key: keyof IBankAccountFilters) => {
        const newFilters: IBankAccountFilters = { ...filters }
        delete newFilters[key]

        if (key === 'title' || key === 'description') {
            delete newFilters[key]
        }

        onFilter(newFilters)
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value

        const newFilters: IBankAccountFilters = {
            ...filters,
            title: textToSearch ? { contains: textToSearch } : undefined,
            description: textToSearch ? { contains: textToSearch } : undefined
        }

        onFilter(newFilters)
    }

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('settings.manage.bankAccount.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings/manage' },
                        { label: t('settings.manage.bankAccount.title') }
                    ]}
                    fetchAction={{
                        onClick: () => fetchBankAccount(true),
                        loading: accountLoading.fetch
                    }}
                    addAction={{
                        onClick: () => {
                            openModal('create')
                        },
                        loading: accountLoading.add
                    }}
                    onDeleteAll={{
                        onClick: () => {},
                        loading: accountLoading.remove
                    }}
                />

                <div className='flex flex-row space-x-6 w-full'>
                    <div className='flex flex-row space-x-3'>
                        <Input
                            startIcon={Search}
                            placeholder={t('messages.search')}
                            className='w-[300px]'
                            onChange={onSearch}
                        />

                        {Object.entries(filters)
                            .filter(([key]) => key === 'type')
                            .map(([key, value]) => {
                                if (!value) return null

                                const item = typeList.find(x => x.value == value)

                                if (!item) return

                                return (
                                    <Button
                                        key={key}
                                        variant='secondary'
                                        className='flex items-center gap-1'
                                        onClick={() => removeFilter(key as keyof IBankAccountFilters)}
                                    >
                                        {item.label}
                                        <X />
                                    </Button>
                                )
                            })}
                    </div>

                    <FilterButton
                        fields={[
                            {
                                name: 'type',
                                label: 'form.type.label',
                                type: 'select',
                                options: typeList
                            }
                        ]}
                        filters={filters}
                        onFilterChange={onFilter}
                    />
                </div>
                {!accountLoading.fetch && localBankAccountList.length > 0 ? (
                    <Box>
                        <>
                            {localBankAccountList.map(account => (
                                <BankAccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={(item: IBankAccount) => {
                                        openModal('edit', item)
                                    }}
                                    openDelete={openDeleteModal}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <>
                        {accountLoading.fetch ? (
                            <SkeletonItem repeat={5} />
                        ) : (
                            <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                                <Landmark />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('bankAccounts.empty.title')}</h4>
                                    <p>{t('bankAccounts.empty.subtitle')}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <BankAccountDialog></BankAccountDialog>
        </>
    )
}
