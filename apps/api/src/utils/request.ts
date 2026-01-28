export const getParamString = (
    params: Record<string, string | string[] | undefined>,
    key: string
): string | undefined => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
}
