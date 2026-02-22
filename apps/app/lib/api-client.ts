import { client } from '@/generated/api/client.gen'
import appConfig from '@/config'

// Configure the API client with base URL and credentials
client.setConfig({
    baseUrl: appConfig.apiUrl,
    // Include credentials (cookies) in requests
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Re-export the configured client
export { client }

// Re-export all SDK functions and types
export * from '@/generated/api/sdk.gen'
export * from '@/generated/api/types.gen'
