import { Router } from 'express'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

const router: Router = Router()

// Delegate all auth routes to better-auth's node handler
router.all('*', toNodeHandler(auth))

export default router
