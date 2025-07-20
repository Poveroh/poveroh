'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'

import { Landmark, Plus, RotateCcw, Search, X } from 'lucide-react'

import Box from '@/components/box/BoxWrapper'
import { DeleteModal } from '@/components/modal/DeleteModal'
import { BankAccountDialog } from '@/components/dialog/BankAccountDialog'

import { IBankAccount, IBankAccountFilters } from '@poveroh/types'

import { useBankAccount } from '@/hooks/useBankAccount'
import { BankAccountItem } from '@/components/item/BankAccountItem'
import { FilterButton } from '@/components/filter/FilterButton'

export default function BankAccountView() {
    const t = useTranslations()

    const { bankAccountCacheList, removeBankAccount, fetchBankAccount, typeList } = useBankAccount()

    const [itemToDelete, setItemToDelete] = useState<IBankAccount | null>(null)
    const [itemToEdit, setItemToEdit] = useState<IBankAccount | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

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

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await removeBankAccount(itemToDelete.id)

        setLoading(false)

        if (res) {
            setItemToDelete(null)
        }
    }

    return (
        <>
            <div className='space-y-12'>
                <div className='flex flex-row items-end justify-between'>
                    <div className='flex flex-col space-y-3'>
                        <h2>{t('settings.manage.bankAccount.title')}</h2>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='/settings'>{t('settings.manage.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('settings.manage.bankAccount.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchBankAccount} />
                        <div className='flex flex-row items-center space-x-3'>
                            {
                                // TODO: implement export functionality
                                /* <Button variant='secondary'>
                                    <Download />
                                    {t('buttons.export.base')}
                                </Button> */
                            }
                            <Button onClick={() => setDialogNewOpen(true)}>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </div>
                    </div>
                </div>
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
                {localBankAccountList.length > 0 ? (
                    <Box>
                        <>
                            {localBankAccountList.map(account => (
                                <BankAccountItem
                                    key={account.id}
                                    account={account}
                                    openEdit={setItemToEdit}
                                    openDelete={setItemToDelete}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                        <Landmark />
                        <div className='flex flex-col items-center space-y-2 justify-center'>
                            <h4>{t('bankAccounts.empty.title')}</h4>
                            <p>{t('bankAccounts.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            <DeleteModal
                title={itemToDelete ? itemToDelete.title : ''}
                description={t('bankAccounts.modal.deleteDescription')}
                open={itemToDelete ? true : false}
                closeDialog={() => setItemToDelete(null)}
                loading={loading}
                onConfirm={onDelete}
            ></DeleteModal>

            <BankAccountDialog
                open={dialogNewOpen}
                inEditingMode={false}
                closeDialog={() => setDialogNewOpen(false)}
            ></BankAccountDialog>

            <BankAccountDialog
                initialData={itemToEdit}
                open={itemToEdit !== null}
                inEditingMode={true}
                closeDialog={() => setItemToEdit(null)}
            ></BankAccountDialog>
        </>
    )
}
