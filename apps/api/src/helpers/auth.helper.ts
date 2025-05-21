import { UAParser } from 'ua-parser-js'
import config from '../utils/environment'
import jwt from 'jsonwebtoken'

export const AuthHelper = {
    generateToken(user: { id: string; email: string }) {
        return jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET || '-', {
            expiresIn: '24h'
        })
    },

    getDeviceInfo(userAgent?: string) {
        const parser = new UAParser()
        const agent = parser.setUA(userAgent || '').getResult()

        return {
            browser: `${agent.browser.name || 'Unknown'} ${agent.browser.major || ''}`.trim(),
            os: `${agent.os.name || 'Unknown'} ${agent.os.version || ''}`.trim()
        }
    }
}
