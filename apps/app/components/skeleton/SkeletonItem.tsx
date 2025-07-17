import { Skeleton } from '@poveroh/ui/components/skeleton'

type SkeletonItemProps = {
    repeat?: number
}

function SkeletonItemContent() {
    return (
        <div className='flex flex-row items-center justify-between space-x-2'>
            <div className='flex flex-row items-center space-x-2'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-[150px]' />
                    <Skeleton className='h-4 w-[200px]' />
                </div>
            </div>
            <div className='flex flex-col space-y-2 justify-end items-end'>
                <Skeleton className='h-4 w-[150px]' />
                <Skeleton className='h-4 w-[200px]' />
            </div>
        </div>
    )
}

export default function SkeletonItem({ repeat = 1 }: SkeletonItemProps) {
    return Array.from({ length: repeat }).map((_, index) => <SkeletonItemContent key={index} />)
}
