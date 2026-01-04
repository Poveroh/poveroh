'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@poveroh/ui/components/form'
import { FieldValues, Path, Control } from 'react-hook-form'
import { cn } from '@poveroh/ui/lib/utils'
import { useMemo, useRef } from 'react'

const PRESET_COLORS = [
    '#EF4444', // Rosso
    '#F97316', // Arancione
    '#EAB308', // Giallo
    '#22C55E', // Verde
    '#3B82F6', // Blu
    '#8B5CF6', // Viola
    '#EC4899', // Rosa
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#A855F7', // Purple
    '#F59E0B', // Ambra
    '#64748B' // Grigio
]

type ColorFieldProps<T extends FieldValues> = {
    control: Control<T>
    name: Path<T>
    label: string
    mandatory?: boolean
}

export function ColorField<T extends FieldValues>({ control, name, label, mandatory = false }: ColorFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const isCustomColor = !PRESET_COLORS.includes(field.value)
                const colorInputRef = useRef<HTMLInputElement>(null)

                return (
                    <FormItem>
                        <FormLabel mandatory={mandatory}>{label}</FormLabel>
                        <FormControl>
                            <div className='flex flex-row gap-3'>
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type='button'
                                        onClick={() => field.onChange(color)}
                                        className={cn(
                                            'w-7 h-7 rounded-full transition-all cursor-pointer',
                                            field.value === color
                                                ? 'ring-2 ring-offset-1 ring-primary scale-110'
                                                : 'hover:scale-105'
                                        )}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <div className='relative w-7 h-7'>
                                    <input
                                        ref={colorInputRef}
                                        type='color'
                                        value={field.value}
                                        onChange={e => field.onChange(e.target.value)}
                                        className='absolute inset-0 w-full h-full rounded-full cursor-pointer opacity-0'
                                    />
                                    <div
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
