import { IAppConfig } from '@/types/config'

const appConfig: IAppConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Poveroh',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || ''
}

export default appConfig
