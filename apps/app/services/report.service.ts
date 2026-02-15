import { INetWorthEvolutionFilters, INetWorthEvolutionReport } from '@poveroh/types/dist'
import { buildFilters } from '@/utils/server'
import { server } from '@/lib/server'

export class ReportService {
    async getNetWorthEvolution(filter?: INetWorthEvolutionFilters): Promise<INetWorthEvolutionReport> {
        const query = buildFilters<INetWorthEvolutionFilters>(filter)

        return await server.get<INetWorthEvolutionReport>(`${'/report/trend'}?${query}`)
    }
}
