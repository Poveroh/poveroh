'use client'

import { useEffect, useState } from 'react'
import { isEmpty, isNil } from 'lodash'
import { useTranslations } from 'next-intl'

import { CategoryModelMode, ICategory, ISubcategory, TransactionAction } from '@poveroh/types'

import Box from '@/components/box/BoxWrapper'
import { DeleteModal } from '@/components/modal/DeleteModal'

import { Input } from '@poveroh/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { Search, Shapes } from 'lucide-react'
import { CategoryDialog } from '@/components/dialog/CategoryDialog'
import { SubcategoryDialog } from '@/components/dialog/SubcategoryDialog'
import { useCategory } from '@/hooks/useCategory'
import { CategoryItem } from '@/components/item/CategoryItem'
import { Header } from '@/components/other/HeaderPage'
import SkeletonItem from '@/components/skeleton/SkeletonItem'

export default function CategoryView() {
    const t = useTranslations()

    const { categoryCacheList, categoryLoading, removeSubcategory, removeCategory, fetchCategory } = useCategory()

    const [itemToDelete, setItemToDelete] = useState<ICategory | ISubcategory | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ICategory | ISubcategory | null>(null)

    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [dialogModel, setDialogModel] = useState<CategoryModelMode>('category')

    const [loading, setLoading] = useState(false)

    const [localCategoryList, setLocalCategoryList] = useState<ICategory[]>(categoryCacheList)

    const [activeTab, setActiveTab] = useState('expenses')

    useEffect(() => {
        fetchCategory(true)
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
                <Header
                    title={t('categories.title')}
                    breadcrumbs={[
                        { label: t('settings.title'), href: '/settings' },
                        { label: t('settings.manage.title'), href: '/settings' },
                        { label: t('categories.title') }
                    ]}
                    fetchAction={{
                        onClick: () => fetchCategory(true),
                        loading: categoryLoading.fetchCategory
                    }}
                    addAction={{
                        onClick: () => openNew('category'),
                        loading: categoryLoading.addCategory
                    }}
                />

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
                {!categoryLoading.fetchCategory && localCategoryList.length > 0 ? (
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
                    <>
                        {categoryLoading.fetchCategory ? (
                            <SkeletonItem repeat={5} />
                        ) : (
                            <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                                <Shapes />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('categories.empty.title')}</h4>
                                    <p>{t('categories.empty.subtitle')}</p>
                                </div>
                            </div>
                        )}
                    </>
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

            <CategoryDialog
                open={dialogModel == 'category' && dialogNewOpen}
                inEditingMode={false}
                closeDialog={() => setDialogNewOpen(false)}
            ></CategoryDialog>

            <CategoryDialog
                initialData={itemToEdit as ICategory}
                open={dialogModel == 'category' && itemToEdit !== null}
                inEditingMode={true}
                closeDialog={() => setItemToEdit(null)}
            ></CategoryDialog>

            <SubcategoryDialog
                open={dialogModel == 'subcategory' && dialogNewOpen}
                inEditingMode={false}
                closeDialog={() => setDialogNewOpen(false)}
            ></SubcategoryDialog>

            <SubcategoryDialog
                initialData={itemToEdit as ISubcategory}
                open={dialogModel == 'subcategory' && itemToEdit !== null}
                inEditingMode={true}
                closeDialog={() => setItemToEdit(null)}
            ></SubcategoryDialog>
        </>
    )
}
