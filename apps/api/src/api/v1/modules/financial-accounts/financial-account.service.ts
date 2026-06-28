import type {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { BaseService } from '@/src/api/v1/modules/base/base.service'
import { eventBus } from '@/v1/worker/events/event-bus'
import { FinancialAccountRepository } from './financial-account.repository'
import { AccountBalanceService } from './account-balance/account-balance.service'
import { NotFoundError } from '@/utils/errors'

export class FinancialAccountService extends BaseService {
    private readonly financialAccountRepository = new FinancialAccountRepository()
    private readonly accountBalanceService = new AccountBalanceService()

    constructor() {
        super('financial-account')
    }

    /**
     *  Creates a new financial account for the authenticated user, optionally handling an uploaded logo file.
     * @param payload The data required to create a new financial account
     * @param file An optional file object representing the uploaded logo for the financial account.
     * @returns A promise that resolves to the data of the newly created financial account
     */
    async createFinancialAccount(
        payload: CreateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<FinancialAccountData> {
        const userId = this.context.currentUser.id

        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload, logoIcon: '' }

        if (file) {
            payloadWithIcon.logoIcon = await this.media.saveFile(generatedId, file)
        }

        const account = await this.financialAccountRepository.create(userId, generatedId, payloadWithIcon)

        const created = await this.accountBalanceService.upsertBalance(
            {
                financialAccountId: account.id,
                balance: payload.balance,
                date: new Date().toISOString()
            },
            false
        )

        await eventBus.emit('financial-account.created', { userId, data: created })

        return created
    }

    /**
     * Updates an existing financial account for the authenticated user, optionally handling an uploaded logo file.
     * @param id The ID of the financial account to update.
     * @param payload The data to update the financial account with.
     * @param file An optional file object representing the uploaded logo for the financial account.
     * @returns A promise that resolves when the financial account has been updated.
     */
    async updateFinancialAccount(
        id: string,
        payload: UpdateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.context.currentUser.id
        const payloadWithIcon = { ...payload, logoIcon: '' }

        if (file) {
            payloadWithIcon.logoIcon = await this.media.saveFile(id, file)
        }

        await this.financialAccountRepository.update(userId, id, payloadWithIcon)

        const data = await this.financialAccountRepository.findById(userId, id)
        if (data) await eventBus.emit('financial-account.updated', { userId, data })
    }

    /**
     * Soft deletes a financial account for the authenticated user.
     * @param id The ID of the financial account to delete.
     */
    async deleteFinancialAccount(id: string): Promise<void> {
        const userId = this.context.currentUser.id

        const data = await this.financialAccountRepository.findById(userId, id)
        await this.financialAccountRepository.softDelete(userId, id, new Date())

        if (data) await eventBus.emit('financial-account.deleted', { userId, data })
    }

    /**
     * Soft deletes all financial accounts for the authenticated user.
     */
    async deleteAllFinancialAccounts(): Promise<void> {
        const userId = this.context.currentUser.id
        await this.financialAccountRepository.softDeleteAll(userId, new Date())
    }

    /**
     * Retrieves a financial account by its user-scoped ID for the authenticated user.
     * @param id The ID of the financial account to retrieve.
     * @returns A promise that resolves to the financial account data or null if not found.
     */
    async getFinancialAccountById(id: string): Promise<FinancialAccountData | null> {
        const userId = this.context.currentUser.id
        return this.financialAccountRepository.findById(userId, id)
    }

    /**
     * Retrieves financial accounts for the authenticated user based on provided filters and pagination options.
     * @param filters The filters to apply when retrieving financial accounts.
     * @param skip The number of records to skip for pagination.
     * @param take The number of records to take for pagination.
     * @returns A promise that resolves to an array of financial account data matching the criteria.
     */
    async getFinancialAccounts(
        filters: FinancialAccountFilters,
        skip: number,
        take: number
    ): Promise<FinancialAccountData[]> {
        const userId = this.context.currentUser.id
        return this.financialAccountRepository.findMany(userId, filters, skip, take)
    }

    /**
     * Checks if a financial account exists for the current user based on its unique identifier.
     * @param id The unique identifier of the financial account to check for existence.
     * @returns A promise that resolves to true if the financial account exists for the current user, or false if it does not exist.
     */
    async doesAccountExist(id: string, throwIfNotFound: boolean = false): Promise<boolean> {
        const account = await this.financialAccountRepository.findById(this.context.currentUser.id, id)
        const exists = Boolean(account != null)

        if (throwIfNotFound && !exists) {
            throw new NotFoundError('Financial account not found')
        }
        return exists
    }
}
