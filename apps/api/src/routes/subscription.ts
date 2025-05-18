import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { SubscriptionController } from '../controllers/subscription.controller'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.add)
router.post('/read', AuthMiddleware.isAuthenticated, SubscriptionController.read)
router.post('/save', AuthMiddleware.isAuthenticated, upload.single('file'), SubscriptionController.save)
router.delete('/delete/:id', AuthMiddleware.isAuthenticated, SubscriptionController.delete)

export default router
