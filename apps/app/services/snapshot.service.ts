import { server } from '@/lib/server'
import { ISnapshotAccountBalance } from '@poveroh/types/dist'

export class SnapshotService {
    async addAccountBalanceSnapshot(data: FormData): Promise<ISnapshotAccountBalance> {
        return await server.post<ISnapshotAccountBalance>('/snapshot/account-balance', data, false)
    }
}
