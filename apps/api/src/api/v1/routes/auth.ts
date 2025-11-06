import { Router } from 'express'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

const router: Router = Router()

// Debug middleware: after the auth handler finishes, log any Set-Cookie headers
router.use((req, res, next) => {
    // When response finishes, log Set-Cookie header for debugging
    res.on('finish', () => {
        try {
            const sc = res.getHeader('set-cookie')
            console.log('Auth route response Set-Cookie:', sc)
        } catch (e) {
            console.warn('Could not read Set-Cookie header', e)
        }
    })
    next()
})

// Delegate all auth routes to better-auth's node handler
router.all('*', toNodeHandler(auth))

export default router
