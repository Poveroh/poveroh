import { IFinancialAccount } from '@poveroh/types'
import { BaseService } from './base.service'

export class AccountService extends BaseService<IFinancialAccount> {
    constructor() {
        super('/account')
    }
}
