import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { BankAccountController } from '../controllers/bankaccount.controller'
import { upload } from '../middleware/upload.middleware'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, BankAccountController.add)
router.post('/read', AuthMiddleware.isAuthenticated, BankAccountController.read)
router.post('/save', AuthMiddleware.isAuthenticated, BankAccountController.save)
router.post('/delete', AuthMiddleware.isAuthenticated, BankAccountController.delete)
router.post('/upload', AuthMiddleware.isAuthenticated, upload.single('file'), BankAccountController.upload)

export default router
