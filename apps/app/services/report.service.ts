import { getReportTrend, type NetWorthEvolutionFilters } from '@/lib/api-client'

export class ReportService {
    async getNetWorthEvolution(filter?: NetWorthEvolutionFilters) {
        const response = await getReportTrend({
            query: { filter }
        })
        return response.data
    }
}
