import { toIsoString, toNumber } from '@/utils'
import prisma, { Prisma } from '@poveroh/prisma'
import type {
    AutoDepreciationData,
    AutoDepreciationInput,
    CyclePeriodEnum,
    DepreciationBaseEnum,
    DepreciationValueTypeEnum
} from '@poveroh/types'
import { CyclePeriod, DepreciationBase, DepreciationValueType } from '@prisma/client'

export const autoDepreciationSelect = {
    startDate: true,
    endDate: true,
    depreciationBase: true,
    depreciationType: true,
    depreciationValue: true,
    cyclePeriod: true,
    cycleNumber: true
} satisfies Prisma.AutoDepreciationSelect

type AutoDepreciationRow = Prisma.AutoDepreciationGetPayload<{ select: typeof autoDepreciationSelect }>

/**
 * Normalizes a Prisma auto depreciation row into the API DTO by converting Decimal and Date values into JSON-friendly types.
 * @param row The Prisma auto depreciation row to convert.
 * @returns The normalized auto depreciation data.
 */
export function toAutoDepreciationData(row: AutoDepreciationRow): AutoDepreciationData {
    return {
        startDate: toIsoString(row.startDate) as string,
        endDate: toIsoString(row.endDate),
        depreciationBase: row.depreciationBase as DepreciationBaseEnum,
        depreciationType: row.depreciationType as DepreciationValueTypeEnum,
        depreciationValue: toNumber(row.depreciationValue) ?? 0,
        cyclePeriod: row.cyclePeriod as CyclePeriodEnum,
        cycleNumber: row.cycleNumber
    }
}

export class AutoDepreciationRepository {
    /**
     * Creates a percentage-based auto depreciation rule for the asset, using the provided client so it can join an ongoing transaction.
     * @param client The Prisma client (or transaction client) used to run the insert.
     * @param assetId The unique identifier of the asset the rule belongs to.
     * @param input The depreciation cadence and percentage chosen by the user.
     * @param startDate The date the depreciation schedule starts from.
     */
    async create(
        client: Prisma.TransactionClient,
        assetId: string,
        input: AutoDepreciationInput,
        startDate: Date
    ): Promise<void> {
        await client.autoDepreciation.create({
            data: {
                assetId,
                startDate,
                depreciationBase: DepreciationBase.CURRENT_VALUE,
                depreciationType: DepreciationValueType.PERCENTAGE,
                depreciationValue: input.percentage,
                cyclePeriod: input.cyclePeriod as CyclePeriod,
                cycleNumber: input.cycleNumber
            }
        })
    }

    /**
     * Soft deletes every active auto depreciation rule attached to the asset, using the provided client so it can join an ongoing transaction.
     * @param client The Prisma client (or transaction client) used to run the update.
     * @param assetId The unique identifier of the asset whose rules are being deleted.
     * @param deletedAt The timestamp indicating when the deletion occurred.
     */
    async softDeleteActiveForAsset(client: Prisma.TransactionClient, assetId: string, deletedAt: Date): Promise<void> {
        await client.autoDepreciation.updateMany({
            where: { assetId, deletedAt: null },
            data: { deletedAt }
        })
    }

    /**
     * Replaces the active auto depreciation rules for the asset with a single new rule, using the provided client so it can join an ongoing transaction.
     * @param client The Prisma client (or transaction client) used to run the writes.
     * @param assetId The unique identifier of the asset the rule belongs to.
     * @param input The depreciation cadence and percentage chosen by the user.
     * @param startDate The date the new depreciation schedule starts from.
     */
    async replaceForAsset(
        client: Prisma.TransactionClient,
        assetId: string,
        input: AutoDepreciationInput,
        startDate: Date
    ): Promise<void> {
        await this.softDeleteActiveForAsset(client, assetId, new Date())
        await this.create(client, assetId, input, startDate)
    }

    /**
     * Finds the active auto depreciation rules for the asset belonging to the specified user.
     * @param userId The ID of the user who owns the asset.
     * @param assetId The unique identifier of the asset being inspected.
     * @returns A promise that resolves to the active auto depreciation rules, newest first.
     */
    async findByAssetId(userId: string, assetId: string): Promise<AutoDepreciationData[]> {
        const rows = await prisma.autoDepreciation.findMany({
            where: { assetId, deletedAt: null, asset: { userId, deletedAt: null } },
            orderBy: { createdAt: 'desc' },
            select: autoDepreciationSelect
        })

        return rows.map(toAutoDepreciationData)
    }
}
