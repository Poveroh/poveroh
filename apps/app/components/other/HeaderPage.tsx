import { IBreadcrumb } from '@/types/breadcrumb'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@poveroh/ui/components/breadcrumb'
import { Popover, PopoverContent, PopoverTrigger } from '@poveroh/ui/components/popover'
import { Button } from '@poveroh/ui/components/button'
import { Download, Ellipsis, Loader2, Plus, RotateCcw, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { DeleteModal } from '../modal/DeleteModal'
import { cn } from '@poveroh/ui/lib/utils'

type HeaderAction = {
    onClick: () => void
    loading: boolean
}

type HeaderProps = {
    title: string
    subtitle?: string
    breadcrumbs: IBreadcrumb[]
    fetchAction?: HeaderAction
    uploadAction?: HeaderAction
    downloadAction?: HeaderAction
    onDeleteAll?: HeaderAction
    addAction?: HeaderAction
}

export function Header(props: HeaderProps) {
    const t = useTranslations()

    const { title, subtitle, breadcrumbs, fetchAction, uploadAction, downloadAction, onDeleteAll, addAction } = props

    const showHeaderActions = fetchAction || uploadAction || downloadAction || onDeleteAll || addAction

    const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false)

    return (
        <>
            <header className={cn('flex flex-row items-end', showHeaderActions ? 'justify-between' : 'justify-start')}>
                <div className='flex flex-col space-y-3'>
                    <h2>{title}</h2>
                    {subtitle && <p className='text-muted-foreground'>{subtitle}</p>}
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs?.map((item, index) => (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem>
                                        {item.href ? (
                                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {showHeaderActions ? (
                    <div className='flex flex-row items-center space-x-4'>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size='icon' variant='ghost'>
                                    <Ellipsis />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align='end'>
                                <div className='flex flex-col'>
                                    <Button
                                        variant='ghost'
                                        className='justify-start w-full'
                                        disabled={fetchAction?.loading}
                                        onClick={fetchAction?.onClick}
                                    >
                                        {fetchAction?.loading ? (
                                            <Loader2 className='animate-spin mr-2' />
                                        ) : (
                                            <RotateCcw className='mr-2' />
                                        )}
                                        {t('buttons.refresh')}
                                    </Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span tabIndex={0}>
                                                <Button
                                                    variant='ghost'
                                                    className='justify-start w-full'
                                                    // disabled={downloadAction?.loading}
                                                    disabled
                                                    onClick={downloadAction?.onClick}
                                                >
                                                    {downloadAction?.loading ? (
                                                        <Loader2 className='animate-spin mr-2' />
                                                    ) : (
                                                        <Download className='mr-2' />
                                                    )}
                                                    {t('buttons.export.base')}
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{t('messages.availableNextVersion')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Button
                                        variant='ghost'
                                        className='justify-start w-full'
                                        disabled={onDeleteAll?.loading}
                                        onClick={() => setOpenDeleteAllDialog(true)}
                                    >
                                        {onDeleteAll?.loading ? (
                                            <Loader2 className='animate-spin mr-2' />
                                        ) : (
                                            <Trash className='mr-2 danger' />
                                        )}
                                        <span className='danger'>{t('buttons.deleteAll')}</span>
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className='flex flex-row items-center space-x-3'>
                            <Button onClick={addAction?.onClick} disabled={addAction?.loading}>
                                {addAction?.loading ? <Loader2 className='animate-spin mr-2' /> : <Plus />}
                                {t('buttons.add.base')}
                            </Button>
                        </div>
                    </div>
                ) : null}
            </header>

            <DeleteModal
                title={t('modal.confirmationDeleteAll.title')}
                description={t('modal.confirmationDeleteAll.description')}
                open={openDeleteAllDialog}
                closeDialog={() => setOpenDeleteAllDialog(false)}
                loading={onDeleteAll?.loading ?? false}
                onConfirm={onDeleteAll?.onClick ?? (() => {})}
            ></DeleteModal>
        </>
    )
}
