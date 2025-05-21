import { BankAccountController } from '../controllers/bankaccount.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), BankAccountController.add)
router.get('/', AuthMiddleware.isAuthenticated, BankAccountController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), BankAccountController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, BankAccountController.delete)

export default router
