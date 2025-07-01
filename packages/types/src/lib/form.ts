import { InputVariantStyle } from './fields.js'
import { ITransaction } from './transaction.js'

export type FormProps = {
    initialData?: ITransaction
    inEditingMode: boolean
    inputStyle?: InputVariantStyle
    dataCallback: (formData: FormData) => Promise<void>
}
