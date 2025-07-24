import { AppearanceMode } from '@poveroh/types/dist'
import { DialogDescription, DialogHeader, DialogTitle } from '@poveroh/ui/components/dialog'
import { BrandIcon } from '../icon/BrandIcon'
import DynamicIcon from '../icon/DynamicIcon'
import { ModalHeaderProps } from '@/types/modal'

export function ModalHeader({ title, description, decoration }: ModalHeaderProps) {
    return (
        <DialogHeader>
            <div className='flex flex-row items-center space-x-3'>
                {decoration?.iconLogo &&
                    (decoration?.iconLogo.mode === AppearanceMode.LOGO ? (
                        <BrandIcon
                            circled={decoration?.iconLogo.circled}
                            icon={decoration?.iconLogo.name}
                            size='xl'
                        ></BrandIcon>
                    ) : (
                        <DynamicIcon key={decoration?.iconLogo.name} name={decoration?.iconLogo.name} />
                    ))}
                <div className='flex flex-col space-y-1'>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </div>
            </div>
        </DialogHeader>
    )
}
