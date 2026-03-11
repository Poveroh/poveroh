import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { OwnershipMiddleware } from '../../../middleware/ownership.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { TransactionController } from '../controllers/transaction.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), TransactionController.createTransaction)
router.get('/', AuthMiddleware.isAuthenticated, TransactionController.readTransactions)
router.get(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.transaction,
    TransactionController.readTransactionById
)
router.patch(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.transaction,
    upload.single('file'),
    TransactionController.updateTransaction
)
router.delete(
    '/:id',
    AuthMiddleware.isAuthenticated,
    OwnershipMiddleware.transaction,
    TransactionController.deleteTransaction
)
router.delete('/', AuthMiddleware.isAuthenticated, TransactionController.deleteAllTransactions)

export default router
