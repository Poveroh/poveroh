import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { TransactionController } from '../controllers/transaction.controller'

const router: Router = Router()

router.get('/', AuthMiddleware.isAuthenticated, TransactionController.readTransactions)
router.get('/:id', AuthMiddleware.isAuthenticated, TransactionController.readTransactionById)
router.post('/', AuthMiddleware.isAuthenticated, upload.array('file'), TransactionController.createTransaction)
router.patch('/:id', AuthMiddleware.isAuthenticated, upload.array('file'), TransactionController.updateTransaction)
router.delete('/:id', AuthMiddleware.isAuthenticated, TransactionController.deleteTransaction)
router.delete('/', AuthMiddleware.isAuthenticated, TransactionController.deleteAllTransactions)

export default router
