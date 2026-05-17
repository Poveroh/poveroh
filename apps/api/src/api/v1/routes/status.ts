import { Router } from 'express'
import { StatusController } from '../modules/status/status.controller'

const router: Router = Router()

router.get('/', StatusController.isAlive)

export default router
