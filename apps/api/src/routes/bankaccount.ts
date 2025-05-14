import { Router } from 'express'
import { AuthMiddleware } from '../middleware/auth.middleware'
import { BankAccountController } from '../controllers/bankaccount.controller'
import { upload } from '../middleware/upload.middleware'

const router: Router = Router()

router.post('/add', AuthMiddleware.isAuthenticated, upload.single('file'), BankAccountController.add)
router.post('/read', AuthMiddleware.isAuthenticated, BankAccountController.read)
router.post('/save', AuthMiddleware.isAuthenticated, upload.single('file'), BankAccountController.save)
router.delete('/delete/:id', AuthMiddleware.isAuthenticated, BankAccountController.delete)

export default router
