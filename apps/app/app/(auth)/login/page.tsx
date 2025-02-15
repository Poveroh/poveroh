import { useTranslations } from 'next-intl'

export default function LoginPage() {
    const t = useTranslations('login')

    return <div>{t('title')}</div>
}
