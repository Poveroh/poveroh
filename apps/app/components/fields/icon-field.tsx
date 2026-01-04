import { FormControl, FormItem, FormLabel } from '@poveroh/ui/components/form'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { IconFieldProps } from '@/types'
import DynamicIcon from '../icon/dynamic-icon'
import { iconList as defaultIconList } from '../icon'

export function IconField({
    label,
    iconList = defaultIconList,
    selectedIcon,
    onIconChange,
    disabled = false,
    mandatory = true,
    showError = false,
    errorMessage
}: IconFieldProps) {
    return (
        <TooltipProvider>
            <div className='flex flex-col space-y-4'>
                <FormItem>
                    <FormLabel mandatory={mandatory}>{label}</FormLabel>
                    <FormControl>
                        <div className='grid grid-cols-12 gap-5 rounded-md box-border'>
                            {iconList.map((iconName: string) => {
                                return (
                                    <Tooltip key={iconName}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={`box-border p-1 cursor-pointer flex justify-center items-center rounded-md h-8 w-8
                                                    ${selectedIcon === iconName ? 'bg-white text-black border border-hr' : ''}
                                                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => {
                                                    if (!disabled) {
                                                        onIconChange(iconName)
                                                    }
                                                }}
                                            >
                                                <DynamicIcon name={iconName} className='w-5 h-5' />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{iconName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </FormControl>
                    {showError && errorMessage && <p className='danger'>{errorMessage}</p>}
                </FormItem>
            </div>
        </TooltipProvider>
    )
}
