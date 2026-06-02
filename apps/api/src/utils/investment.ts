/**
 * Composes a human-friendly asset title from the vehicle brand and model.
 * @param brand The vehicle brand.
 * @param model The vehicle model.
 * @returns The combined, trimmed title.
 */
export function buildTitle(brand: string, model: string): string {
    return `${brand} ${model}`.trim()
}
