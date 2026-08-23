import { Skeleton } from '@poveroh/ui/components/skeleton'

type BankAccountMappingSkeletonProps = {
    repeat?: number
}

export function BankAccountMappingSkeleton({ repeat = 4 }: BankAccountMappingSkeletonProps) {
    return (
        <div className='flex flex-col space-y-4 w-full'>
            {Array.from({ length: repeat }).map((_, index) => (
                <div key={index} className='flex items-center justify-between gap-4 border-b border-hr pb-4'>
                    <div className='flex flex-col space-y-2'>
                        <Skeleton className='h-4 w-[160px]' />
                        <Skeleton className='h-3 w-[80px]' />
                    </div>
                    <Skeleton className='h-11 w-64 shrink-0' />
                </div>
            ))}
        </div>
    )
}
