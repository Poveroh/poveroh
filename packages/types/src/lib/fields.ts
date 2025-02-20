/**
 * Enumeration of field types for form inputs, each associated with a specific HTML input type.
 * This enum is used to specify the expected data type for form fields, guiding the type of data
 * input and validation needed. It includes both generic and specialized field types.
 *
 * Available Field Types:
 * - `DEFAULT`: Generic text input field (mapped to 'text')
 * - `TEXT`: Text input field (also mapped to 'text')
 * - `EMAIL`: Field for email addresses (mapped to 'email')
 * - `CHOICE`: Field with predefined options, like checkboxes or radio buttons (mapped to 'checkbox')
 * - `DATE`: Field for date values (mapped to 'date')
 * - `PHONE`: Field for phone numbers (mapped to 'tel')
 * - `NUMBER`: Field for numerical input (mapped to 'number')
 * - `PASSWORD`: Field for passwords, typically obscured for security (mapped to 'password')
 * - `BOOLEAN`: Field for boolean values, usually displayed as a checkbox (mapped to 'checkbox')
 */
export enum FieldType {
    /**
     * A field that expects a string value.
     */
    TEXT = 'text',

    /**
     * A field that expects a string value in textarea (like notes or description).
     */
    LONGTEXT = 'textarea',

    /**
     * A field that expects a valid email address.
     */
    EMAIL = 'email',

    /**
     * A field that allows the user to select a value from a predefined set of options.
     */
    SELECT = 'select',

    /**
     * A field that allows the user to select currency from a predefined set of options (currencyCatalog).
     */
    CURRENCY = 'currency',

    /**
     * A field that expects a date value.
     */
    DATE = 'date',

    /**
     * A field that expects a phone number.
     */
    PHONE = 'tel',

    /**
     * A field that expects a  number.
     */
    NUMBER = 'number',

    /**
     * A field that expects a number for amount
     */
    MONEY = 'money',

    /**
     * A field that expects a password, typically obscured for security.
     */
    PASSWORD = 'password',

    /**
     * A field that allows the user to select either true or false.
     */
    BOOLEAN = 'checkbox',

    /**
     * A field that allows the user to upload files.
     */
    UPLOAD = 'file'
}
