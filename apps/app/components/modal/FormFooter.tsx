'use client'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type ModalFooterProps = {
    loading: boolean
    inEditingMode: boolean
    keepAdding: {
        checked: boolean
        hide: boolean
        setKeepAdding: () => void
    }
    buttonDisabled?: boolean
    showSaveButton?: boolean
    confirmButtonText?: string
    onClick: () => void
}

export function ModalFooter(props: ModalFooterProps) {
    const t = useTranslations()
    const { loading, inEditingMode, keepAdding, onClick } = props

    return (
        <DialogFooter>
            <div
                className={'flex ' + (inEditingMode || keepAdding.hide ? 'justify-end' : 'justify-between') + ' w-full'}
            >
                {!inEditingMode ||
                    (!keepAdding.hide && (
                        <div className='items-top flex space-x-2'>
                            <Checkbox
                                id='keepAdding'
                                checked={keepAdding.checked}
                                onChange={() => keepAdding.setKeepAdding()}
                            />
                            <div className='grid gap-1.5 leading-none cursor-pointer'>
                                <label
                                    htmlFor='keepAdding'
                                    className='text-sm font-medium leading-none'
                                    onClick={keepAdding.setKeepAdding}
                                >
                                    {t('modal.continueInsert.label')}
                                </label>
                                <p className='text-sm text-muted-foreground'>{t('modal.continueInsert.subtitle')}</p>
                            </div>
                        </div>
                    ))}
                {props.showSaveButton && (
                    <Button type='submit' disabled={loading || props.buttonDisabled} onClick={onClick}>
                        {loading && <Loader2 className='animate-spin mr-2' />}{' '}
                        {t(props.confirmButtonText || 'buttons.save')}
                    </Button>
                )}
            </div>
        </DialogFooter>
    )
}
