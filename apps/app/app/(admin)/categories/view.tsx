'use client'

import { useEffect, useState } from 'react'
import _ from 'lodash'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { Download, List, ListTree, Pencil, Plus, RotateCcw, Search, Trash2, Shapes } from 'lucide-react'

import { ICategory, ISubcategory, TransactionAction } from '@poveroh/types'

import { CategoryService, SubcategoryService } from '@/services/category.service'
import Box from '@/components/box/boxWrapper'
import DynamicIcon from '@/components/icon/dynamicIcon'
import { DeleteModal } from '@/components/modal/delete'
import { Modal } from '@/components/modal/form'
import { CategoryForm } from '@/components/form/CategoryForm'
import { SubcategoryForm } from '@/components/form/SubcategoryForm'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'

const categoryService = new CategoryService()
const subcategoryService = new SubcategoryService()

type modelMode = 'category' | 'subcategory'

type CategoryItemProps = {
    category: ICategory
    openDelete: (mode: modelMode, item: ICategory | ISubcategory) => void
    openEdit: (mode: modelMode, item: ICategory | ISubcategory) => void
}

function CategoryItem({ category, openDelete, openEdit }: CategoryItemProps) {
    return (
        <>
            <div className='border-border'>
                <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
                    <div className='flex flex-row items-center space-x-5'>
                        <DynamicIcon name={category.logo_icon} />
                        <div>
                            <p>{category.title}</p>
                            <p className='sub'>{category.description}</p>
                        </div>
                    </div>
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-row space-x-5 items-center'>
                            <Pencil className='cursor-pointer' onClick={() => openEdit('category', category)} />
                            <Trash2
                                className='danger cursor-pointer'
                                onClick={() => openDelete('category', category)}
                            />
                        </div>
                    </div>
                </div>
                {category.subcategories.map(subcategory => (
                    <div
                        key={subcategory.id}
                        className='flex flex-row justify-between items-center w-full pl-20 p-5 border-border'
                    >
                        <div className='flex flex-row items-center space-x-5'>
                            <DynamicIcon name={subcategory.logo_icon} />
                            <div>
                                <p>{subcategory.title}</p>
                                <p className='sub'>{subcategory.description}</p>
                            </div>
                        </div>
                        <div className='flex flex-col items-center'>
                            <div className='flex flex-row space-x-5 items-center'>
                                <Pencil
                                    className='cursor-pointer'
                                    onClick={() => openEdit('subcategory', subcategory)}
                                />
                                <Trash2
                                    className='danger cursor-pointer'
                                    onClick={() => openDelete('subcategory', subcategory)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default function CategoryView() {
    const t = useTranslations()

    const [itemToDelete, setItemToDelete] = useState<ICategory | ISubcategory | null>(null)
    const [itemToEdit, setItemToEdit] = useState<ICategory | ISubcategory | null>(null)
    const [dialogNewOpen, setDialogNewOpen] = useState(false)
    const [dialogModel, setDialogModel] = useState<modelMode>('category')
    const [loading, setLoading] = useState(false)

    const [categoryList, setCategoryList] = useState<ICategory[]>([])
    const [backupCategoryList, setBackupCategoryList] = useState<ICategory[]>([])

    const [activeTab, setActiveTab] = useState('expenses')

    const fetchData = async () => {
        const res = await categoryService.read<ICategory[]>()

        setCategoryList(res)
        setBackupCategoryList(res)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value.toLowerCase()

        if (_.isEmpty(textToSearch)) {
            setCategoryList(backupCategoryList)
            return
        }

        const filteredList = backupCategoryList
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

        setCategoryList(filteredList)
    }

    const openDelete = (mode: modelMode, item: ICategory | ISubcategory) => {
        setDialogModel(mode)
        setItemToDelete(item)
    }

    const closeDelete = () => {
        setItemToDelete(null)
    }

    const openEdit = (mode: modelMode, item: ICategory | ISubcategory) => {
        setDialogModel(mode)
        setItemToEdit(item)
    }

    const closeEdit = () => {
        setItemToEdit(null)
    }

    const openNew = (mode: modelMode) => {
        setDialogModel(mode)
        setDialogNewOpen(true)
    }

    const onDelete = async () => {
        if (!itemToDelete) return

        setLoading(true)

        const service = dialogModel === 'category' ? categoryService : subcategoryService

        const res = await service.delete(itemToDelete?.id)

        setLoading(false)
        if (res) setItemToDelete(null)

        fetchData()
    }

    const saveCategory = async (formData: FormData) => {
        const resCategory = await categoryService.save(formData)
        const newList = categoryList.map(category => {
            if (category.id === resCategory.id) {
                return { ...category, ...resCategory }
            }
            return category
        })
        setCategoryList(newList)
        setBackupCategoryList(newList)
        setItemToEdit(null)
    }

    const saveSubcategory = async (formData: FormData) => {
        const resSubcategory = await subcategoryService.save(formData)

        const newList = categoryList.map(category => {
            if (category.id === resSubcategory.category_id) {
                return {
                    ...category,
                    subcategories: category.subcategories.map(subcategory => {
                        if (subcategory.id === resSubcategory.id) {
                            return resSubcategory
                        }
                        return subcategory
                    })
                }
            } else {
                // Remove subcategory if category_id is different
                return {
                    ...category,
                    subcategories: category.subcategories.filter(subcategory => subcategory.id !== resSubcategory.id)
                }
            }
        })

        setCategoryList(newList)
        setBackupCategoryList(newList)

        // Remove itemToEdit if category_id is different
        if (itemToEdit && 'category_id' in itemToEdit && itemToEdit.category_id !== resSubcategory.category_id) {
            setItemToEdit(null)
        }
    }

    const addNewCategory = async (formData: FormData) => {
        const resCategory: ICategory = await categoryService.add(formData)
        const newList = [...categoryList, resCategory].sort((a, b) => b.created_at.localeCompare(a.created_at))
        setCategoryList(newList)
        setBackupCategoryList(newList)
        setDialogNewOpen(false)
    }

    const addNewSubcategory = async (formData: FormData) => {
        const resSubcategory = await subcategoryService.add(formData)

        const newList = categoryList.map(category => {
            if (category.id === resSubcategory.category_id) {
                return {
                    ...category,
                    subcategories: [...category.subcategories, resSubcategory]
                }
            }
            return category
        })

        setCategoryList(newList)
        setBackupCategoryList(newList)
        setDialogNewOpen(false)
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
                                    <BreadcrumbLink href=''>{t('settings.manage.title')}</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t('categories.title')}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className='flex flex-row items-center space-x-8'>
                        <RotateCcw className='cursor-pointer' onClick={fetchData} />
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
                                        {categoryList.length > 0 && (
                                            <>
                                                <hr />
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
                {categoryList.length > 0 ? (
                    <Tabs defaultValue={activeTab} value={activeTab} className='p-0'>
                        {['expenses', 'income'].map(tab => (
                            <TabsContent key={tab} value={tab} className='m-0'>
                                <Box>
                                    <>
                                        {categoryList
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
                open={!_.isNil(itemToDelete)}
                closeDialog={closeDelete}
                loading={loading}
                onConfirm={onDelete}
            ></DeleteModal>

            <Modal
                open={dialogNewOpen && dialogModel === 'subcategory'}
                title={t('subcategories.modal.newTitle')}
                handleOpenChange={setDialogNewOpen}
            >
                <SubcategoryForm
                    categoryList={categoryList}
                    inEditingMode={false}
                    onSubmit={addNewSubcategory}
                    closeDialog={() => setDialogNewOpen(false)}
                />
            </Modal>

            <Modal
                open={dialogNewOpen && dialogModel === 'category'}
                title={t('categories.modal.newTitle')}
                handleOpenChange={setDialogNewOpen}
            >
                <CategoryForm
                    onSubmit={addNewCategory}
                    inEditingMode={false}
                    closeDialog={() => setDialogNewOpen(false)}
                />
            </Modal>

            <Modal
                open={!_.isNil(itemToEdit)}
                title={itemToEdit?.title || ''}
                icon={itemToEdit?.logo_icon}
                handleOpenChange={closeEdit}
            >
                {dialogModel === 'subcategory' ? (
                    <SubcategoryForm
                        initialData={itemToEdit as ISubcategory}
                        categoryList={categoryList}
                        inEditingMode={true}
                        onSubmit={saveSubcategory}
                        closeDialog={closeEdit}
                    />
                ) : (
                    <CategoryForm
                        initialData={itemToEdit as ICategory}
                        inEditingMode={true}
                        onSubmit={saveCategory}
                        closeDialog={closeEdit}
                    />
                )}
            </Modal>
        </>
    )
}
