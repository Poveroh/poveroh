import { ISubscription } from '@poveroh/types'
import { BaseService } from './base.service'

export class SubscriptionService extends BaseService<ISubscription> {
    constructor() {
        super('/subscription')
    }
}
