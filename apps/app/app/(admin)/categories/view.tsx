'use client'

import { useEffect, useState } from 'react'
import { isEmpty, isNil } from 'lodash'
import { useTranslations } from 'next-intl'

import { CategoryModelMode, ICategory, ISubcategory, TransactionAction } from '@poveroh/types'

import Box from '@/components/box/BoxWrapper'
import { DeleteModal } from '@/components/modal/delete'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'

import { Download, List, ListTree, Plus, RotateCcw, Search, Shapes } from 'lucide-react'
import { CategoryDialog } from '@/components/dialog/CategoryDialog'
import { SubcategoryDialog } from '@/components/dialog/SubcategoryDialog'
import { useCategory } from '@/hooks/useCategory'
import { CategoryItem } from '@/components/item/CategoryItem'
import Divider from '@/components/other/Divider'

export default function CategoryView() {
    const t = useTranslations()

    const { categoryCacheList, removeSubcategory, removeCategory, fetchCategory } = useCategory()

    const [itemToDelete, setItemToDelete] = useState<ICategory | ISubcategory | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ICategory | ISubcategory | null>(null)

    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [dialogModel, setDialogModel] = useState<CategoryModelMode>('category')

    const [loading, setLoading] = useState(false)

    const [localCategoryList, setLocalCategoryList] = useState<ICategory[]>(categoryCacheList)

    const [activeTab, setActiveTab] = useState('expenses')

    useEffect(() => {
        fetchCategory()
    }, [])

    useEffect(() => {
        setLocalCategoryList(categoryCacheList)
    }, [categoryCacheList])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value.toLowerCase()

        if (isEmpty(textToSearch)) {
            setLocalCategoryList(categoryCacheList)
            return
        }

        const filteredList = categoryCacheList
            .map(category => {
                const matchingSubcategories = category.subcategories.filter(
                    subcategory =>
                        subcategory.title.toLowerCase().includes(textToSearch) ||
                        subcategory.description?.toLowerCase().includes(textToSearch)
                )

                if (
                    category.title.toLowerCase().includes(textToSearch) ||
                    category.description?.toLowerCase().includes(textToSearch) ||
                    matchingSubcategories.length > 0
                ) {
                    return {
                        ...category,
                        subcategories: matchingSubcategories.length > 0 ? matchingSubcategories : category.subcategories
                    }
                }

                return null
            })
            .filter(Boolean) as ICategory[]

        setLocalCategoryList(filteredList)
    }

    const openDelete = (mode: CategoryModelMode, item: ICategory | ISubcategory) => {
        setDialogModel(mode)
        setItemToDelete(item)
    }

    const closeDelete = () => {
        setItemToDelete(null)
    }

    const openEdit = (mode: CategoryModelMode, item: ICategory | ISubcategory) => {
        setDialogModel(mode)
        setItemToEdit(item)
    }

    const openNew = (mode: CategoryModelMode) => {
        setDialogModel(mode)
        setDialogNewOpen(true)
    }

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const res =
            dialogModel === 'category'
                ? await removeCategory(itemToDelete.id)
                : await removeSubcategory(itemToDelete.id)

        setLoading(false)

        if (res) setItemToDelete(null)
    }

    return (
        <>
            <div className='space-y-12'>
                <div className='flex flex-row items-end justify-between'>
                    <div className='flex flex-col space-y-3'>
                        <h2>{t('categories.title')}</h2>
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
                                    <BreadcrumbPage>{t('categories.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchCategory} />
                        <div className='flex flex-row items-center space-x-3'>
                            <Button variant='outline'>
                                <Download></Download>
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button>
                                        <Plus />
                                        {t('buttons.add.base')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align='end'>
                                    <div className='flex flex-col space-y-5'>
                                        <a
                                            className='flex items-center space-x-2 w-full'
                                            onClick={() => openNew('category')}
                                        >
                                            <List />
                                            <p>{t('categories.modal.newTitle')}</p>
                                        </a>
                                        {localCategoryList.length > 0 && (
                                            <>
                                                <Divider></Divider>
                                                <a
                                                    className='flex items-center space-x-2 w-full'
                                                    onClick={() => openNew('subcategory')}
                                                >
                                                    <ListTree />
                                                    <p>{t('subcategories.modal.newTitle')}</p>
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row justify-between'>
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-1/3'
                        onChange={onSearch}
                    />
                    <Tabs defaultValue={activeTab} value={activeTab} className='w-[200px]' onValueChange={setActiveTab}>
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value='expenses'>{t('transactions.types.expenses')}</TabsTrigger>
                            <TabsTrigger value='income'>{t('transactions.types.income')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                {localCategoryList.length > 0 ? (
                    <Tabs defaultValue={activeTab} value={activeTab} className='p-0'>
                        {['expenses', 'income'].map(tab => (
                            <TabsContent key={tab} value={tab} className='m-0'>
                                <Box>
                                    <>
                                        {localCategoryList
                                            .filter(
                                                x =>
                                                    x.for ===
                                                    (tab === 'expenses'
                                                        ? TransactionAction.EXPENSES
                                                        : TransactionAction.INCOME)
                                            )
                                            .map(category => (
                                                <CategoryItem
                                                    key={category.id}
                                                    category={category}
                                                    openEdit={openEdit}
                                                    openDelete={openDelete}
                                                />
                                            ))}
                                    </>
                                </Box>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                        <Shapes />
                        <div className='flex flex-col items-center space-y-2 justify-center'>
                            <h4>{t('categories.empty.title')}</h4>
                            <p>{t('categories.empty.subtitle')}</p>
                        </div>
                    </div>
                )}
            </div>

            <DeleteModal
                title={itemToDelete?.title || ''}
                description={t(
                    dialogModel == 'category'
                        ? 'categories.modal.deleteDescription'
                        : 'subcategories.modal.deleteDescription'
                )}
                open={!isNil(itemToDelete)}
                closeDialog={closeDelete}
                loading={loading}
                onConfirm={onDelete}
            ></DeleteModal>

            {dialogModel == 'category' && dialogNewOpen && (
                <CategoryDialog
                    open={dialogNewOpen}
                    inEditingMode={false}
                    closeDialog={() => setDialogNewOpen(false)}
                ></CategoryDialog>
            )}

            {dialogModel == 'category' && itemToEdit && (
                <CategoryDialog
                    initialData={itemToEdit as ICategory}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                ></CategoryDialog>
            )}

            {dialogModel == 'subcategory' && dialogNewOpen && (
                <SubcategoryDialog
                    open={dialogNewOpen}
                    inEditingMode={false}
                    closeDialog={() => setDialogNewOpen(false)}
                ></SubcategoryDialog>
            )}

            {dialogModel == 'subcategory' && itemToEdit && (
                <SubcategoryDialog
                    initialData={itemToEdit as ISubcategory}
                    open={itemToEdit !== null}
                    inEditingMode={true}
                    closeDialog={() => setItemToEdit(null)}
                ></SubcategoryDialog>
            )}
        </>
    )
}
