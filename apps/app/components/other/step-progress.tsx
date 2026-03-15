import { OnBoardingStepEnum } from '@poveroh/types/contracts'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { useTranslations } from 'next-intl'
import { useOnBoardingStepOrder } from '@/hooks/use-onboarding-step-order'

type StepLineProps = {
    active: boolean
    tooltip: string
}

function StepLine({ active, tooltip }: StepLineProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={`block h-[5px] w-full rounded ${active ? 'bg-brand-color-2' : 'bg-secondary'}`}></div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    )
}

type StepProgressProps = {
    current: OnBoardingStepEnum
}

export function StepProgress({ current }: StepProgressProps) {
    const t = useTranslations()
    const { isAtLeast } = useOnBoardingStepOrder()

    return (
        <div className='w-full flex flex-row space-x-2'>
            <StepLine active={isAtLeast(current, 'EMAIL')} tooltip={t('signup.steps.1.tooltip')} />
            <StepLine active={isAtLeast(current, 'GENERALITES')} tooltip={t('signup.steps.2.tooltip')} />
            <StepLine active={isAtLeast(current, 'PREFERENCES')} tooltip={t('signup.steps.3.tooltip')} />
        </div>
    )
}
