import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { SubscriptionController } from '../controllers/subscription.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.add)
router.get('/', AuthMiddleware.isAuthenticated, SubscriptionController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, SubscriptionController.delete)

export default router
