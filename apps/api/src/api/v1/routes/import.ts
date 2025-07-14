import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { ImportController } from '../controllers/import.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), ImportController.add)
router.get('/', AuthMiddleware.isAuthenticated, ImportController.read)
router.put('/:id', AuthMiddleware.isAuthenticated, upload.single('file'), ImportController.save)
router.delete('/:id', AuthMiddleware.isAuthenticated, ImportController.delete)

router.post('/read-file', AuthMiddleware.isAuthenticated, upload.array('files'), ImportController.parseFile)

router.put(
    '/transaction/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    ImportController.editPendingTransaction
)
router.get('/transaction/:id', AuthMiddleware.isAuthenticated, ImportController.readPendingTransactions)
router.delete('/transaction/:id', AuthMiddleware.isAuthenticated, ImportController.deletePendingTransaction)

export default router
