import { ICategory, ISubcategory } from '@poveroh/types'
import { BaseService } from './base.service'

export class CategoryService extends BaseService<ICategory> {
    constructor() {
        super('/category')
    }
}

export class SubcategoryService extends BaseService<ISubcategory> {
    constructor() {
        super('/subcategory')
    }
}
