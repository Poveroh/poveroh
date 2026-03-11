import { FinancialAccountController } from '../controllers/financial-account.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, FinancialAccountController.readFinancialAccounts)
router.get('/:id', AuthMiddleware.isAuthenticated, FinancialAccountController.readFinancialAccountById)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    FinancialAccountController.createFinancialAccount
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    FinancialAccountController.updateFinancialAccount
)
router.delete('/:id', AuthMiddleware.isAuthenticated, FinancialAccountController.deleteFinancialAccount)
router.delete('/', AuthMiddleware.isAuthenticated, FinancialAccountController.deleteAllFinancialAccounts)

export default router
