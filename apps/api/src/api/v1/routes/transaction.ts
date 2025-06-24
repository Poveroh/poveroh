import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { TransactionController } from '../controllers/transaction.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), TransactionController.add)
router.get('/', AuthMiddleware.isAuthenticated, TransactionController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), TransactionController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, TransactionController.delete)
router.post('/read-csv', AuthMiddleware.isAuthenticated, upload.array('files'), TransactionController.parseCSV)

export default router
