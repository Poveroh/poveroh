import { IAccount } from '@poveroh/types'
import { BaseService } from './base.service'

export class AccountService extends BaseService<IAccount> {
    constructor() {
        super('/account')
    }
}
