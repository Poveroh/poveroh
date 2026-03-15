import { z } from '../zod'
import { TransactionActionEnum } from './enum.schema'
import { ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { MultipartRequestSchema } from './media.schema'
import { SuccessResponseSchema } from './response.schema'
import { SubcategorySchema } from './subcategory.schema'

/**
 * Category schema representing a transaction category
 */
export const CategorySchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string(),
        description: z.string().optional(),
        for: TransactionActionEnum,
        logoIcon: z.string().url(),
        color: z.string().default('#8B5CF6'),
        subcategories: z.array(SubcategorySchema).optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Category')

/**
 * Response schema for getting category data (excluding userId and deletedAt)
 */
export const CategoryDataSchema = CategorySchema.omit({
    userId: true,
    deletedAt: true
}).openapi('CategoryData')

/**
 * Response schema for getting category data (excluding userId and deletedAt)
 */
export const CategoryDataResponseSchema = CategoryDataSchema.openapi('CategoryDataResponse')

/**
 * Response schema for getting a list of categories
 */
export const GetCategoryListResponseSchema = SuccessResponseSchema(CategoryDataResponseSchema.array()).openapi(
    'GetCategoryListResponse'
)

/**
 * Response schema for getting a single category by ID
 */
export const GetCategoryResponseSchema =
    SuccessResponseSchema(CategoryDataResponseSchema).openapi('GetCategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for creating a new category
 */
export const CreateCategoryRequestSchema = CategorySchema.omit({
    id: true,
    userId: true,
    subcategories: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
}).openapi('CreateCategoryRequest')

/**
 * Request schema for creating a new category with multipart/form-data
 */
export const CreateCategoryMultipartRequestSchema = MultipartRequestSchema(CreateCategoryRequestSchema).openapi(
    'CreateCategoryMultipartRequest'
)
/**
 * Response schema for creating a new category
 */
export const CreateCategoryResponseSchema =
    SuccessResponseSchema(CategoryDataResponseSchema).openapi('CreateCategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Request schema for updating an existing category
 */
export const UpdateCategoryRequestSchema = CategorySchema.partial()
    .omit({
        id: true,
        userId: true,
        subcategories: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true
    })
    .openapi('UpdateCategoryRequest')

/**
 * Response schema for updating an existing category
 */
export const UpdateCategoryResponseSchema = SuccessResponseSchema().openapi('UpdateCategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Response schema for deleting a category
 */
export const DeleteCategoryResponseSchema = SuccessResponseSchema().openapi('DeleteCategoryResponse')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Id parameter schema for referencing specific categories in path parameters
 */
export const CategoryParamsId = CategorySchema.pick({
    id: true
}).openapi('CategoryParamsId')

/**
 * Category filters schema representing the structure of filters that can be applied when querying categories
 */
export const CategoryFiltersSchema = z
    .object({
        id: CategoryParamsId,
        title: StringFilterSchema,
        description: StringFilterSchema,
        for: TransactionActionEnum
    })
    .partial()
    .openapi('CategoryFilters')

/**
 * Query schema for category filters
 */
export const QueryCategoryFiltersSchema = ReadQuerySchema(CategoryFiltersSchema).openapi('QueryCategoryFilters')
