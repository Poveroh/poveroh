/**
 * Defines the structure expected for JSON objects used in the application.
 * These objects must have a `label` (for display) and a `value` (the actual data).
 */
export interface IItem {
    label: string
    value: any
}
