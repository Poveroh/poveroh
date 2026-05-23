import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubscriptionController } from '../modules/subscriptions/subscription.controller'

const router: Router = Router()
const subscriptionController = new SubscriptionController()

router.get('/', AuthMiddleware.isAuthenticated, subscriptionController.readSubscriptions.bind(subscriptionController))
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    subscriptionController.readSubscriptionById.bind(subscriptionController)
)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    subscriptionController.createSubscription.bind(subscriptionController)
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    subscriptionController.updateSubscription.bind(subscriptionController)
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    subscriptionController.deleteSubscription.bind(subscriptionController)
)
router.delete(
    '/',
    AuthMiddleware.isAuthenticated,
    subscriptionController.deleteAllSubscriptions.bind(subscriptionController)
)

export default router
