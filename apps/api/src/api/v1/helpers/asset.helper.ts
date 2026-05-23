import { Prisma } from '@poveroh/prisma'

export const assetInclude = {
    marketable: true,
    realEstate: true,
    collectible: true,
    privateDeal: true,
    vehicle: true,
    insurance: true,
    transactions: {
        where: { deletedAt: null },
        orderBy: { date: 'desc' as const }
    }
} satisfies Prisma.AssetInclude

export type AssetWithRelations = Prisma.AssetGetPayload<{ include: typeof assetInclude }>

// Normalizes nullable dates into ISO strings so API responses stay stable.
export function toIsoString(value: Date | string | null | undefined): string | null {
    if (!value) return null
    return value instanceof Date ? value.toISOString() : value
}

// Converts a Prisma Decimal to a plain number; returns null if the input is null/undefined.
export function toNumber(value: Prisma.Decimal | number | string | null | undefined): number | null {
    if (value == null) return null
    return typeof value === 'object' && 'toNumber' in value ? value.toNumber() : Number(value)
}
