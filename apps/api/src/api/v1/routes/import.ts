import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { ImportController } from '../controllers/import.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), ImportController.add)
router.get('/', AuthMiddleware.isAuthenticated, ImportController.read)
router.put('/complete/:id', AuthMiddleware.isAuthenticated, ImportController.complete)
router.delete('/:id', AuthMiddleware.isAuthenticated, ImportController.delete)

router.post('/read-file', AuthMiddleware.isAuthenticated, upload.array('files'), ImportController.parseFile)

router.put(
    '/transaction/:id',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    ImportController.editPendingTransaction
)
router.put(
    '/transaction',
    AuthMiddleware.isAuthenticated,
    upload.single('file'),
    ImportController.editPendingTransaction
)
router.get('/transaction/:id', AuthMiddleware.isAuthenticated, ImportController.readPendingTransactions)
router.delete('/transaction/:id', AuthMiddleware.isAuthenticated, ImportController.deletePendingTransaction)

router.post('/template', AuthMiddleware.isAuthenticated, ImportController.importTemplates)

export default router
