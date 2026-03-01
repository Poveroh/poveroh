import { client } from '@/api/client.gen'
import appConfig from '@/config'

client.setConfig({
    baseUrl: appConfig.apiUrl,
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})

export { client }

export * from '@/api/sdk.gen'
export * from '@/api/types.gen'
