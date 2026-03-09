import { z } from '../zod'
import { ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'

/**
 * Subcategory schema representing a transaction subcategory in the system
 */
export const SubcategorySchema = z
    .object({
        id: z.string().uuid(),
        categoryId: z.string().uuid(),
        title: z.string(),
        description: z.string().optional(),
        logoIcon: z.string().url(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime()
    })
    .openapi('Subcategory')

/**
 * Response schema for getting a list of subcategories
 */
export const GetSubcategoryListResponseSchema = SuccessResponseSchema(SubcategorySchema.array()).openapi(
    'GetSubcategoryListResponse'
)

/**
 * Response schema for getting a single subcategory by ID
 */
export const GetSubcategoryResponseSchema = SuccessResponseSchema(SubcategorySchema).openapi('GetSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Category schema representing a transaction category in the system
 */
export const CreateSubcategoryRequestSchema = SubcategorySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true
}).openapi('CreateSubcategoryRequest')

export const CreateSubcategoryMultipartRequestSchema = MultipartRequestSchema(CreateSubcategoryRequestSchema).openapi(
    'CreateSubcategoryMultipartRequest'
)

/**
 * Response schema for creating a new subcategory
 */
export const CreateSubcategoryResponseSchema =
    SuccessResponseSchema(SubcategorySchema).openapi('CreateSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing subcategory
 */
export const UpdateSubcategoryRequestSchema = SubcategorySchema.partial()
    .omit({
        id: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true
    })
    .openapi('UpdateSubcategoryRequest')

/**
 * Response schema for updating an existing subcategory
 */
export const UpdateSubcategoryResponseSchema = SuccessResponseSchema().openapi('UpdateSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting a subcategory
 */
export const DeleteSubcategoryResponseSchema = SuccessResponseSchema().openapi('DeleteSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for subcategory operations
 */
export const SubcategoryParamsId = SubcategorySchema.pick({
    id: true
}).openapi('SubcategoryParamsId')

/**
 * Subcategory filters schema representing the structure of filters that can be applied when querying subcategories
 */
export const SubcategoryFiltersSchema = z
    .object({
        id: SubcategoryParamsId,
        title: StringFilterSchema.optional(),
        description: StringFilterSchema.optional(),
        categoryId: SubcategorySchema.pick({ categoryId: true }).optional()
    })
    .partial()
    .catchall(z.union([z.string(), StringFilterSchema]))
    .openapi('SubcategoryFilters')

/**
 * Query schema for subcategory filters
 */
export const QuerySubcategoryFiltersSchema =
    ReadQuerySchema(SubcategoryFiltersSchema).openapi('QuerySubcategoryFilters')
