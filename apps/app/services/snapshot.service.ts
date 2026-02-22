import { postSnapshotAccountBalance, type SnapshotAccountBalance } from '@/lib/api-client'

export class SnapshotService {
    async addAccountBalanceSnapshot(data: Partial<SnapshotAccountBalance>) {
        const response = await postSnapshotAccountBalance({
            body: data as any
        })
        return response.data
    }
}
