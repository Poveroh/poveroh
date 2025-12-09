import Papa from 'papaparse'
import { IReadedTransaction, IFieldMapping, TransactionAction, Currencies, IValueReturned } from '@poveroh/types'

/**
 *
 * "Kids, I'm going to tell you an incredible story — the story of how I parsed your data."
 *
 * The "How I Parsed Your Data" algorith, like Ted with relationships, will search transactions
 * in CSV file. Class provides robust heuristics to automatically detect and map
 * CSV columns to transaction fields such as date, amount, currency, and title/description.
 * Enhanced with fallback field search when primary fields are empty.
 */
class HowIParsedYourDataAlgorithm {
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
        'legenda',
        'remark',
        'text',
        'transaction type',
        'item',
        'purpose',
        'label',
        'activity',
        'particulars',
        'explanation',
        'subject',
        'category',
        'origin',
        'destination',
        'info',
        'transaktionstext',
        'betreff',
        'Verwendungszweck',
        'libelle',
        'intitulé',
        'descripción',
        'concepto',
        'referencia',
        'historia',
        'articolo',
        'causale',
        'ragione sociale',
        'beneficiary',
        'payer',
        'counterparty',
        'transaction id',
        'trans id',
        'operation',
        'reason',
        'comment',
        'type',
        'channel',
        'document',
        'invoice',
        'receipt',
        'statement',
        'intestatario',
        'beneficiario',
        'ordinante',
        'movimento',
        'operazione',
        'causale ABI',
        'causale SIA',
        'tipo operazione',
        'descrizione operazione',
        'dettaglio',
        'trans details',
        'trans description',
        'account name',
        'bank name',
        'branch',
        'location',
        'description 1',
        'description 2',
        'narrative',
        'posting text',
        'source',
        'recipient',
        'sender',
        'payee name',
        'description of goods',
        'order id',
        'billing ref',
        'clearing text',
        'conto',
        'codice operazione',
        'riferimento',
        'concept',
        'designation',
        'item description',
        'line item',
        'transaction detail',
        'payment details',
        'transaction reference',
        'payment reference',
        'transaction info',
        'trans info',
        'bank reference',
        'customer reference',
        'segno',
        'descrizione estesa'
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
        'datetime',
        'posting date',
        'transaction date',
        'effective date',
        'value date',
        'settlement date',
        'processing date',
        'activity date',
        'booked date',
        'entry date',
        'execution date',
        'journal date',
        'ora',
        'giorno',
        'fecha',
        'hora',
        'datum',
        'uhrzeit',
        'date operation',
        'date valeur',
        'date comptable',
        'jour',
        'transactiontime',
        'system date',
        'record date',
        'payment date',
        'emission date',
        'scadenza',
        'data contabile',
        'data valuta',
        'data operazione',
        'data esecuzione',
        'transfer date',
        'report date',
        'received date',
        'sent date',
        'cut-off date',
        'statement date',
        'period start',
        'period end',
        'data di accredito',
        'data di addebito',
        'data registrazione',
        'start date',
        'end date',
        'due date',
        'occurrence date',
        'transaction_date',
        'posting_date',
        'valuta',
        'data movimento',
        'data contabilizzazione'
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
        'credit',
        'deposit',
        'withdrawal',
        'outflow',
        'inflow',
        'paid',
        'received',
        'currency',
        'valore',
        'prezzo',
        'totale',
        'saldo',
        'addebito',
        'accredito',
        'montante',
        'somme',
        'débit',
        'crédit',
        'solde',
        'importe',
        'saldo',
        'débito',
        'crédito',
        'betrag',
        'summe',
        'solde',
        'soll',
        'haben',
        'net amount',
        'gross amount',
        'principal',
        'interest',
        'tax',
        'payment',
        'return',
        'refund',
        'disbursement',
        'remittance',
        'exchange',
        'commission',
        'discount',
        'vat',
        'tva',
        'imposta',
        'spese',
        'interessi',
        'capitale',
        'salario',
        'stipendio',
        'rata',
        'ammontare',
        'due amount',
        'final amount',
        'subtotal',
        'grand total',
        'transaction amount',
        'transfer amount',
        'loan amount',
        'initial amount',
        'remaining balance',
        'current balance',
        'previous balance',
        'commissione',
        'prelievo',
        'versamento',
        'rata capitale',
        'rata interessi',
        'oneri',
        'lordo',
        'totale lordo',
        'totale netto',
        'importo originale',
        'amount_usd',
        'amount_eur',
        'total_amount',
        'current_balance',
        'available balance',
        'book balance',
        'posted amount',
        'transaction_amount',
        'entry amount',
        'valore nominale',
        'differenza'
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

        // Store fallback options for each field type
        mapping.dateFallbacks = this.getFallbackFields(scores.date, mapping.date)
        mapping.amountFallbacks = this.getFallbackFields(scores.amount, mapping.amount)
        mapping.currencyFallbacks = this.getFallbackFields(scores.currency, mapping.currency)
        mapping.titleFallbacks = this.getFallbackFields(scores.title, mapping.title)

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

    private getFallbackFields(scoreMap: Map<string, number>, primaryField?: string): string[] {
        const fallbacks: Array<{ field: string; score: number }> = []

        scoreMap.forEach((score, field) => {
            if (field !== primaryField && score > 0) {
                fallbacks.push({ field, score })
            }
        })

        return fallbacks
            .sort((a, b) => b.score - a.score)
            .slice(0, 3) // Keep top 3 fallbacks
            .map(f => f.field)
    }

    private findValueInRow(
        row: Record<string, any>,
        primaryField?: string,
        fallbackFields?: string[],
        validator?: (value: string) => boolean
    ): string | null {
        // First try primary field
        if (primaryField && row[primaryField] != null) {
            const value = String(row[primaryField]).trim()
            if (value && (!validator || validator(value))) {
                return value
            }
        }

        // Then try fallback fields
        if (fallbackFields) {
            for (const fallbackField of fallbackFields) {
                if (row[fallbackField] != null) {
                    const value = String(row[fallbackField]).trim()
                    if (value && (!validator || validator(value))) {
                        return value
                    }
                }
            }
        }

        // Finally, search all fields if validator is provided
        if (validator) {
            for (const [key, value] of Object.entries(row)) {
                if (value != null && key !== primaryField && !fallbackFields?.includes(key)) {
                    const strValue = String(value).trim()
                    if (strValue && validator(strValue)) {
                        return strValue
                    }
                }
            }
        }

        return null
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

    private parseDate(value: string): Date {
        if (!value) return new Date()

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
                    return date
                }
            } catch {
                continue
            }
        }

        console.warn(`Unable to parse date: ${value}, using current date`)
        return new Date()
    }

    private extractCurrency(
        row: Record<string, any>,
        currencyField?: string,
        currencyFallbacks?: string[]
    ): Currencies {
        // Try primary currency field first
        if (currencyField && row[currencyField]) {
            const currency = String(row[currencyField])
                .trim()
                .replace(/[^A-Z€$£¥₹₽]/g, '')
            if (this.isLikelyCurrency(currency)) {
                const match = Currencies[currency as keyof typeof Currencies]
                if (match) return match
            }
        }

        // Try fallback fields
        if (currencyFallbacks) {
            for (const fallbackField of currencyFallbacks) {
                if (row[fallbackField]) {
                    const currency = String(row[fallbackField])
                        .trim()
                        .replace(/[^A-Z€$£¥₹₽]/g, '')
                    if (this.isLikelyCurrency(currency)) {
                        const match = Currencies[currency as keyof typeof Currencies]
                        if (match) return match
                    }
                }
            }
        }

        // Search all fields for currency indicators
        for (const [_, value] of Object.entries(row)) {
            if (value && this.isLikelyCurrency(String(value))) {
                const match = String(value).match(/EUR|USD|GBP|JPY|CHF|CAD|AUD|€|\$|£|¥|₹|₽/i)
                if (match) {
                    const cleaned = match[0].toUpperCase().replace(/[^A-Z€$£¥₹₽]/g, '')
                    const matchCurrency = Currencies[cleaned as keyof typeof Currencies]
                    if (matchCurrency) return matchCurrency
                }
            }
        }

        return Currencies.UNKNOWN
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
        transactions: IReadedTransaction[]
        mapping: IFieldMapping
        errors: string[]
        detectedStartRow?: number
    }> {
        return new Promise(resolve => {
            const errors: string[] = []
            const transactions: IReadedTransaction[] = []

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

                                // Enhanced field extraction with fallback search
                                const amountValue = this.findValueInRow(
                                    row,
                                    mapping.amount,
                                    mapping.amountFallbacks,
                                    this.isLikelyAmount.bind(this)
                                )

                                const dateValue = this.findValueInRow(
                                    row,
                                    mapping.date,
                                    mapping.dateFallbacks,
                                    this.isLikelyDate.bind(this)
                                )

                                if (!amountValue || !dateValue) return

                                const amount = this.parseAmount(amountValue)
                                if (amount === 0) return

                                const currency = this.extractCurrency(row, mapping.currency, mapping.currencyFallbacks)

                                const titleValue = this.findValueInRow(row, mapping.title, mapping.titleFallbacks)

                                const title = titleValue || `Transaction ${index + 1}`

                                transactions.push({
                                    date: this.parseDate(dateValue).toISOString(),
                                    amount: Math.abs(amount),
                                    action: amount >= 0 ? TransactionAction.INCOME : TransactionAction.EXPENSES,
                                    currency,
                                    title,
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

    public async parseCSVFile(fileContent: string): Promise<IValueReturned> {
        const result = await this.parseCSV(fileContent)

        const summary = {
            totalTransactions: result.transactions.length,
            totalIncome: result.transactions
                .filter(t => t.action === TransactionAction.INCOME)
                .reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: result.transactions
                .filter(t => t.action === TransactionAction.EXPENSES)
                .reduce((sum, t) => sum + t.amount, 0)
        }

        return { ...result, summary }
    }
}

export default HowIParsedYourDataAlgorithm
