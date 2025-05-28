import { useTranslations } from 'next-intl'
import { GroupedBrands, IBrand } from '@poveroh/types'
import { useEffect, useState } from 'react'
import { CardHorizontal } from '../card/CardHorizontal'
import { groupBrandByCategory } from '@/utils/brands'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'

type FormProps = {
    dataCallback: (brand: IBrand) => void
    closeDialog: () => void
}

export const SubscriptionsSelector = ({ dataCallback }: FormProps) => {
    const t = useTranslations()

    const [groupedBrands, setGroupedBrands] = useState<GroupedBrands>({})

    const [activeTab, setActiveTab] = useState<string>('')

    useEffect(() => {
        fetch('/brands/brands.json')
            .then(res => res.json())
            .then((data: IBrand[]) => setGroupedBrands(groupBrandByCategory(data)))
    }, [])

    useEffect(() => {
        const firstCategory = Object.keys(groupedBrands)[0] || ''
        setActiveTab(firstCategory)
    }, [groupedBrands])

    return (
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className='w-full h-[60vh]'>
            <div className='relative rounded-sm overflow-x-scroll h-16'>
                <TabsList>
                    {groupedBrands &&
                        Object.entries(groupedBrands).map(([category]) => (
                            <TabsTrigger key={category} value={category}>
                                {t(`brand.categories.${category}`)}
                            </TabsTrigger>
                        ))}
                </TabsList>
            </div>
            {groupedBrands &&
                Object.entries(groupedBrands).map(([category, brands]) => (
                    <TabsContent key={category} value={category} className='grow overflow-y-auto'>
                        <div className='grid grid-cols-2 gap-2 '>
                            {brands.map(brand => (
                                <CardHorizontal
                                    onClick={() => dataCallback(brand)}
                                    key={brand.name}
                                    title={brand.name}
                                    logo={brand.logo}
                                    color={brand.color}
                                />
                            ))}
                        </div>
                    </TabsContent>
                ))}
        </Tabs>
    )
}
