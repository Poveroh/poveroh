import { IFinancialAccount } from '@poveroh/types'
import { BaseService } from './base.service'

export class FinancialAccountService extends BaseService<IFinancialAccount> {
    constructor() {
        super('/financial-account')
    }
}
