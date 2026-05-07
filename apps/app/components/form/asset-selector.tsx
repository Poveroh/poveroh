import { useTranslations } from 'next-intl'
import 'simplebar-react/dist/simplebar.min.css'
import { Card } from '../card/card'
import { ASSETS_CONFIG } from '@/config/assets'

type FormProps = {
    dataCallback: (asset: string) => void
}

export const AssetSelector = ({ dataCallback }: FormProps) => {
    const t = useTranslations()

    return (
        <div className='flex flex-col space-y-6 h-full overflow-y-hidden'>
            <div className='overflow-y-auto grow'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {ASSETS_CONFIG.map((asset, index) => (
                        <Card
                            key={index}
                            title={t(asset.title)}
                            subtitle={t(asset.subtitle)}
                            icon={asset.icons}
                            onClick={() => dataCallback(asset.modalId)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
