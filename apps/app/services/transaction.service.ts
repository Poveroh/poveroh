import { ITransaction } from '@poveroh/types'
import { BaseService } from './base.service'

export class TransactionService extends BaseService<ITransaction> {
    constructor() {
        super('/transaction')
    }
}
