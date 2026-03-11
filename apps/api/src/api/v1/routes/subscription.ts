import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubscriptionController } from '../controllers/subscription.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, SubscriptionController.readSubscriptions)
router.get('/:id', AuthMiddleware.isAuthenticated, SubscriptionController.readSubscriptionById)
router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.createSubscription)
router.patch('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.updateSubscription)
router.delete('/:id', AuthMiddleware.isAuthenticated, SubscriptionController.deleteSubscription)
router.delete('/', AuthMiddleware.isAuthenticated, SubscriptionController.deleteAllSubscriptions)

export default router
