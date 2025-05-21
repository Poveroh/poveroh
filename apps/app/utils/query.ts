export function toQueryString(filters: any): string {
    const params = new URLSearchParams()

    for (const key in filters) {
        const value = filters[key]
        if (value === undefined || value === null) continue

        if (typeof value === 'object' && !Array.isArray(value)) {
            for (const subKey in value) {
                if (value[subKey] !== undefined) {
                    params.append(`${key}[${subKey}]`, value[subKey])
                }
            }
        } else if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v))
        } else {
            params.append(key, value)
        }
    }

    return params.toString()
}
