import { IBankAccount } from '@poveroh/types'
import { BaseService } from './base.service'

export class BankAccountService extends BaseService<IBankAccount> {
    constructor() {
        super('/bank-account')
    }
}
