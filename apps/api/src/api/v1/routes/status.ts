import { Router } from 'express'
import { StatusController } from '../modules/status/status.controller'

const router: Router = Router()
const statusController = new StatusController()

router.get('/', statusController.isAlive.bind(statusController))

export default router
