import { ImportStatus, IPendingTransaction } from '@poveroh/types'
import { IReadedTransaction } from '@poveroh/types'
import { v4 as uuidv4 } from 'uuid'

export const ImportHelper = {
    normalizeTransaction(
        idUser: string,
        bankAccountId: string,
        rawTransactions: IReadedTransaction[]
    ): IPendingTransaction[] {
        let transactions: IPendingTransaction[] = []

        for (const rawTransaction of rawTransactions) {
            const transactionId = uuidv4()

            transactions.push({
                id: transactionId,
                user_id: idUser,
                created_at: new Date(),
                amounts: [
                    {
                        id: uuidv4(),
                        created_at: new Date().toISOString(),
                        transaction_id: transactionId,
                        amount: rawTransaction.amount,
                        currency: rawTransaction.currency,
                        action: rawTransaction.type,
                        bank_account_id: bankAccountId
                    }
                ],
                title: rawTransaction.title,
                type: rawTransaction.type,
                date: rawTransaction.date.toISOString(),
                status: ImportStatus.REJECTED,
                note: '',
                ignore: false
            })
        }

        return transactions
    }
}
