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
import { Download, Ellipsis, Loader2, Plus, RotateCcw, Trash, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { DeleteModal } from '../modal/delete-modal'
import { cn } from '@poveroh/ui/lib/utils'

type HeaderAction = {
    onClick: () => void
    loading: boolean
    disabled?: boolean
    label?: string
    icon?: React.ReactNode
}

type HeaderProps = {
    title: string
    titleSize?: 'default' | 'compact'
    subtitle?: string
    breadcrumbs: IBreadcrumb[]
    fetchAction?: HeaderAction
    uploadAction?: HeaderAction
    downloadAction?: HeaderAction
    onDeleteAll?: HeaderAction
    addAction?: HeaderAction | HeaderAction[]
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
                    {props.titleSize === 'compact' ? <h4 className='bold'>{title}</h4> : <h3>{title}</h3>}
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
                                        disabled={onDeleteAll?.loading || onDeleteAll?.disabled}
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

                        {uploadAction && (
                            <Button onClick={uploadAction?.onClick} variant='ghost' disabled={uploadAction?.loading}>
                                {uploadAction?.loading ? <Loader2 className='animate-spin mr-2' /> : <Upload />}
                            </Button>
                        )}

                        {Array.isArray(addAction) ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button>
                                        <Plus />
                                        {t('buttons.add.base')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align='end'>
                                    <div className='flex flex-col'>
                                        {addAction.map((action, index) => (
                                            <Button
                                                key={index}
                                                variant='ghost'
                                                className='justify-start w-full'
                                                disabled={action.loading || action.disabled}
                                                onClick={action.onClick}
                                            >
                                                {action.loading ? (
                                                    <Loader2 className='animate-spin mr-2' />
                                                ) : (
                                                    (action.icon ?? <Plus className='mr-2' />)
                                                )}
                                                {action.label ?? t('buttons.add.base')}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <Button onClick={addAction?.onClick} disabled={addAction?.loading}>
                                {addAction?.loading ? <Loader2 className='animate-spin mr-2' /> : <Plus />}
                                {addAction?.label ?? t('buttons.add.base')}
                            </Button>
                        )}
                    </div>
                ) : null}
            </header>

            <DeleteModal
                title={t('modal.confirmationDeleteAll.title')}
                description={t('modal.confirmationDeleteAll.description')}
                open={openDeleteAllDialog}
                closeDialog={() => setOpenDeleteAllDialog(false)}
                loading={onDeleteAll?.loading ?? false}
                onConfirm={() => {
                    try {
                        onDeleteAll?.onClick()
                    } finally {
                        setOpenDeleteAllDialog(false)
                    }
                }}
            ></DeleteModal>
        </>
    )
}
