/**
 * Normalizes and joins multiple URL segments into a single URL string,
 * ensuring proper formatting and handling of edge cases such as protocol prefixes, query parameters, and hash fragments.
 *
 * @param strArray - The array of URL segments to normalize and join.
 * @returns The normalized and joined URL string.
 */
function normalize(strArray: string[]): string {
    const resultArray: string[] = []
    if (strArray.length === 0) return ''

    strArray = strArray.filter(part => part !== '')

    if (typeof strArray[0] !== 'string') {
        throw new TypeError('Url must be a string. Received ' + strArray[0])
    }

    if (/^[^/:]+:\/*$/.test(strArray[0]) && strArray.length > 1) {
        strArray[0] = strArray.shift()! + strArray[0]
    }

    if (strArray[0] === '/' && strArray.length > 1) {
        strArray[0] = strArray.shift()! + strArray[0]
    }

    if (/^file:\/\/\//.test(strArray[0])) {
        strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///')
    } else if (!/^\[.*:.*\]/.test(strArray[0])) {
        strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://')
    }

    for (let i = 0; i < strArray.length; i++) {
        let component = strArray[i]

        if (typeof component !== 'string') {
            throw new TypeError('Url must be a string. Received ' + component)
        }

        if (i > 0) {
            component = component.replace(/^\/+/, '')
        }

        if (i < strArray.length - 1) {
            component = component.replace(/\/+$/, '')
        } else {
            component = component.replace(/\/+$/, '/')
        }

        if (component !== '') {
            resultArray.push(component)
        }
    }

    let str = ''

    for (let i = 0; i < resultArray.length; i++) {
        const part = resultArray[i]
        const prevPart = resultArray[i - 1]

        if (i === 0 || (prevPart && (prevPart.endsWith('?') || prevPart.endsWith('#')))) {
            str += part
        } else {
            str += '/' + part
        }
    }

    str = str.replace(/\/(\?|&|#[^!])/g, '$1')

    const [beforeHash = '', afterHash] = str.split('#')
    const parts = beforeHash.split(/(?:\?|&)+/).filter(Boolean)
    str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&') + (afterHash ? '#' + afterHash : '')

    return str
}

/**
 * Joins multiple URL segments into a single URL string, ensuring proper formatting and normalization.
 *
 * @param value - The URL segments to join, which can be provided as individual strings or as an array of strings.
 * @returns The joined and normalized URL string.
 */
export function urlJoiner(...args: (string | string[])[]): string {
    const parts = Array.isArray(args[0]) ? [...(args[0] as string[])] : (args as string[])
    return normalize(parts)
}
