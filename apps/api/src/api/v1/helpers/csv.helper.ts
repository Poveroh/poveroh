import Papa from 'papaparse'
import _ from 'lodash'
import { ICsvReadedTransaction, IFieldMapping, TransactionAction, Currencies } from '@poveroh/types'

class CSVParser {
    private datePatterns = [
        // ISO formats
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
        /^\d{4}-\d{2}-\d{2}/,
        // European formats
        /^\d{1,2}\/\d{1,2}\/\d{4}/,
        /^\d{1,2}-\d{1,2}-\d{4}/,
        /^\d{1,2}\.\d{1,2}\.\d{4}/,
        // Italian formats
        /^\d{1,2} [a-zA-Z]{3} \d{4}/,
        // Other common formats
        /^\d{1,2}\/\d{1,2}\/\d{2}$/,
        /^\d{2}\/\d{2}\/\d{4}$/
    ]

    private amountPatterns = [
        // Standard decimal formats
        /^-?\d+[.,]\d{2}$/,
        /^-?\d+[.,]\d+$/,
        /^-?\d+$/,
        // With currency symbols
        /^[€$£¥]-?\d+[.,]?\d*$/,
        /^-?\d+[.,]?\d*[€$£¥]$/,
        // With thousands separators
        /^-?\d{1,3}([,.]\d{3})*[.,]?\d*$/,
        // Quoted numbers
        /^"-?\d+[.,]?\d*"$/
    ]

    private currencyCodePattern = new RegExp(Object.values(Currencies).join('|'), 'i')

    private currencyPatterns = [this.currencyCodePattern, /€|\$|£|¥|₹|₽/]

    private titleKeywords = [
        'description',
        'desc',
        'title',
        'name',
        'nome',
        'descrizione',
        'merchant',
        'vendor',
        'payee',
        'reference',
        'memo',
        'note',
        'transaction',
        'details',
        'product',
        'legenda'
    ]

    private dateKeywords = [
        'date',
        'data',
        'time',
        'timestamp',
        'created',
        'completed',
        'started',
        'when',
        'day',
        'datetime'
    ]

    private amountKeywords = [
        'amount',
        'importo',
        'value',
        'sum',
        'total',
        'price',
        'cost',
        'fee',
        'charge',
        'balance',
        'debit',
        'credit'
    ]

    private detectFields(headers: string[], sampleRows: Record<string, any>[]): IFieldMapping {
        const mapping: IFieldMapping = { confidence: 0 }
        const scores = {
            date: new Map<string, number>(),
            amount: new Map<string, number>(),
            currency: new Map<string, number>(),
            title: new Map<string, number>()
        }

        headers.forEach(header => {
            const headerLower = header.toLowerCase().trim()

            let dateScore = 0
            if (this.dateKeywords.some(keyword => headerLower.includes(keyword))) {
                dateScore += 10
            }
            if (headerLower.includes('date') || headerLower.includes('data')) {
                dateScore += 15
            }
            scores.date.set(header, dateScore)

            let amountScore = 0
            if (this.amountKeywords.some(keyword => headerLower.includes(keyword))) {
                amountScore += 10
            }
            if (headerLower === 'amount' || headerLower === 'importo') {
                amountScore += 20
            }
            scores.amount.set(header, amountScore)

            let currencyScore = 0
            if (headerLower.includes('currency') || headerLower.includes('valuta')) {
                currencyScore += 20
            }
            scores.currency.set(header, currencyScore)

            let titleScore = 0
            if (this.titleKeywords.some(keyword => headerLower.includes(keyword))) {
                titleScore += 10
            }
            if (headerLower === 'description' || headerLower === 'nome' || headerLower === 'name') {
                titleScore += 15
            }
            scores.title.set(header, titleScore)
        })

        sampleRows.forEach(row => {
            Object.entries(row).forEach(([key, value]) => {
                if (value == null || value === '') return

                const strValue = String(value).trim()

                if (this.isLikelyDate(strValue)) {
                    scores.date.set(key, (scores.date.get(key) || 0) + 5)
                }

                if (this.isLikelyAmount(strValue)) {
                    scores.amount.set(key, (scores.amount.get(key) || 0) + 5)
                }

                if (this.isLikelyCurrency(strValue)) {
                    scores.currency.set(key, (scores.currency.get(key) || 0) + 5)
                }

                if (
                    !this.isLikelyDate(strValue) &&
                    !this.isLikelyAmount(strValue) &&
                    !this.isLikelyCurrency(strValue) &&
                    strValue.length > 2
                ) {
                    scores.title.set(key, (scores.title.get(key) || 0) + 2)
                }
            })
        })

        mapping.date = this.getBestField(scores.date)
        mapping.amount = this.getBestField(scores.amount)
        mapping.currency = this.getBestField(scores.currency)
        mapping.title = this.getBestField(scores.title)

        const totalScore =
            (scores.date.get(mapping.date || '') || 0) +
            (scores.amount.get(mapping.amount || '') || 0) +
            (scores.title.get(mapping.title || '') || 0)
        mapping.confidence = Math.min(100, totalScore * 2)

        return mapping
    }

    private getBestField(scoreMap: Map<string, number>): string | undefined {
        let bestField: string | undefined
        let bestScore = 0

        scoreMap.forEach((score, field) => {
            if (score > bestScore) {
                bestScore = score
                bestField = field
            }
        })

        return bestScore > 0 ? bestField : undefined
    }

    private isLikelyDate(value: string): boolean {
        if (!value || value.length < 6) return false
        return this.datePatterns.some(pattern => pattern.test(value))
    }

    private isLikelyAmount(value: string): boolean {
        if (!value) return false
        const cleaned = value.replace(/["'\s]/g, '')
        return this.amountPatterns.some(pattern => pattern.test(cleaned))
    }

    private isLikelyCurrency(value: string): boolean {
        if (!value) return false
        return this.currencyPatterns.some(pattern => pattern.test(value))
    }

    private parseAmount(value: string): number {
        if (!value) return 0

        let cleaned = value.replace(/["'\s€$£¥₹₽]/g, '')

        if (cleaned.includes(',') && !cleaned.includes('.')) {
            cleaned = cleaned.replace(',', '.')
        } else if (cleaned.includes(',') && cleaned.includes('.')) {
            cleaned = cleaned.replace(/,/g, '')
        }

        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
    }

    private parseDate(value: string): string {
        if (!value) return new Date().toISOString().split('T')[0]

        const attempts = [
            () => new Date(value),
            () => {
                const italianMonths = {
                    gen: '01',
                    feb: '02',
                    mar: '03',
                    apr: '04',
                    mag: '05',
                    giu: '06',
                    lug: '07',
                    ago: '08',
                    set: '09',
                    ott: '10',
                    nov: '11',
                    dic: '12'
                }

                const match = value.match(/(\d{1,2})\s+([a-z]{3})\s+(\d{4})/i)
                if (match) {
                    const [, day, month, year] = match
                    const monthNum = italianMonths[month.toLowerCase() as keyof typeof italianMonths]
                    if (monthNum) {
                        return new Date(`${year}-${monthNum}-${day.padStart(2, '0')}`)
                    }
                }
                throw new Error('No Italian date match')
            },
            () => {
                const parts = value.split(/[\/\-\.]/)
                if (parts.length === 3) {
                    const [p1, p2, p3] = parts.map(p => parseInt(p))
                    if (p1 > 12) {
                        return new Date(p3, p2 - 1, p1)
                    } else {
                        return new Date(p3, p1 - 1, p2)
                    }
                }
                throw new Error('No date parts match')
            }
        ]

        for (const attempt of attempts) {
            try {
                const date = attempt()
                if (date instanceof Date && !isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0]
                }
            } catch {
                continue
            }
        }

        console.warn(`Unable to parse date: ${value}, using current date`)
        return new Date().toISOString().split('T')[0]
    }

    private extractCurrency(row: Record<string, any>, currencyField?: string): string {
        if (currencyField && row[currencyField]) {
            const currency = String(row[currencyField]).trim()
            if (this.isLikelyCurrency(currency)) {
                return currency.replace(/[^A-Z€$£¥₹₽]/g, '')
            }
        }

        for (const [key, value] of Object.entries(row)) {
            if (value && this.isLikelyCurrency(String(value))) {
                const match = String(value).match(/EUR|USD|GBP|JPY|CHF|CAD|AUD|€|\$|£|¥|₹|₽/i)
                if (match) {
                    return match[0].toUpperCase()
                }
            }
        }

        return 'UNKNOWN'
    }

    private findDataTableStart(csvData: string): {
        startRow: number
        headers: string[]
    } {
        const lines = csvData.split('\n').filter(line => line.trim())
        if (lines.length === 0) return { startRow: 0, headers: [] }

        let bestRow = 0
        let bestScore = 0
        let bestHeaders: string[] = []

        for (let i = 0; i < Math.min(lines.length - 1, 20); i++) {
            try {
                const testData = lines.slice(i).join('\n')
                const parseResult = Papa.parse(testData, {
                    header: true,
                    preview: 5,
                    skipEmptyLines: true,
                    dynamicTyping: false
                })

                if (!parseResult.data || parseResult.data.length === 0) continue

                const headers = Object.keys(parseResult.data[0] as Record<string, any>)
                const sampleRows = parseResult.data as Record<string, any>[]

                let score = 0

                headers.forEach(header => {
                    const headerLower = header.toLowerCase().trim()

                    if (this.dateKeywords.some(keyword => headerLower.includes(keyword))) score += 10
                    if (this.amountKeywords.some(keyword => headerLower.includes(keyword))) score += 10
                    if (this.titleKeywords.some(keyword => headerLower.includes(keyword))) score += 5

                    if (
                        headerLower.includes('legenda') ||
                        headerLower.includes('legend') ||
                        headerLower.includes('note') ||
                        headerLower.includes('info')
                    )
                        score -= 5

                    if (header.length > 2 && header.length < 30) score += 2
                })

                sampleRows.forEach(row => {
                    let dataFields = 0
                    Object.values(row).forEach(value => {
                        if (value != null && String(value).trim()) {
                            dataFields++
                            const strValue = String(value).trim()

                            if (this.isLikelyDate(strValue)) score += 3
                            if (this.isLikelyAmount(strValue)) score += 3
                            if (this.isLikelyCurrency(strValue)) score += 2
                        }
                    })

                    if (dataFields >= 3) score += 5

                    const rowText = Object.values(row).join(' ').toLowerCase()
                    if (
                        rowText.includes('legenda') ||
                        rowText.includes('descrizione') ||
                        rowText.includes('legend') ||
                        rowText.includes('note')
                    )
                        score -= 3
                })

                if (headers.length >= 3 && sampleRows.length >= 1) {
                    if (score > bestScore) {
                        bestScore = score
                        bestRow = i
                        bestHeaders = headers
                    }
                }
            } catch (error) {
                continue
            }
        }

        return { startRow: bestRow, headers: bestHeaders }
    }

    public parseCSV(csvData: string): Promise<{
        transactions: ICsvReadedTransaction[]
        mapping: IFieldMapping
        errors: string[]
        detectedStartRow?: number
    }> {
        return new Promise(resolve => {
            const errors: string[] = []
            const transactions: ICsvReadedTransaction[] = []

            const { startRow, headers } = this.findDataTableStart(csvData)

            if (headers.length === 0) {
                resolve({
                    transactions: [],
                    mapping: { confidence: 0 },
                    errors: ['Could not find valid data table in CSV'],
                    detectedStartRow: startRow
                })
                return
            }

            const lines = csvData.split('\n')
            const dataLines = lines.slice(startRow)
            const cleanedCsvData = dataLines.join('\n')

            Papa.parse(cleanedCsvData, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                complete: results => {
                    try {
                        if (!results.data || results.data.length === 0) {
                            resolve({
                                transactions: [],
                                mapping: { confidence: 0 },
                                errors: ['No data found']
                            })
                            return
                        }

                        const headers = Object.keys(results.data[0] as Record<string, any>)
                        const sampleSize = Math.min(10, results.data.length)
                        const sampleRows = results.data.slice(0, sampleSize) as Record<string, any>[]

                        const mapping = this.detectFields(headers, sampleRows)

                        if (!mapping.amount || !mapping.date) {
                            errors.push('Could not detect required fields (amount and date)')
                            resolve({
                                transactions: [],
                                mapping,
                                errors,
                                detectedStartRow: startRow
                            })
                            return
                        }

                        results.data.forEach((row: any, index: number) => {
                            try {
                                if (!row || typeof row !== 'object') return

                                const amountValue = row[mapping.amount!]
                                const dateValue = row[mapping.date!]

                                if (!amountValue || !dateValue) return

                                const amount = this.parseAmount(String(amountValue))
                                if (amount === 0) return

                                const currency = this.extractCurrency(row, mapping.currency)
                                const title = mapping.title
                                    ? String(row[mapping.title] || '').trim()
                                    : `Transaction ${index + 1}`

                                transactions.push({
                                    date: this.parseDate(String(dateValue)),
                                    amount: Math.abs(amount),
                                    type: amount >= 0 ? TransactionAction.INCOME : TransactionAction.EXPENSES,
                                    currency,
                                    title: title || `Transaction ${index + 1}`,
                                    originalRow: row
                                })
                            } catch (error) {
                                errors.push(`Error processing row ${index + 1}: ${error}`)
                            }
                        })

                        resolve({
                            transactions,
                            mapping,
                            errors,
                            detectedStartRow: startRow
                        })
                    } catch (error) {
                        errors.push(`Parsing error: ${error}`)
                        resolve({ transactions: [], mapping: { confidence: 0 }, errors })
                    }
                },
                error: (error: any) => {
                    resolve({
                        transactions: [],
                        mapping: { confidence: 0 },
                        errors: [`CSV parsing failed: ${error}`],
                        detectedStartRow: startRow
                    })
                }
            })
        })
    }

    public async parseCSVFile(fileContent: string): Promise<{
        transactions: ICsvReadedTransaction[]
        mapping: IFieldMapping
        errors: string[]
        detectedStartRow?: number
        summary: {
            totalTransactions: number
            totalIncome: number
            totalExpenses: number
            dateRange: { from: string; to: string }
            currencies: string[]
        }
    }> {
        const result = await this.parseCSV(fileContent)

        const summary = {
            totalTransactions: result.transactions.length,
            totalIncome: result.transactions
                .filter(t => t.type === TransactionAction.INCOME)
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: result.transactions
                .filter(t => t.type === TransactionAction.EXPENSES)
                .reduce((sum, t) => sum + t.amount, 0),
            dateRange: {
                from: result.transactions.length > 0 ? _.min(result.transactions.map(t => t.date)) || '' : '',
                to: result.transactions.length > 0 ? _.max(result.transactions.map(t => t.date)) || '' : ''
            },
            currencies: _.uniq(result.transactions.map(t => t.currency))
        }

        return { ...result, summary }
    }
}

export default CSVParser
