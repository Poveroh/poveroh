'use client'

import { useModal } from '@/hooks/use-modal'
import { ModalFooterProps } from '@/types/modal'
import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { cn } from '@poveroh/ui/lib/utils'
import { Loader2, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ModalFooter<T>(props: ModalFooterProps) {
    const t = useTranslations()

    const { keepAdding, inEditingMode, setKeepAddingChecked, loading, buttonDisabled, showSaveButton } = useModal<T>()

    return (
        <DialogFooter>
            <div
                className={cn('flex', {
                    'justify-end': !keepAdding.visibility,
                    'justify-between': keepAdding.visibility || inEditingMode,
                    'w-full': true
                })}
            >
                {inEditingMode && (
                    <Button type='button' variant='danger' onClick={props.onDeleteClick}>
                        <Trash />
                        {t('buttons.delete')}
                    </Button>
                )}
                {keepAdding.visibility && (
                    <div className='items-top flex space-x-2'>
                        <Checkbox
                            id='keepAdding'
                            checked={keepAdding.checked}
                            onChange={() => setKeepAddingChecked()}
                        />
                        <div className='grid gap-1.5 leading-none cursor-pointer'>
                            <label
                                htmlFor='keepAdding'
                                className='text-sm font-medium leading-none'
                                onClick={() => setKeepAddingChecked()}
                            >
                                {t('modal.continueInsert.label')}
                            </label>
                            <p className='text-sm text-muted-foreground'>{t('modal.continueInsert.subtitle')}</p>
                        </div>
                    </div>
                )}
                {showSaveButton && (
                    <div className='flex flex-row items-center space-x-2'>
                        <Button type='button' variant='outline' onClick={props.onCancel} className='w-full sm:w-auto'>
                            {t('buttons.cancel')}
                        </Button>
                        <Button type='submit' disabled={loading || buttonDisabled} onClick={props.onClick}>
                            {loading && <Loader2 className='animate-spin mr-2' />}
                            {t(props.confirmButtonText || 'buttons.save')}
                        </Button>
                    </div>
                )}
            </div>
        </DialogFooter>
    )
}
