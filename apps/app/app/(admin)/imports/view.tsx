'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Upload } from 'lucide-react'

import { IImport } from '@poveroh/types'

import { useImport } from '@/hooks/use-imports'
import Box from '@/components/box/box-wrapper'
import { ImportsItem } from '@/components/item/imports-item'
import { ImportDrawer } from '@/components/drawer/import-drawer'
import { Header } from '@/components/other/header-page'
import { useDrawer } from '@/hooks/use-drawer'
import { useDeleteModal } from '@/hooks/use-delete-modal'

export default function ImportsView() {
    const t = useTranslations()

    const { importStore, importCacheList, importLoading, fetchImport, readPendingTransaction } = useImport()

    const { openDrawer } = useDrawer<IImport>()
    const { openModal: openDeleteModal } = useDeleteModal<IImport>()

    const [localImports, setLocalImports] = useState<IImport[]>([])

    useEffect(() => {
        fetchImport()
    }, [])

    useEffect(() => {
        setLocalImports(importCacheList)
    }, [importCacheList])

    const handleItemToItEdit = async (item: IImport) => {
        const readedTransactions = await readPendingTransaction(item.id)

        if (!readedTransactions) {
            return
        }

        const itemToEdit: IImport = {
            ...item,
            transactions: readedTransactions
        }

        importStore.setCurrentImport(itemToEdit)
    }

    return (
        <>
            <div className='space-y-12'>
                <Header
                    title={t('imports.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings' },
                        { label: t('imports.title') }
                    ]}
                    fetchAction={{
                        onClick: fetchImport,
                        loading: importLoading.fetchImport
                    }}
                    addAction={{
                        onClick: () => openDrawer('create'),
                        loading: importLoading.appendImport
                    }}
                    onDeleteAll={{
                        onClick: openDeleteModal,
                        loading: importLoading.removeImport
                    }}
                />

                {localImports.length > 0 ? (
                    <Box>
                        <>
                            {localImports.map(imports => (
                                <ImportsItem
                                    key={imports.id}
                                    imports={imports}
                                    openEdit={handleItemToItEdit}
                                    openDelete={() => {}}
                                />
                            ))}
                        </>
                    </Box>
                ) : (
                    <div className='flex justify-center w-full pt-20'>
                        <div className='flex flex-col items-center space-y-8 justify-center w-[400px]'>
                            <div className='flex flex-col items-center space-y-8 justify-center'>
                                <Upload />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('imports.empty.title')}</h4>
                                    <p>{t('imports.empty.subtitle')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ImportDrawer></ImportDrawer>
        </>
    )
}
