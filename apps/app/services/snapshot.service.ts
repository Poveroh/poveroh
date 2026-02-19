import { server } from '@/lib/server'
import { ISnapshotAccountBalance } from '@poveroh/types'

export class SnapshotService {
    async addAccountBalanceSnapshot(data: Partial<ISnapshotAccountBalance>): Promise<ISnapshotAccountBalance> {
        return await server.post<ISnapshotAccountBalance>('/snapshot/account-balance', data, false)
    }
}
