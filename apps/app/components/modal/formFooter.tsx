'use client'

import { Button } from '@poveroh/ui/components/button'
import { Checkbox } from '@poveroh/ui/components/checkbox'
import { DialogFooter } from '@poveroh/ui/components/dialog'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type ModalFooterProps = {
    loading: boolean
    inEditingMode: boolean
    keepAdding: boolean
    setKeepAdding: () => void
    onClick: () => void
}

export function ModalFooter(props: ModalFooterProps) {
    const t = useTranslations()
    const { loading, inEditingMode, keepAdding, setKeepAdding, onClick } = props

    return (
        <DialogFooter>
            <div className={'flex ' + (inEditingMode ? 'justify-end' : 'justify-between') + ' w-full'}>
                {!inEditingMode && (
                    <div className='items-top flex space-x-2'>
                        <Checkbox id='keepAdding' checked={keepAdding} onChange={() => setKeepAdding()} />
                        <div className='grid gap-1.5 leading-none cursor-pointer'>
                            <label
                                htmlFor='keepAdding'
                                className='text-sm font-medium leading-none'
                                onClick={setKeepAdding}
                            >
                                {t('modal.continueInsert.label')}
                            </label>
                            <p className='text-sm text-muted-foreground'>{t('modal.continueInsert.subtitle')}</p>
                        </div>
                    </div>
                )}
                <Button type='submit' disabled={loading} onClick={onClick}>
                    {loading && <Loader2 className='animate-spin mr-2' />} {t('buttons.save')}
                </Button>
            </div>
        </DialogFooter>
    )
}
