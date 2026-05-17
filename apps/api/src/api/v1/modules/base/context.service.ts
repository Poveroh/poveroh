import { AppContext, User } from '@poveroh/types'
import { AsyncLocalStorage } from 'async_hooks'

/**
 * ContextService manages the application context using AsyncLocalStorage, allowing for consistent access to context-specific data such as the current user across asynchronous operations. It provides methods to run code within a specific context and to retrieve the current context and user information, ensuring that services and helpers can access necessary data without needing to pass it explicitly through function parameters. This design promotes cleaner and more maintainable code by abstracting away the details of context management and providing a simple interface for accessing contextual information throughout the application.
 */
export class ContextService {
    private readonly storage = new AsyncLocalStorage<AppContext>()

    /**
     * Runs a callback function within a specific application context. This method is essential for maintaining state across asynchronous operations, allowing the application to access context-specific data (such as the current user) throughout the lifecycle of a request or operation. By using AsyncLocalStorage, it ensures that the context is preserved even when the execution flow involves asynchronous tasks, making it easier to manage and access contextual information without having to pass it explicitly through function parameters.
     * @param context The application context to be set for the duration of the callback execution. This context typically includes information such as the current user, request details, and any other relevant data that needs to be accessible throughout the execution of the callback and any asynchronous operations it may trigger. By providing this context, developers can ensure that all parts of the application have access to necessary information without having to pass it through multiple layers of function calls.
     * @param callback The function to be executed within the provided context. This callback can contain any logic that requires access to the context, and it can also perform asynchronous operations. The AsyncLocalStorage will ensure that the context remains consistent and accessible throughout the execution of this callback, allowing for seamless access to context-specific data even in complex asynchronous scenarios.
     * @returns The result of the callback function execution. The return type is generic, allowing it to accommodate any type of result that the callback may produce. This flexibility ensures that the runWithContext method can be used in a wide variety of scenarios, providing a consistent way to manage context while still allowing for diverse functionality within the callback.
     */
    runWithContext<T>(context: AppContext, callback: () => T): T {
        return this.storage.run(context, callback)
    }

    /**
     * Retrieves the current application context from AsyncLocalStorage. This method is crucial for accessing context-specific information, such as the current user, during the execution of a request or operation. It checks if the context is available and throws an error if it is not, which helps to ensure that services and helpers are used correctly within a valid context. By providing a way to access the current context, this method enables developers to write code that can adapt its behavior based on the contextual information, enhancing the flexibility and functionality of the application.
     * @returns The current application context, which includes information such as the current user and any other relevant data that has been set for the duration of the request or operation. This context is essential for enabling services and helpers to access necessary information without having to pass it explicitly through function parameters, allowing for cleaner and more maintainable code.
     */
    getRequestContext(): AppContext {
        const context = this.storage.getStore()
        if (!context) {
            throw new Error('Request context is not available. Did you forget to wrap the call in runWithContext?')
        }
        return context
    }

    /**
     * Retrieves the currently authenticated user from the application context. This method relies on the assumption that the user information has been properly set in the context during authentication. It provides a convenient way for services and helpers to access the current user's details without needing to pass the user information through multiple layers of function calls. By abstracting away the details of how the user information is stored and accessed, this method allows developers to focus on implementing business logic while still having easy access to the current user's data when needed.
     * @returns The currently authenticated user, as represented in the application context. This user object typically includes properties such as the user's ID, email, name, and any other relevant information that has been stored during the authentication process. Access to the current user is essential for implementing features such as access control, personalization, and associating data with specific users within the application.
     */
    getCurrentUser(): User {
        return this.getRequestContext().user
    }

    /**
     * Retrieves the ID of the currently authenticated user from the application context. This method provides a convenient way to access the user's unique identifier without needing to retrieve the entire user object. It is useful for scenarios where only the user ID is required, such as logging, auditing, or associating data with a specific user.
     * @returns The ID of the currently authenticated user.
     */
    getCurrentUserId(): string {
        return this.getRequestContext().user.id
    }
}
