import { z } from '../zod'

export const CategorySchema = z
    .object({
        id: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        for: z.string(),
        logoIcon: z.string(),
        color: z.string(),
        subcategories: z.array(z.any()),
        createdAt: z.string().datetime()
    })
    .openapi('Category')

export const CategoryRequestSchema = z
    .object({
        title: z.string(),
        description: z.string().nullable(),
        for: z.string(),
        logoIcon: z.string(),
        color: z.string(),
        subcategories: z.array(z.any()).optional()
    })
    .openapi('CategoryRequest')

export const CategoryResponseSchema = CategorySchema.extend({
    subcategories: z.array(z.any())
}).openapi('CategoryResponse')
