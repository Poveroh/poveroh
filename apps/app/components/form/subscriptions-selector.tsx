import { useTranslations } from 'next-intl'
import { GroupedBrands, IBrand } from '@poveroh/types'
import { useEffect, useMemo, useState } from 'react'
import { CardHorizontal } from '../card/card-horizontal'
import { groupBrandByCategory } from '@/utils/brands'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@poveroh/ui/components/tabs'
import { Input } from '@poveroh/ui/components/input'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

type FormProps = {
    dataCallback: (brand: IBrand) => void
    closeDialog: () => void
}

type CardListProps = {
    brandList: IBrand[]
    dataCallback: (brand: IBrand) => void
}

const CardList = ({ brandList, dataCallback }: CardListProps) => {
    return (
        <div className='grid grid-cols-2 gap-2'>
            {brandList.map((brand, index) => (
                <CardHorizontal
                    key={index}
                    onClick={() => dataCallback(brand)}
                    title={brand.name}
                    logo={brand.logo}
                    color={brand.color}
                />
            ))}
        </div>
    )
}

export const SubscriptionsSelector = ({ dataCallback }: FormProps) => {
    const t = useTranslations()

    const [brands, setBrands] = useState<IBrand[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [activeTab, setActiveTab] = useState<string>('')

    useEffect(() => {
        const loadBrands = async () => {
            try {
                const res = await fetch('/brands/brands.json')
                const data: IBrand[] = await res.json()
                setBrands(data)
            } catch (error) {
                console.error('Failed to load brands:', error)
            }
        }

        loadBrands()
    }, [])

    const groupedBrands: GroupedBrands = useMemo(() => groupBrandByCategory(brands), [brands])

    const filteredBrands: IBrand[] = useMemo(() => {
        if (!searchQuery) return brands
        const query = searchQuery.toLowerCase()
        return brands.filter(brand => brand.name.toLowerCase().includes(query))
    }, [brands, searchQuery])

    useEffect(() => {
        if (Object.keys(groupedBrands).length && !activeTab) {
            setActiveTab(Object.keys(groupedBrands)[0] || '')
        }
    }, [groupedBrands, activeTab])

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value)
    }

    return (
        <div className='flex flex-col space-y-4 h-full overflow-y-hidden'>
            <Input placeholder={t('messages.search')} value={searchQuery} onChange={handleSearch} />

            {searchQuery ? (
                <div className='overflow-y-auto grow'>
                    {filteredBrands.length > 0 ? (
                        <CardList brandList={filteredBrands} dataCallback={dataCallback}></CardList>
                    ) : (
                        <p className='text-center text-gray-500'>No result</p>
                    )}
                </div>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-col grow overflow-y-auto'>
                    <div className='relative rounded-sm'>
                        <SimpleBar>
                            <TabsList>
                                {Object.keys(groupedBrands).map(category => (
                                    <TabsTrigger key={category} value={category}>
                                        {t(`brand.categories.${category}`)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </SimpleBar>
                    </div>
                    {Object.entries(groupedBrands).map(([category, brands]) => (
                        <TabsContent key={category} value={category} className='grow overflow-y-auto'>
                            <CardList brandList={brands} dataCallback={dataCallback}></CardList>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    )
}
