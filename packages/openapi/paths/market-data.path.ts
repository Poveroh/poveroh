import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    DeleteMarketDataProviderCredentialResponseSchema,
    ErrorResponseSchema,
    GetMarketDataProvidersResponseSchema,
    GetMarketQuotesQuerySchema,
    GetMarketQuotesResponseSchema,
    SaveMarketDataProviderCredentialRequestSchema,
    SaveMarketDataProviderCredentialResponseSchema,
    SaveMarketDataProviderPathParamsSchema,
    SearchMarketInstrumentsQuerySchema,
    SearchMarketInstrumentsResponseSchema
} from '../schemas'

export const registerMarketDataPath = (registry: OpenAPIRegistry) => {
    // GET /market-data/providers
    registry.registerPath({
        method: 'get',
        path: '/market-data/providers',
        tags: ['Market Data'],
        operationId: 'getMarketDataProviders',
        summary: 'Get market data providers',
        description: 'List the enabled raw market data providers and their capabilities',
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: 'Provider list',
                content: {
                    'application/json': { schema: GetMarketDataProvidersResponseSchema }
                }
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // PUT /market-data/providers/{providerId}/credential
    registry.registerPath({
        method: 'put',
        path: '/market-data/providers/{providerId}/credential',
        tags: ['Market Data'],
        operationId: 'saveMarketDataProviderCredential',
        summary: 'Save market data provider credential',
        description: 'Encrypt and store the authenticated users provider API key server-side',
        security: [{ bearerAuth: [] }],
        request: {
            params: SaveMarketDataProviderPathParamsSchema,
            body: {
                content: {
                    'application/json': {
                        schema: SaveMarketDataProviderCredentialRequestSchema
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Credential saved',
                content: {
                    'application/json': { schema: SaveMarketDataProviderCredentialResponseSchema }
                }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // DELETE /market-data/providers/{providerId}/credential
    registry.registerPath({
        method: 'delete',
        path: '/market-data/providers/{providerId}/credential',
        tags: ['Market Data'],
        operationId: 'deleteMarketDataProviderCredential',
        summary: 'Delete market data provider credential',
        description: 'Delete the authenticated users encrypted provider API key',
        security: [{ bearerAuth: [] }],
        request: {
            params: SaveMarketDataProviderPathParamsSchema
        },
        responses: {
            200: {
                description: 'Credential deleted',
                content: {
                    'application/json': { schema: DeleteMarketDataProviderCredentialResponseSchema }
                }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // GET /market-data/instruments
    registry.registerPath({
        method: 'get',
        path: '/market-data/instruments',
        tags: ['Market Data'],
        operationId: 'searchMarketInstruments',
        summary: 'Search instruments',
        description: 'Search provider instruments and return a normalized instrument list',
        security: [{ bearerAuth: [] }],
        request: {
            query: SearchMarketInstrumentsQuerySchema
        },
        responses: {
            200: {
                description: 'Instrument list',
                content: { 'application/json': { schema: SearchMarketInstrumentsResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })

    // GET /market-data/quotes
    registry.registerPath({
        method: 'get',
        path: '/market-data/quotes',
        tags: ['Market Data'],
        operationId: 'getMarketQuotes',
        summary: 'Get quotes',
        description: 'Fetch normalized live quotes using the selected provider',
        security: [{ bearerAuth: [] }],
        request: {
            query: GetMarketQuotesQuerySchema
        },
        responses: {
            200: {
                description: 'Quote list',
                content: { 'application/json': { schema: GetMarketQuotesResponseSchema } }
            },
            400: { description: 'Invalid request', content: { 'application/json': { schema: ErrorResponseSchema } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponseSchema } } },
            500: {
                description: 'Internal server error',
                content: { 'application/json': { schema: ErrorResponseSchema } }
            }
        }
    })
}
