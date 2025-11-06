import { Router } from 'express'
import { auth } from '../../../lib/auth'
import { toNodeHandler } from 'better-auth/node'

const router: Router = Router()

// Debug middleware: log incoming Cookie header and request info, and also log Set-Cookie on response
router.use((req, res, next) => {
    try {
        const cookieHeader = req.headers['cookie'] || req.get('cookie') || ''
        console.log('Auth route incoming request:', {
            method: req.method,
            url: req.originalUrl || req.url,
            host: req.get('host'),
            protocol: req.protocol,
            forwardedProto: req.get('x-forwarded-proto'),
            cookiesHeader: cookieHeader || null
        })
    } catch (e) {
        console.warn('Error logging incoming auth request headers', e)
    }

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
