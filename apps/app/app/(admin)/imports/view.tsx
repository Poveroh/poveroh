'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { DeleteModal } from '@/components/modal/DeleteModal'

import { Download, Plus, RotateCcw, Upload } from 'lucide-react'

import { IImport } from '@poveroh/types'

import { useImport } from '@/hooks/useImports'
import { ImportDialog } from '@/components/dialog/ImportDialog'
import Box from '@/components/box/BoxWrapper'
import { ImportsItem } from '@/components/item/ImportsItem'

export default function ImportsView() {
    const t = useTranslations()

    const { importCacheList, fetchImport, removeImport, readPendingTransaction } = useImport()

    const [itemToDelete, setItemToDelete] = useState<IImport | null>(null)
    const [itemToEdit, setItemToEdit] = useState<IImport | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [localImports, setLocalImports] = useState<IImport[]>([])

    useEffect(() => {
        fetchImport()
    }, [])

    useEffect(() => {
        setLocalImports(importCacheList)
    }, [importCacheList])

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res = await removeImport(itemToDelete.id)

        if (!res) {
            setLoading(false)
            return
        }

        setItemToDelete(null)
    }

    const handleItemToItEdit = async (item: IImport) => {
        const readedTransactions = await readPendingTransaction(item.id)

        if (!readedTransactions) {
            return
        }

        const itemToEdit: IImport = {
            ...item,
            transactions: readedTransactions
        }

        setItemToEdit(itemToEdit)
    }

    return (
        <>
            <div className='space-y-12'>
                <div className='flex flex-row items-end justify-between'>
                    <div className='flex flex-col space-y-3'>
                        <h2>{t('imports.title')}</h2>
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
                                    <BreadcrumbPage>{t('imports.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={() => fetchImport()} />
                        <div className='flex flex-row items-center space-x-3'>
                            <Button variant='outline'>
                                <Download></Download>
                            </Button>
                            <Button onClick={() => setDialogNewOpen(true)}>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </div>
                    </div>
                </div>
                {localImports.length > 0 ? (
                    <Box>
                        <>
                            {localImports.map(imports => (
                                <ImportsItem
                                    key={imports.id}
                                    imports={imports}
                                    openEdit={handleItemToItEdit}
                                    openDelete={setItemToDelete}
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

            {itemToDelete && (
                <DeleteModal
                    title={itemToDelete.title}
                    description={t('imports.modal.deleteDescription')}
                    open={true}
                    closeDialog={() => setItemToDelete(null)}
                    loading={loading}
                    onConfirm={onDelete}
                ></DeleteModal>
            )}

            {dialogNewOpen && (
                <ImportDialog
                    open={dialogNewOpen}
                    dialogHeight={undefined}
                    closeDialog={() => setDialogNewOpen(false)}
                    inEditingMode={false}
                />
            )}

            {itemToEdit && (
                <ImportDialog
                    initialData={itemToEdit}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                />
            )}
        </>
    )
}
