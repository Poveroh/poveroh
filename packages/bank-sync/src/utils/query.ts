/**
 * Removes the query string and fragment from a URI, keeping only the path.
 * @param uri The URI to strip.
 * @returns The URI without its query string or fragment.
 */
export function stripQueryString(uri: string): string {
    const queryIndex = uri.search(/[?#]/)
    return queryIndex === -1 ? uri : uri.slice(0, queryIndex)
}
