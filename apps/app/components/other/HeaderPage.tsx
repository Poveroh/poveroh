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

    const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false)

    return (
        <>
            <header className='flex flex-row items-end justify-between'>
                <div className='flex flex-col space-y-3'>
                    <h2>{props.title}</h2>
                    {props.subtitle && <p className='text-muted-foreground'>{props.subtitle}</p>}
                    <Breadcrumb>
                        <BreadcrumbList>
                            {props.breadcrumbs?.map((item, index) => (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem>
                                        {item.href ? (
                                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {index < props.breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
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
                                    disabled={props.fetchAction?.loading}
                                    onClick={props.fetchAction?.onClick}
                                >
                                    {props.fetchAction?.loading ? (
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
                                                // disabled={props.downloadAction?.loading}
                                                disabled
                                                onClick={props.downloadAction?.onClick}
                                            >
                                                {props.downloadAction?.loading ? (
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
                                    disabled={props.onDeleteAll?.loading}
                                    onClick={() => setOpenDeleteAllDialog(true)}
                                >
                                    {props.onDeleteAll?.loading ? (
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
                        <Button onClick={props.addAction?.onClick} disabled={props.addAction?.loading}>
                            {props.addAction?.loading ? <Loader2 className='animate-spin mr-2' /> : <Plus />}
                            {t('buttons.add.base')}
                        </Button>
                    </div>
                </div>
            </header>

            <DeleteModal
                title={t('modal.confirmationDeleteAll.title')}
                description={t('modal.confirmationDeleteAll.description')}
                open={openDeleteAllDialog}
                closeDialog={() => setOpenDeleteAllDialog(false)}
                loading={props.onDeleteAll?.loading ?? false}
                onConfirm={props.onDeleteAll?.onClick ?? (() => {})}
            ></DeleteModal>
        </>
    )
}
