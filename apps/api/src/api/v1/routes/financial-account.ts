import { FinancialAccountController } from '../modules/financial-accounts/financial-account.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()
const financialAccountController = new FinancialAccountController()

router.get(
    '/',
    AuthMiddleware.isAuthenticated,
    financialAccountController.readFinancialAccounts.bind(financialAccountController)
)
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    financialAccountController.readFinancialAccountById.bind(financialAccountController)
)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    financialAccountController.createFinancialAccount.bind(financialAccountController)
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    financialAccountController.updateFinancialAccount.bind(financialAccountController)
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    financialAccountController.deleteFinancialAccount.bind(financialAccountController)
)
router.delete(
    '/',
    AuthMiddleware.isAuthenticated,
    financialAccountController.deleteAllFinancialAccounts.bind(financialAccountController)
)

export default router
