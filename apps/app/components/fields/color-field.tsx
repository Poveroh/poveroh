'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@poveroh/ui/components/form'
import { FieldValues, Path, Control } from 'react-hook-form'
import { cn } from '@poveroh/ui/lib/utils'
import { memo, useRef } from 'react'

const PRESET_COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#A855F7', // Violet
    '#F59E0B', // Amber
    '#64748B' // Gray
]

type ColorButtonProps = {
    color: string
    isSelected: boolean
    onClick: () => void
}

const ColorButton = memo(({ color, isSelected, onClick }: ColorButtonProps) => (
    <button
        type='button'
        onClick={onClick}
        className={cn(
            'w-7 h-7 rounded-full transition-all cursor-pointer',
            isSelected ? 'ring-2 ring-offset-1 ring-primary scale-110' : 'hover:scale-105'
        )}
        style={{ backgroundColor: color }}
    />
))

ColorButton.displayName = 'ColorButton'

type ColorFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    label: string
    mandatory?: boolean
}

export function ColorField<T extends FieldValues>({ control, name, label, mandatory = false }: ColorFieldProps<T>) {
    const colorInputRef = useRef<HTMLInputElement>(null)
    const previewRef = useRef<HTMLDivElement>(null)

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const isCustomColor = !PRESET_COLORS.includes(field.value)

                return (
                    <FormItem>
                        <FormLabel mandatory={mandatory}>{label}</FormLabel>
                        <FormControl>
                            <div className='flex flex-row gap-3'>
                                {PRESET_COLORS.map(color => (
                                    <ColorButton
                                        key={color}
                                        color={color}
                                        isSelected={field.value === color}
                                        onClick={() => field.onChange(color)}
                                    />
                                ))}
                                <div className='relative w-7 h-7'>
                                    <input
                                        ref={colorInputRef}
                                        type='color'
                                        defaultValue={field.value}
                                        onInput={e => {
                                            if (previewRef.current) {
                                                previewRef.current.style.backgroundColor = e.currentTarget.value
                                            }
                                        }}
                                        onChange={e => field.onChange(e.target.value)}
                                        className='absolute inset-0 w-full h-full rounded-full cursor-pointer opacity-0'
                                    />
                                    <div
                                        ref={previewRef}
                                        className={cn(
                                            'w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center pointer-events-none',
                                            isCustomColor ? 'ring-2 ring-offset-1 ring-primary scale-110' : ''
                                        )}
                                        style={{
                                            backgroundColor: isCustomColor ? field.value : 'transparent'
                                        }}
                                    >
                                        {!isCustomColor && <span className='text-muted-foreground text-xs'>+</span>}
                                    </div>
                                </div>
                            </div>
                        </FormControl>
                    </FormItem>
                )
            }}
        />
    )
}
