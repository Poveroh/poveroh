import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { TransactionController } from '../modules/transactions/transaction.controller'

const router: Router = Router()
const transactionController = new TransactionController()

router.get('/', AuthMiddleware.isAuthenticated, transactionController.readTransactions.bind(transactionController))
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    transactionController.readTransactionById.bind(transactionController)
)
router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.array('file'),
    transactionController.createTransaction.bind(transactionController)
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    upload.array('file'),
    transactionController.updateTransaction.bind(transactionController)
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    transactionController.deleteTransaction.bind(transactionController)
)
router.delete(
    '/',
    AuthMiddleware.isAuthenticated,
    transactionController.deleteAllTransactions.bind(transactionController)
)

export default router
