/**
 * Converts a string to a SHA-256 hash.
 * @param input - The string to hash.
 * @returns The SHA-256 hash of the input string.
 */
export async function encryptString(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('')
}
