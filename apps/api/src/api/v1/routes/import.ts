import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { upload } from '../../../middleware/upload.middleware'
import { ImportController } from '../modules/imports/import.controller'

const router: Router = Router()
const importController = new ImportController()

router.post(
    '/',
    AuthMiddleware.isAuthenticated,
    upload.array('file'),
    importController.createImport.bind(importController)
)
router.post(
    '/template/:action',
    AuthMiddleware.isAuthenticated,
    importController.importTemplates.bind(importController)
)
router.get('/', AuthMiddleware.isAuthenticated, importController.readImports.bind(importController))
router.get('/:id', AuthMiddleware.isAuthenticated, importController.readImportById.bind(importController))
router.get(
    '/:id/transactions',
    AuthMiddleware.isAuthenticated,
    importController.readImportTransactions.bind(importController)
)
router.patch(
    '/:id/transactions/approve',
    AuthMiddleware.isAuthenticated,
    importController.approveImportTransactions.bind(importController)
)
router.patch('/complete/:id', AuthMiddleware.isAuthenticated, importController.completeImport.bind(importController))
router.patch('/rollback/:id', AuthMiddleware.isAuthenticated, importController.rollbackImport.bind(importController))
router.put('/:id', AuthMiddleware.isAuthenticated, importController.updateImport.bind(importController))
router.delete('/:id', AuthMiddleware.isAuthenticated, importController.deleteImport.bind(importController))
router.delete('/', AuthMiddleware.isAuthenticated, importController.deleteAllImports.bind(importController))

export default router
