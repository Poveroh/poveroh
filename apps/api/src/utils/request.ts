/**
 * Utility function to extract a string parameter from a record of query parameters.
 * If the parameter value is an array, it returns the first element; otherwise, it returns the value directly.
 * This is useful for handling query parameters that may be provided as either a single string or an array of strings.
 * @param params A record of query parameters, where each key maps to a string, an array of strings, or undefined.
 * @param key The key of the query parameter to extract.
 * @returns The extracted string value, or undefined if the parameter is not present.
 */
export const getParamString = (
    params: Record<string, string | string[] | undefined>,
    key: string
): string | undefined => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
}
