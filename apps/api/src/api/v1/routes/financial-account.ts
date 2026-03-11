import { FinancialAccountController } from '../controllers/financial-account.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { OwnershipMiddleware } from '../../../middleware/ownership.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, FinancialAccountController.readFinancialAccounts)
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.financialAccount,
    FinancialAccountController.readFinancialAccountById
)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    FinancialAccountController.createFinancialAccount
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.financialAccount,
    upload.single('file'),
    FinancialAccountController.updateFinancialAccount
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.financialAccount,
    FinancialAccountController.deleteFinancialAccount
)
router.delete('/', AuthMiddleware.isAuthenticated, FinancialAccountController.deleteAllFinancialAccounts)

export default router
