import type { AppContext, User } from '@poveroh/types'
import { AsyncLocalStorage } from 'async_hooks'

/**
 * ContextService manages the application context using AsyncLocalStorage, allowing services and helpers to access the current user without passing it through every method call.
 */
export class ContextService {
    private static readonly storage = new AsyncLocalStorage<AppContext>()

    /**
     * Reads the current user directly from the active application context so changes made during the request are always reflected.
     * @returns The current authenticated user stored in the application context.
     */
    get currentUser(): User {
        return this.getRequestContext().user
    }

    /**
     * Runs a callback function within a specific application context.
     * @param context The application context to make available during the callback execution.
     * @param callback The function to execute while the provided context is active.
     * @returns The callback result.
     */
    runWithContext<T>(context: AppContext, callback: () => T): T {
        return ContextService.storage.run(context, callback)
    }

    /**
     * Replaces the user stored in the active application context when the authenticated identity changes during the request.
     * @param user The user that should become the current context user.
     */
    setCurrentUser(user: User): void {
        const context = this.getRequestContext()
        context.user = user
    }

    /**
     * Merges fresh user fields into the active application context while preserving existing identity data such as the user ID.
     * @param user Partial user data that should be merged into the current context user.
     */
    patchCurrentUser(user: Partial<User>): void {
        const context = this.getRequestContext()
        context.user = {
            ...context.user,
            ...user
        }
    }

    /**
     * Retrieves the current application context from AsyncLocalStorage.
     * @returns The active application context.
     */
    getRequestContext(): AppContext {
        const context = ContextService.storage.getStore()
        if (!context) {
            throw new Error('Request context is not available. Did you forget to wrap the call in runWithContext?')
        }
        return context
    }

    /**
     * Reads the current authenticated user ID for helpers that do not need the full application context.
     * @returns The current authenticated user ID.
     */
    getCurrentUserId(): string {
        return this.currentUser.id
    }
}

export const contextService = new ContextService()
