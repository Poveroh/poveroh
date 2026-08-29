import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { BankConnectionController } from '../modules/bank-sync/connections/bank-connection.controller'
import { BankSyncAccountController } from '../modules/bank-sync/accounts/bank-sync-account.controller'
import { BankSyncAppCredentialController } from '../modules/bank-sync/app-credentials/bank-sync-app-credential.controller'
import { BankSyncWebhookController } from '../modules/bank-sync/webhooks/bank-sync-webhook.controller'

const router: Router = Router()
const bankConnectionController = new BankConnectionController()
const bankSyncAccountController = new BankSyncAccountController()
const bankSyncAppCredentialController = new BankSyncAppCredentialController()
const bankSyncWebhookController = new BankSyncWebhookController()

router.get(
    '/providers',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.readProviders.bind(bankConnectionController)
)
router.put(
    '/providers/:providerId/app-credential',
    AuthMiddleware.isAuthenticated,
    bankSyncAppCredentialController.saveProviderAppCredential.bind(bankSyncAppCredentialController)
)
router.delete(
    '/providers/:providerId/app-credential',
    AuthMiddleware.isAuthenticated,
    bankSyncAppCredentialController.deleteProviderAppCredential.bind(bankSyncAppCredentialController)
)

router.get(
    '/connections',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.listConnections.bind(bankConnectionController)
)
router.post(
    '/connections',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.createConnection.bind(bankConnectionController)
)
router.post(
    '/connections/:connectionId/complete',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.completeConnection.bind(bankConnectionController)
)
router.post(
    '/connections/:connectionId/sync',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.triggerSync.bind(bankConnectionController)
)
router.delete(
    '/connections/:connectionId',
    AuthMiddleware.isAuthenticated,
    bankConnectionController.deleteConnection.bind(bankConnectionController)
)

router.get(
    '/connections/:connectionId/accounts',
    AuthMiddleware.isAuthenticated,
    bankSyncAccountController.listExternalAccounts.bind(bankSyncAccountController)
)
router.post(
    '/connections/:connectionId/accounts',
    AuthMiddleware.isAuthenticated,
    bankSyncAccountController.linkAccounts.bind(bankSyncAccountController)
)

router.post('/webhooks/:providerId', bankSyncWebhookController.handleWebhook.bind(bankSyncWebhookController))

export default router
