import type { DomainEventHandler, DomainEventName, DomainEventPayloads } from '@/types'
import { logger } from '@poveroh/logger'

class EventBus {
    private readonly handlers = new Map<DomainEventName, DomainEventHandler<DomainEventName>[]>()

    // Event handlers are intentionally best-effort so side effects cannot break committed workflows.
    async emit<EventName extends DomainEventName>(
        eventName: EventName,
        payload: DomainEventPayloads[EventName]
    ): Promise<void> {
        const eventHandlers = this.handlers.get(eventName) ?? []

        await Promise.all(
            eventHandlers.map(async handler => {
                try {
                    await handler(payload)
                } catch (error) {
                    logger.error({ eventName, error })
                }
            })
        )
    }

    // Modules register local side effects without coupling write workflows to listeners.
    on<EventName extends DomainEventName>(eventName: EventName, handler: DomainEventHandler<EventName>): void {
        const eventHandlers = this.handlers.get(eventName) ?? []
        eventHandlers.push(handler as DomainEventHandler<DomainEventName>)
        this.handlers.set(eventName, eventHandlers)
    }
}

export const eventBus = new EventBus()
