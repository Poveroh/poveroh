import { BankAccountType, IBankAccount, IItem } from '@poveroh/types'
import { BaseService } from './base.service'

export class BankAccountService extends BaseService<IBankAccount> {
    constructor() {
        super('/bank-account')
    }

    getTypeList(t: (key: string) => string): IItem[] {
        return [
            { value: BankAccountType.ONLINE_BANK, label: t('bankAccounts.types.online') },
            { value: BankAccountType.BANK_ACCOUNT, label: t('bankAccounts.types.bank') },
            { value: BankAccountType.CIRCUIT, label: t('bankAccounts.types.circuit') },
            { value: BankAccountType.DEPOSIT_BANK, label: t('bankAccounts.types.deposit') },
            { value: BankAccountType.BROKER, label: t('bankAccounts.types.broker') }
        ]
    }
}
