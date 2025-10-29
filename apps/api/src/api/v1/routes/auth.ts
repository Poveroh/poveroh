import { Router } from 'express'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

const router: Router = Router()

router.all('*', toNodeHandler(auth))

export default router
