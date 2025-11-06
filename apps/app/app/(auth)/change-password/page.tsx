import Link from 'next/link'

export const metadata = {
    title: 'Change or reset password'
}

export default function ChangePasswordPage() {
    return (
        <main className='container mx-auto max-w-md py-12'>
            <h1 className='text-2xl font-semibold mb-4'>Reset your password</h1>
            <p className='text-muted-foreground mb-6'>
                If you forgot your password, please sign in after requesting a reset link from support, or contact an
                administrator. If you&apos;re already signed in, you can change your password from Settings → Account →
                Security.
            </p>
            <div className='flex gap-3'>
                <Link href='/sign-in' className='underline'>
                    Go to sign in
                </Link>
                <Link href='/' className='underline'>
                    Back to home
                </Link>
            </div>
        </main>
    )
}
