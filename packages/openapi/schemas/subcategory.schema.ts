import { z } from '../zod'

export const SubcategorySchema = z
    .object({
        id: z.string(),
        categoryId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        logoIcon: z.string(),
        createdAt: z.string().datetime()
    })
    .openapi('Subcategory')
