import { CurrencyEnum } from '@poveroh/types'
import { Prisma } from '@prisma/client'

export const assetInclude = {
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true,
    other: true,
    transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'desc' as const }
    }
} satisfies Prisma.AssetInclude

export type AssetWithRelations = Prisma.AssetGetPayload<{ include: typeof assetInclude }>

export type ActiveAsset = {
    id: string
    quantity: number
    currentValue: number
    currency: CurrencyEnum
}
