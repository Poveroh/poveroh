import { FinancialAccountController } from '../modules/financial-accounts/financial-account.controller'
import { AccountBalanceController } from '../modules/financial-accounts/account-balance/account-balance.controller'
import { AccountSummaryController } from '../modules/financial-accounts/account-summary/account-summary.controller'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { Router } from 'express'

const router: Router = Router()
const financialAccountController = new FinancialAccountController()
const accountBalanceController = new AccountBalanceController()
const accountSummaryController = new AccountSummaryController()

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
router.post('/balance', AuthMiddleware.isAuthenticated, accountBalanceController.addManualBalance)
router.get('/:id/balance-series', AuthMiddleware.isAuthenticated, accountBalanceController.getSeries)
router.get('/:id/summary', AuthMiddleware.isAuthenticated, accountSummaryController.getSummary)

export default router
