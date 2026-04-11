'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Control, FieldValues, Path } from 'react-hook-form'

import { Popover, PopoverTrigger, PopoverContent } from '@poveroh/ui/components/popover'
import { Button } from '@poveroh/ui/components/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@poveroh/ui/components/tabs'
import { Pencil } from 'lucide-react'

import DynamicIcon from '../icon/dynamic-icon'
import { BrandIcon } from '../icon/brand-icon'
import { IconField } from './icon-field'
import { ColorField } from './color-field'
import { FileUploadField } from './file-upload-field'
import { ActiveTab } from '@/types'

type PopoverIconLogoProps<T extends FieldValues> = {
    control: Control<T>
    colorFieldName?: Path<T>
    selectedIcon?: string
    selectedColor?: string
    logoUrl?: string
    onIconChange?: (iconName: string) => void
    onFileChange?: (files: FileList | null) => void
    enableIcon?: boolean
    enableLogo?: boolean
    inEditingMode?: boolean
}

export function PopoverIconLogo<T extends FieldValues>({
    control,
    colorFieldName,
    selectedIcon,
    selectedColor = '#818a66',
    logoUrl,
    onIconChange,
    onFileChange,
    enableIcon = true,
    enableLogo = true,
    inEditingMode = false
}: PopoverIconLogoProps<T>) {
    const t = useTranslations()

    const [activeTab, setActiveTab] = useState<ActiveTab>(logoUrl && enableLogo ? 'logo' : enableIcon ? 'icon' : 'logo')
    const [previewLogoUrl, setPreviewLogoUrl] = useState<string | undefined>(logoUrl)
    const [selectedFile, setSelectedFile] = useState<FileList | null>(null)

    useEffect(() => {
        setPreviewLogoUrl(logoUrl)
        if (logoUrl && enableLogo) {
            setActiveTab('logo')
        }
    }, [logoUrl, enableLogo])

    const fileInputRef = useRef<HTMLInputElement>(null)
    const logoOnly = enableLogo && !enableIcon

    const handleFileChange = (files: FileList | null) => {
        setSelectedFile(files)
        if (files && files.length > 0) {
            const url = URL.createObjectURL(files[0]!)
            setPreviewLogoUrl(url)
        } else {
            setPreviewLogoUrl(logoUrl)
        }
        onFileChange?.(files)
    }

    const handleLogoOnlyClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileChange(e.target.files)
    }

    const renderPreview = () => {
        if ((activeTab === 'logo' || logoOnly) && previewLogoUrl) {
            return <BrandIcon icon={previewLogoUrl} size='xl' circled />
        }

        if (activeTab === 'icon' && selectedIcon) {
            return (
                <div
                    className='flex items-center justify-center w-[50px] h-[50px] rounded-full'
                    style={{
                        backgroundColor: selectedColor ? `${selectedColor}20` : 'hsl(var(--muted))',
                        color: selectedColor || 'hsl(var(--foreground))'
                    }}
                >
                    <DynamicIcon name={selectedIcon} className='w-5 h-5' />
                </div>
            )
        }

        return (
            <div className='flex items-center justify-center w-[50px] h-[50px] rounded-full bg-muted'>
                <DynamicIcon name='image' className='w-5 h-5 text-muted-foreground' />
            </div>
        )
    }

    if (logoOnly) {
        return (
            <div className='relative w-fit h-fit'>
                {renderPreview()}

                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleFileInputChange}
                />

                <div className='absolute bottom-[-8px] right-[-8px]'>
                    <Button
                        size='icon'
                        variant='secondary'
                        className='rounded-full w-7 h-7'
                        onClick={handleLogoOnlyClick}
                        type='button'
                    >
                        <Pencil className='w-2 h-2' />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className='relative w-fit h-fit'>
            {renderPreview()}

            <div className='absolute bottom-[-8px] right-[-8px]'>
                <Popover>
                    <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button size='icon' variant='secondary' className='rounded-full w-7 h-7'>
                            <Pencil className='w-2 h-2' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='w-[500px] max-h-[400px] overflow-hidden p-0'>
                        <div className='overflow-y-auto max-h-[400px] p-4' onWheel={e => e.stopPropagation()}>
                            {enableIcon && enableLogo ? (
                                <Tabs
                                    value={activeTab}
                                    onValueChange={v => setActiveTab(v as ActiveTab)}
                                    className='w-full'
                                >
                                    <TabsList className='w-full'>
                                        <TabsTrigger value='icon' className='flex-1'>
                                            {t('form.icon.label')}
                                        </TabsTrigger>
                                        <TabsTrigger value='logo' className='flex-1'>
                                            {t('form.logo.label')}
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value='icon'>
                                        <div className='flex flex-col space-y-6 pt-4'>
                                            {colorFieldName && (
                                                <ColorField
                                                    control={control}
                                                    name={colorFieldName}
                                                    label={t('form.color.label')}
                                                    mandatory
                                                />
                                            )}
                                            <IconField
                                                label={t('form.icon.label')}
                                                selectedIcon={selectedIcon}
                                                onIconChange={name => onIconChange?.(name)}
                                                mandatory={!inEditingMode}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='logo'>
                                        <div className='flex flex-col space-y-6 pt-4'>
                                            <FileUploadField
                                                label={t('form.logo.label')}
                                                toUploadMessage={t('messages.toUpload')}
                                                accept='image/*'
                                                mandatory={!inEditingMode}
                                                file={selectedFile}
                                                onFileChange={handleFileChange}
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            ) : (
                                <div className='flex flex-col space-y-6'>
                                    {colorFieldName && (
                                        <ColorField
                                            control={control}
                                            name={colorFieldName}
                                            label={t('form.color.label')}
                                            mandatory
                                        />
                                    )}
                                    <IconField
                                        label={t('form.icon.label')}
                                        selectedIcon={selectedIcon}
                                        onIconChange={name => onIconChange?.(name)}
                                        mandatory={!inEditingMode}
                                    />
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
