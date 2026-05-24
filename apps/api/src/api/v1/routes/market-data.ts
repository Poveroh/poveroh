import { Router } from 'express'
import { AuthMiddleware } from '../../../middleware/auth.middleware'
import { MarketDataController } from '../modules/market-data/data/market-data.controller'
import { MarketDataCredentialController } from '../modules/market-data/credentials/market-data-credential.controller'

const router: Router = Router()
const marketDataController = new MarketDataController()
const marketDataCredentialController = new MarketDataCredentialController()

router.get('/providers', AuthMiddleware.isAuthenticated, marketDataController.readProviders.bind(marketDataController))
router.put(
    '/providers/:providerId/credential',
    AuthMiddleware.isAuthenticated,
    marketDataCredentialController.saveProviderCredential.bind(marketDataCredentialController)
)
router.delete(
    '/providers/:providerId/credential',
    AuthMiddleware.isAuthenticated,
    marketDataCredentialController.deleteProviderCredential.bind(marketDataCredentialController)
)

router.get(
    '/instruments',
    AuthMiddleware.isAuthenticated,
    marketDataController.searchInstruments.bind(marketDataController)
)
router.get('/quotes', AuthMiddleware.isAuthenticated, marketDataController.readQuotes.bind(marketDataController))

export default router
