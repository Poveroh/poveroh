import type {
    CreateFinancialAccountRequest,
    FinancialAccountData,
    FinancialAccountFilters,
    UpdateFinancialAccountRequest
} from '@poveroh/types'
import { BaseService } from '@/src/api/v1/modules/base/base.service'
import { eventBus } from '@/src/api/v1/events/event-bus'
import { FinancialAccountRepository } from './financial-account.repository'

export class FinancialAccountService extends BaseService {
    private readonly financialAccountRepository = new FinancialAccountRepository()

    constructor() {
        super('financial-account')
    }

    // Creates an account and stores an uploaded icon under the generated account id.
    async createFinancialAccount(
        payload: CreateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<FinancialAccountData> {
        const userId = this.getUserId()
        const generatedId = crypto.randomUUID()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.logoIcon = await this.saveFile(generatedId, file)
        }

        const account = await this.financialAccountRepository.create(userId, generatedId, payloadWithIcon)
        await eventBus.emit('financial-account.created', { financialAccountId: account.id, userId })

        return account
    }

    // Updates only the account owned by the authenticated user.
    async updateFinancialAccount(
        id: string,
        payload: UpdateFinancialAccountRequest,
        file?: Express.Multer.File
    ): Promise<void> {
        const userId = this.getUserId()
        const payloadWithIcon = { ...payload }

        if (file) {
            payloadWithIcon.logoIcon = await this.saveFile(id, file)
        }

        await this.financialAccountRepository.update(userId, id, payloadWithIcon)
        await eventBus.emit('financial-account.updated', { financialAccountId: id, userId })
    }

    // Financial accounts are soft-deleted to preserve historical transaction context.
    async deleteFinancialAccount(id: string): Promise<void> {
        const userId = this.getUserId()
        await this.financialAccountRepository.softDelete(userId, id, new Date())
        await eventBus.emit('financial-account.deleted', { financialAccountId: id, userId })
    }

    // Bulk delete keeps behavior compatible while still preserving history.
    async deleteAllFinancialAccounts(): Promise<void> {
        await this.financialAccountRepository.softDeleteAll(this.getUserId(), new Date())
    }

    // Reads return response DTOs instead of database records.
    async getFinancialAccountById(id: string): Promise<FinancialAccountData | null> {
        return this.financialAccountRepository.findById(this.getUserId(), id)
    }

    // List reads keep filtering and pagination in the repository.
    async getFinancialAccounts(
        filters: FinancialAccountFilters,
        skip: number,
        take: number
    ): Promise<FinancialAccountData[]> {
        return this.financialAccountRepository.findMany(this.getUserId(), filters, skip, take)
    }
}
