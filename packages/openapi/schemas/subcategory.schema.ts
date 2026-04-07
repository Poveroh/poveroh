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
        logoIcon: z.string().url(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Subcategory')

/**
 * Response schema for getting subcategory data (excluding categoryId and deletedAt)
 * This is the real Dto used for responses, while SubcategorySchema is the completed one
 * similar to Schema in DB
 */
export const SubcategoryDataSchema = SubcategorySchema.omit({
    deletedAt: true
}).openapi('SubcategoryData')

/**
 * Response schema for getting a list of subcategories
 */
export const GetSubcategoryListResponseSchema = SuccessResponseSchema(SubcategoryDataSchema.array()).openapi(
    'GetSubcategoryListResponse'
)

/**
 * Response schema for getting a single subcategory by ID
 */
export const GetSubcategoryResponseSchema =
    SuccessResponseSchema(SubcategoryDataSchema).openapi('GetSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Category schema representing a transaction category in the system
 */
export const CreateSubcategoryRequestSchema = SubcategorySchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateSubcategoryRequest')

/**
 * Response schema for creating a new subcategory
 */
export const CreateSubcategoryResponseSchema =
    SuccessResponseSchema(SubcategoryDataSchema).openapi('CreateSubcategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing subcategory
 */
export const UpdateSubcategoryRequestSchema = SubcategorySchema.partial()
    .omit({
        id: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
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

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Subcategory form schema representing the data structure for subcategory creation and editing forms
 */
export const SubcategoryFormSchema = CreateSubcategoryRequestSchema.openapi('SubcategoryForm')

/**
 * Union schema for subcategory creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateSubcategoryRequestSchema = z
    .union([CreateSubcategoryRequestSchema, UpdateSubcategoryRequestSchema])
    .openapi('CreateUpdateSubcategoryRequest')
