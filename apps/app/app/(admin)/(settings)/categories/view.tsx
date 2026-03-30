'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@poveroh/ui/components/button'
import { Input } from '@poveroh/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { List, ListTree, Search, Shapes } from 'lucide-react'

import Box from '@/components/box/box-wrapper'
import { CategoryDialog } from '@/components/dialog/category-dialog'
import { SubcategoryDialog } from '@/components/dialog/subcategory-dialog'
import { CategoryItem } from '@/components/item/category-item'
import { Header } from '@/components/other/header-page'
import SkeletonItem from '@/components/skeleton/skeleton-item'

import { useCategory } from '@/hooks/use-category'
import { useSubcategory } from '@/hooks/use-subcategory'
import { useModal } from '@/hooks/use-modal'
import { useDeleteModal } from '@/hooks/use-delete-modal'
import { PageWrapper } from '@/components/box/page-wrapper'
import { CategoryData, SubcategoryData, CategoryModelMode } from '@poveroh/types'

export default function CategoryView() {
    const t = useTranslations()

    const {
        categoryQuery,
        categoryData,
        createCategoryMutation,
        deleteAllCategoryMutation,
        importTemplates,
        onSearch
    } = useCategory()
    const { createSubcategoryMutation } = useSubcategory()

    const categoryModal = useModal<CategoryData>('category-dialog')
    const subcategoryModal = useModal<SubcategoryData>('subcategory-dialog')
    const { openModal: openDeleteModal } = useDeleteModal<CategoryData | SubcategoryData>()

    const [activeTab, setActiveTab] = useState('expenses')

    const pageContent = useMemo(() => {
        if (categoryQuery.isPending) {
            return <SkeletonItem repeat={5} />
        }

        if (categoryData.length > 0) {
            return (
                <Tabs defaultValue={activeTab} value={activeTab} className='p-0'>
                    {['expenses', 'income'].map(tab => (
                        <TabsContent key={tab} value={tab} className='m-0'>
                            <Box>
                                <>
                                    {categoryData
                                        .filter(x => x.for === (tab === 'expenses' ? 'EXPENSES' : 'INCOME'))
                                        .map(category => (
                                            <CategoryItem
                                                key={category.id}
                                                category={category}
                                                openEdit={(
                                                    mode: CategoryModelMode,
                                                    item: CategoryData | SubcategoryData
                                                ) => {
                                                    if (mode === 'category') {
                                                        categoryModal.openModal('edit', item as CategoryData)
                                                    } else {
                                                        subcategoryModal.openModal('edit', item as SubcategoryData)
                                                    }
                                                }}
                                                openDelete={(
                                                    _mode: CategoryModelMode,
                                                    item: CategoryData | SubcategoryData
                                                ) => {
                                                    openDeleteModal(item)
                                                }}
                                            />
                                        ))}
                                </>
                            </Box>
                        </TabsContent>
                    ))}
                </Tabs>
            )
        }

        return (
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
                    <Button onClick={() => categoryModal.openModal('create')}>{t('buttons.add.new')}</Button>
                </div>
            </div>
        )
    }, [categoryQuery.isPending, categoryData, activeTab])

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
                        onClick: categoryQuery.refetch,
                        loading: categoryQuery.isPending
                    }}
                    addAction={[
                        {
                            onClick: () => categoryModal.openModal('create'),
                            loading: createCategoryMutation.isPending,
                            label: t('categories.modal.newTitle'),
                            icon: <List />
                        },
                        ...(categoryData.length > 0
                            ? [
                                  {
                                      onClick: () => subcategoryModal.openModal('create'),
                                      loading: createSubcategoryMutation.isPending,
                                      label: t('subcategories.modal.newTitle'),
                                      icon: <ListTree />
                                  }
                              ]
                            : [])
                    ]}
                    onDeleteAll={{
                        onClick: () => deleteAllCategoryMutation.mutateAsync({}),
                        loading: deleteAllCategoryMutation.isPending,
                        disabled: categoryData.length === 0
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

                {pageContent}
            </PageWrapper>

            <CategoryDialog />
            <SubcategoryDialog />
        </>
    )
}
