import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import {
    CreateFinancialAccountBalanceRequestSchema,
    CreateFinancialAccountBalanceResponseSchema,
    ErrorResponseSchema,
    FinancialAccountBalanceRangeQuerySchema,
    FinancialAccountParamsId,
    GetFinancialAccountBalanceSeriesResponseSchema
} from '../schemas'

export const registerFinancialAccountBalancePath = (registry: OpenAPIRegistry) => {
    registry.registerPath({
        method: 'post',
        path: '/financial-accounts/balance',
        tags: ['Financial Account'],
        operationId: 'createFinancialAccountBalance',
        summary: 'Create a manual financial account balance entry',
        description:
            'Records a manual balance anchor for a financial account at a given date and recomputes the subsequent balance time-series',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                description: 'Manual financial account balance data to create',
                required: true,
                content: {
                    'application/json': {
                        schema: CreateFinancialAccountBalanceRequestSchema,
                        encoding: {
                            data: {
                                contentType: 'application/json'
                            }
                        }
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Financial account balance created',
                content: {
                    'application/json': {
                        schema: CreateFinancialAccountBalanceResponseSchema
                    }
                }
            },
            400: {
                description: 'Invalid request',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            401: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            404: {
                description: 'Financial account not found',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            }
        }
    })
    registry.registerPath({
        method: 'get',
        path: '/financial-accounts/{id}/balance-series',
        tags: ['Financial Account'],
        operationId: 'getFinancialAccountBalanceSeries',
        summary: 'Get a financial account balance time-series',
        description: 'Retrieve the daily balance time-series of a financial account within an optional date range',
        security: [{ bearerAuth: [] }],
        request: {
            params: FinancialAccountParamsId.describe('ID of the financial account whose balance series to retrieve'),
            query: FinancialAccountBalanceRangeQuerySchema
        },
        responses: {
            200: {
                description: 'Financial account balance series',
                content: {
                    'application/json': {
                        schema: GetFinancialAccountBalanceSeriesResponseSchema
                    }
                }
            },
            400: {
                description: 'Invalid request',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            401: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            404: {
                description: 'Financial account not found',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: ErrorResponseSchema
                    }
                }
            }
        }
    })
}
