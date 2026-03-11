import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { OwnershipMiddleware } from '../../../middleware/ownership.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubscriptionController } from '../controllers/subscription.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.createSubscription)
router.get('/', AuthMiddleware.isAuthenticated, SubscriptionController.readSubscriptions)
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subscription,
    SubscriptionController.readSubscriptionById
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subscription,
    upload.single('file'),
    SubscriptionController.updateSubscription
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.subscription,
    SubscriptionController.deleteSubscription
)
router.delete('/', AuthMiddleware.isAuthenticated, SubscriptionController.deleteAllSubscriptions)

export default router
