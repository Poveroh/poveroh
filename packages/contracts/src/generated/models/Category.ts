/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Subcategory } from './Subcategory';
import type { TransactionAction } from './TransactionAction';
export type Category = {
    id: string;
    userId: string;
    title: string;
    description?: string | null;
    for: TransactionAction;
    logoIcon: string;
    color: string;
    subcategories: Array<Subcategory>;
    createdAt: string;
};

