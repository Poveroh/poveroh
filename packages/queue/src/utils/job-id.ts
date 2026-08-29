/**
 * Normalizes a deduplication id into a valid BullMQ custom job id, which cannot contain colons.
 * @param deduplicationId The logical deduplication id, if any.
 * @returns The sanitized job id, or undefined when no deduplication id was provided.
 */
export function toBullMQJobId(deduplicationId?: string): string | undefined {
    return deduplicationId?.replace(/:/g, '-')
}
