import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    ErrorResponseSchema,
    GetMarketDataProvidersResponseSchema,
    GetMarketQuotesQuerySchema,
    GetMarketQuotesResponseSchema,
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
