import { useMutation, useQuery } from '@tanstack/react-query'
import { getUserOptions, putUserMutation } from '../api/@tanstack/react-query.gen'

/**
 * Hook per ottenere l'utente corrente (AUTENTICATA)
 * Usa il cookie di sessione di better-auth automaticamente
 */
export const useGetUser = () => {
    return useQuery(getUserOptions())
}

/**
 * Hook per aggiornare l'utente corrente (AUTENTICATA)
 * Usa il cookie di sessione di better-auth automaticamente
 */
export const useUpdateUser = () => {
    return useMutation(putUserMutation())
}

/**
 * ESEMPIO: Hook per ottenere dati pubblici (NON AUTENTICATA)
 * Importa withoutAuth da '@/lib/api-client' e passalo alle options
 *
 * @example
 * import { withoutAuth } from '@/lib/api-client'
 * import { getRootStatusOptions } from '../api/@tanstack/react-query.gen'
 *
 * export const useGetPublicData = () => {
 *     return useQuery(
 *         getRootStatusOptions(withoutAuth())
 *     )
 * }
 *
 * Vedi services/EXAMPLES.ts per altri esempi completi
 */
