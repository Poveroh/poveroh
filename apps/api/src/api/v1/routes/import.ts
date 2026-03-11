import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { ImportController } from '../controllers/import.controller'

const router: Router = Router()

router.post('/', AuthMiddleware.isAuthenticated, upload.single('file'), ImportController.createImport)
router.get('/', AuthMiddleware.isAuthenticated, ImportController.readImports)
router.get('/:id', AuthMiddleware.isAuthenticated, ImportController.readImportById)
router.patch('/complete/:id', AuthMiddleware.isAuthenticated, ImportController.completeImport)
router.put('/:id', AuthMiddleware.isAuthenticated, ImportController.updateImport)
router.delete('/:id', AuthMiddleware.isAuthenticated, ImportController.deleteImport)
router.delete('/', AuthMiddleware.isAuthenticated, ImportController.deleteAllImports)

router.post('/read-file', AuthMiddleware.isAuthenticated, upload.array('files'), ImportController.parseFile)

export default router
