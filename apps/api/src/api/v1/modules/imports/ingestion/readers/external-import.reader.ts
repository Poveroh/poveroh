import type { ImportCandidateTransaction, ImportSourceEnum, ImportSourceReader } from '@poveroh/types'
import { ImportRepository } from '../../import.repository'

/**
 * Produces an import's transactions from the rows its source already staged.
 *
 * Sources that fetch from a remote system cannot re-read their input: a bank-sync cursor only moves
 * forward, so once it has advanced the provider will never return those transactions again. Staging
 * them before the import is processed is what makes the work retryable.
 */
export class ExternalImportSourceReader implements ImportSourceReader {
    private readonly importRepository = new ImportRepository()

    constructor(readonly source: ImportSourceEnum) {}

    /**
     * Reads the transactions staged for the import.
     * @param importId The import whose staged rows must be read.
     * @returns A promise that resolves to the staged transactions.
     */
    async read(importId: string): Promise<ImportCandidateTransaction[]> {
        return this.importRepository.findStagedTransactions(importId)
    }
}
