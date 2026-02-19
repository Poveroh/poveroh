import { Skeleton } from '@poveroh/ui/components/skeleton'

export const DashboardGridSkeleton = () => {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <Skeleton className='col-span-12 h-[120px]' />
            <Skeleton className='col-span-12 md:col-span-6 h-[260px]' />
            <Skeleton className='col-span-12 md:col-span-6 h-[260px]' />
            <Skeleton className='col-span-12 md:col-span-4 h-[220px]' />
            <Skeleton className='col-span-12 md:col-span-4 h-[220px]' />
            <Skeleton className='col-span-12 md:col-span-4 h-[220px]' />
        </div>
    )
}
