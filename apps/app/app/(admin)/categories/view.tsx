'use client'

import { Button } from '@poveroh/ui/components/button'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

import { useTranslations } from 'next-intl'
import { Input } from '@poveroh/ui/components/input'
import { Download, Pencil, Plus, RotateCcw, Search } from 'lucide-react'
import Link from 'next/link'
import Box from '@/components/box/boxWrapper'
import _ from 'lodash'
import { CategoryService, SubcategoryService } from '@/services/category.service'
import { useEffect, useState } from 'react'
import { ICategory } from '@poveroh/types'
import { DeleteModal } from '@/components/modal/delete'
import DynamicIcon from '@/components/icon'

const categoryService = new CategoryService()
const subcategoryService = new SubcategoryService()

type ItemProps = {
    category: ICategory
    reload: () => void
}

function CategoryItem({ category, reload }: ItemProps) {
    const t = useTranslations()
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const logo_icon = `url(${category.logo_icon})`

    const onDelete = async () => {
        setLoading(true)

        const res = await categoryService.delete(category.id)

        setLoading(false)
        if (res) setOpen(false)

        reload()
    }

    return (
        <div className='flex flex-row justify-between items-center w-full p-5 border-border'>
            <div className='flex flex-row items-center space-x-5'>
                <div className='brands' style={{ backgroundImage: logo_icon }}></div>
                <DynamicIcon name='camera' />
                <div>
                    <p>{category.title}</p>
                    <p className='sub'>{category.description}</p>
                </div>
            </div>
            <div className='flex flex-col items-center'>
                <div className='flex flex-row space-x-5 items-center'>
                    <Link href={`/bank-accounts/${category.id}`}>
                        <Pencil className='cursor-pointer' />
                    </Link>
                    <DeleteModal
                        title={category.title}
                        description={t('bankAccounts.modal.deleteDescription')}
                        open={open}
                        setOpen={x => setOpen(x)}
                        loading={loading}
                        onConfirm={onDelete}
                    ></DeleteModal>
                </div>
            </div>
        </div>
    )
}

export default function CategoryView() {
    const t = useTranslations()

    const [activeTab, setActiveTab] = useState('expenses')

    const [categoryList, setCategoryList] = useState<ICategory[]>([])
    const [backupCategoryList, setBackupCategoryList] = useState<ICategory[]>([])

    const fetchData = async () => {
        const res = await categoryService.read<ICategory[]>()

        setCategoryList(res)
        setBackupCategoryList(res)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const onSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const textToSearch = event.target.value
    }

    return (
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
                    <RotateCcw className='cursor-pointer' onClick={() => {}} />
                    <div className='flex flex-row items-center space-x-3'>
                        <Button variant='outline'>
                            <Download></Download>
                        </Button>
                        <Link href='/bank-accounts/new'>
                            <Button>
                                <Plus />
                                {t('buttons.add.base')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div className='flex flex-row justify-between'>
                <Input startIcon={Search} placeholder={t('messages.search')} className='w-1/3' onChange={onSearch} />
                <Tabs defaultValue={activeTab} value={activeTab} className='w-[200px]' onValueChange={setActiveTab}>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value='expenses'>{t('transactions.types.expenses')}</TabsTrigger>
                        <TabsTrigger value='income'>{t('transactions.types.income')}</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            <Box>
                <Tabs defaultValue={activeTab} value={activeTab} className='p-0'>
                    <TabsContent value='expenses' className='m-0'>
                        {categoryList.map(category => (
                            <CategoryItem key={category.id} category={category} reload={fetchData} />
                        ))}
                    </TabsContent>
                    <TabsContent value='income'>password</TabsContent>
                </Tabs>
            </Box>
        </div>
    )
}
