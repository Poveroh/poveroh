import { logger } from '@poveroh/logger/server'
import type { ImportCandidateTransaction, ImportSourceEnum, ImportSourceReader } from '@poveroh/types'
import { MediaService } from '@/v1/modules/base/media.service'
import HowIParsedYourDataAlgorithm from '@/v1/helpers/parser.helper'
import { ImportRepository } from '../../import.repository'

/**
 * Produces an import's transactions by re-reading and parsing the files that were uploaded for it.
 *
 * A CSV import needs no staging table: the stored file is already a durable, re-parsable copy of
 * the input, so a retry re-derives exactly the same rows.
 */
export class CsvImportSourceReader implements ImportSourceReader {
    readonly source: ImportSourceEnum = 'CSV'

    private readonly importRepository = new ImportRepository()
    private readonly parser = new HowIParsedYourDataAlgorithm()

    constructor(private readonly media: MediaService) {}

    /**
     * Reads every file attached to the import and parses it into normalized transactions.
     * @param importId The import whose files must be read.
     * @returns A promise that resolves to the transactions found across all of the import's files.
     */
    async read(importId: string): Promise<ImportCandidateTransaction[]> {
        const files = await this.importRepository.findImportFiles(importId)

        const parsed = await Promise.all(files.map(file => this.parseFile(importId, file.path, file.filename)))

        return parsed.flat()
    }

    /**
     * Parses a single stored file, surfacing what the parser could not make sense of instead of
     * letting it fail silently the way the previous implementation did.
     * @param importId The import the file belongs to, for logging.
     * @param path The stored file reference.
     * @param filename The original file name, for logging.
     * @returns A promise that resolves to the transactions read from the file.
     */
    private async parseFile(importId: string, path: string, filename: string): Promise<ImportCandidateTransaction[]> {
        const content = (await this.media.readFile(path)).toString('utf-8')
        const result = await this.parser.parseCSVFile(content)

        if (result.errors.length > 0) {
            logger.warn('CSV import file could not be fully parsed', { importId, filename, errors: result.errors })
        }

        return result.transactions.map(transaction => ({
            date: transaction.date,
            title: transaction.title,
            amount: transaction.amount,
            currency: transaction.currency,
            action: transaction.action
        }))
    }
}
