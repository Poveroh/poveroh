import { z } from '../zod'
import { TransactionActionEnum } from './enum.schema'
import { ReadQuerySchema, StringFilterSchema } from './filter.schema'
import { SuccessResponseSchema } from './response.schema'
import { SubcategorySchema } from './subcategory.schema'

/**
 * Category schema representing a transaction category
 */
export const CategorySchema = z
    .object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        title: z.string().nonempty('Title cannot be empty'),
        for: TransactionActionEnum,
        icon: z.string().nonempty(),
        color: z.string().nonempty().default('#8B5CF6'),
        subcategories: z.array(SubcategorySchema).optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        deletedAt: z.string().datetime().optional()
    })
    .openapi('Category')

/**
 * Response schema for getting category data (excluding userId and deletedAt)
 * This is the real Dto used for responses, while CategorySchema is the completed one
 * similar to Schema in DB
 */
export const CategoryDataSchema = CategorySchema.omit({
    userId: true,
    deletedAt: true
}).openapi('CategoryData')

/**
 * Response schema for getting a list of categories
 */
export const GetCategoryListResponseSchema = SuccessResponseSchema(CategoryDataSchema.array()).openapi(
    'GetCategoryListResponse'
)

/**
 * Response schema for getting a single category by ID
 */
export const GetCategoryResponseSchema = SuccessResponseSchema(CategoryDataSchema).openapi('GetCategoryResponse')

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
 * Response schema for creating a new category
 */
export const CreateCategoryResponseSchema = SuccessResponseSchema(CategoryDataSchema).openapi('CreateCategoryResponse')

/**
 * Request schema for creating a new category from template
 */
export const CreateCategoryTemplateSchema = CategorySchema.omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    subcategories: true
})
    .extend({
        subcategories: z
            .array(
                SubcategorySchema.pick({
                    title: true,
                    icon: true
                })
            )
            .optional()
    })
    .openapi('CreateCategoryTemplateRequest')

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
        for: TransactionActionEnum
    })
    .partial()
    .openapi('CategoryFilters')

/**
 * Query schema for category filters
 */
export const QueryCategoryFiltersSchema = ReadQuerySchema(CategoryFiltersSchema).openapi('QueryCategoryFilters')

// ------------------------------------------------------------------------------------------------------------------------------ //

/**
 * Category form schema representing the data structure for category creation and editing forms
 */
export const CategoryFormSchema = CreateCategoryRequestSchema.openapi('CategoryForm')

/**
 * Union schema for category creation and updating requests, allowing the same form to be used for both operations with appropriate validation
 */
export const CreateUpdateCategoryRequestSchema = z
    .union([CreateCategoryRequestSchema, UpdateCategoryRequestSchema])
    .openapi('CreateUpdateCategoryRequest')
