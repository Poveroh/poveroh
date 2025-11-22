import { useUser } from '@/hooks/use-user'
import { OnBoardingStep } from '@poveroh/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@poveroh/ui/components/tooltip'
import { useTranslations } from 'next-intl'

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
    current: OnBoardingStep
}

export function StepProgress({ current }: StepProgressProps) {
    const t = useTranslations()

    return (
        <div className='w-full flex flex-row space-x-2'>
            <StepLine active={current >= OnBoardingStep.EMAIL} tooltip={t('signup.steps.1.tooltip')} />
            <StepLine active={current >= OnBoardingStep.GENERALITIES} tooltip={t('signup.steps.2.tooltip')} />
            <StepLine active={current >= OnBoardingStep.PREFERENCES} tooltip={t('signup.steps.3.tooltip')} />
        </div>
    )
}
