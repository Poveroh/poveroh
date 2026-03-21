'use client'

import { useEffect, useState } from 'react'
import { isEmpty } from '@poveroh/utils'
import { useTranslations } from 'next-intl'

import Box from '@/components/box/box-wrapper'

import { Input } from '@poveroh/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { List, ListTree, Search, Shapes } from 'lucide-react'
import { Button } from '@poveroh/ui/components/button'
import { CategorySubcategoryDialog } from '@/components/dialog/category-subcategory-dialog'
import { useCategory } from '@/hooks/use-category'
import { CategoryItem } from '@/components/item/category-item'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { PageWrapper } from '@/components/box/page-wrapper'
import { CategoryData, SubcategoryData } from '@poveroh/types'
import { CategoryModelMode } from '@poveroh/types'

export default function CategoryView() {
    const t = useTranslations()

    const { categoryCacheList, categoryLoading, fetchCategories, importTemplates, deleteCategories } = useCategory()

    const categoryModal = useModal<CategoryData | SubcategoryData>('category-dialog')
    const subcategoryModal = useModal<CategoryData | SubcategoryData>('subcategory-dialog')
    const { openModal: openDeleteModal } = useDeleteModal<CategoryData | SubcategoryData>()

    const [dialogModel, setDialogModel] = useState<CategoryModelMode>('category')
    const [localCategoryList, setLocalCategoryList] = useState<CategoryData[]>(categoryCacheList)
    const [activeTab, setActiveTab] = useState('expenses')

    useEffect(() => {
        fetchCategories(true)
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
                const matchingSubcategories = category.subcategories?.filter(
                    subcategory =>
                        subcategory.title.toLowerCase().includes(textToSearch) ||
                        subcategory.description?.toLowerCase().includes(textToSearch)
                )

                if (
                    category.title.toLowerCase().includes(textToSearch) ||
                    category.description?.toLowerCase().includes(textToSearch) ||
                    (matchingSubcategories && matchingSubcategories.length > 0)
                ) {
                    return {
                        ...category,
                        subcategories:
                            matchingSubcategories && matchingSubcategories.length > 0
                                ? matchingSubcategories
                                : category.subcategories
                    }
                }

                return null
            })
            .filter(Boolean) as CategoryData[]

        setLocalCategoryList(filteredList)
    }

    const openNew = (mode: CategoryModelMode) => {
        setDialogModel(mode)
        const manager = mode === 'category' ? categoryModal : subcategoryModal
        manager.openModal('create')
    }

    return (
        <>
            <PageWrapper>
                <Header
                    title={t('categories.title')}
                    titleSize='compact'
                    breadcrumbs={[
                        { label: t('settings.title') },
                        { label: t('settings.manage.title') },
                        { label: t('categories.title') }
                    ]}
                    fetchAction={{
                        onClick: () => fetchCategories(true),
                        loading: categoryLoading.fetchCategories
                    }}
                    addAction={[
                        {
                            onClick: () => openNew('category'),
                            loading: categoryLoading.createCategory,
                            label: t('categories.modal.newTitle'),
                            icon: <List />
                        },
                        ...(categoryCacheList.length > 0
                            ? [
                                  {
                                      onClick: () => openNew('subcategory'),
                                      loading: categoryLoading.createSubcategory,
                                      label: t('subcategories.modal.newTitle'),
                                      icon: <ListTree />
                                  }
                              ]
                            : [])
                    ]}
                    onDeleteAll={{
                        onClick: () => deleteCategories(),
                        loading: categoryLoading.deleteCategories,
                        disabled: localCategoryList.length === 0
                    }}
                />

                <div className='flex flex-row justify-between'>
                    <Input
                        startIcon={Search}
                        placeholder={t('messages.search')}
                        className='w-1/3'
                        onChange={onSearch}
                    />
                    <div className='flex items-center space-x-3'>
                        <Tabs
                            defaultValue={activeTab}
                            value={activeTab}
                            className='w-[200px]'
                            onValueChange={setActiveTab}
                        >
                            <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value='expenses'>{t('transactions.action.expenses')}</TabsTrigger>
                                <TabsTrigger value='income'>{t('transactions.action.income')}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
                {!categoryLoading.fetchCategories && localCategoryList.length > 0 ? (
                    <Tabs defaultValue={activeTab} value={activeTab} className='p-0'>
                        {['expenses', 'income'].map(tab => (
                            <TabsContent key={tab} value={tab} className='m-0'>
                                <Box>
                                    <>
                                        {localCategoryList
                                            .filter(x => x.for === (tab === 'expenses' ? 'EXPENSES' : 'INCOME'))
                                            .map(category => (
                                                <CategoryItem
                                                    key={category.id}
                                                    category={category}
                                                    openEdit={(
                                                        mode: CategoryModelMode,
                                                        item: CategoryData | SubcategoryData
                                                    ) => {
                                                        setDialogModel(mode)
                                                        const manager =
                                                            mode === 'category' ? categoryModal : subcategoryModal
                                                        manager.openModal('edit', item)
                                                    }}
                                                    openDelete={(
                                                        mode: CategoryModelMode,
                                                        item: CategoryData | SubcategoryData
                                                    ) => {
                                                        setDialogModel(mode)
                                                        openDeleteModal(item)
                                                    }}
                                                />
                                            ))}
                                    </>
                                </Box>
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <>
                        {categoryLoading.fetchCategories ? (
                            <SkeletonItem repeat={5} />
                        ) : (
                            <div className='flex flex-col items-center space-y-8 justify-center h-[300px]'>
                                <Shapes />
                                <div className='flex flex-col items-center space-y-2 justify-center'>
                                    <h4>{t('categories.empty.title')}</h4>
                                    <p>{t('categories.empty.subtitle')}</p>
                                </div>
                                <div className='flex flex-row space-x-3'>
                                    <Button variant='outline' onClick={() => importTemplates()}>
                                        {t('buttons.addFromTemplates')}
                                    </Button>
                                    <Button onClick={() => openNew('category')}>{t('buttons.add.new')}</Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </PageWrapper>

            <CategorySubcategoryDialog mode={dialogModel}></CategorySubcategoryDialog>
        </>
    )
}
