import { Button } from '@poveroh/ui/components/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@poveroh/ui/components/alert-dialog'

import { IItem } from '@poveroh/types'

function AlertDialogDemo() {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant='outline'>Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and
                        remove your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function Page() {
    const t: IItem = {
        label: 'ciaop',
        value: 'cia'
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-svh'>
            <div className='flex mb-10 flex-col items-center justify-center gap-4'>
                <h1 className='text-2xl font-bold'>Hello World</h1>
                <Button size='sm'>{t.value}</Button>
            </div>
            <AlertDialogDemo />
        </div>
    )
}
