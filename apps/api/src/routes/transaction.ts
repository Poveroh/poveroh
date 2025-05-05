import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'
import { TransactionController } from '../controllers/transaction.controller'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, upload.single('file'), TransactionController.add)
router.post('/read', AuthMiddleware.isAuthenticated, TransactionController.read)
router.post('/save', AuthMiddleware.isAuthenticated, upload.single('file'), TransactionController.save)
router.post('/delete', AuthMiddleware.isAuthenticated, TransactionController.delete)

export default router
