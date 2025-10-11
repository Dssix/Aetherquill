// packages/common/src/catalogue.ts

/**
 * @file Defines the shared data model for a CatalogueItem.
 * @description This class is the single source of truth for the shape of a
 * catalogue item, used by both the frontend and backend. It includes
 * validation decorators to ensure data integrity at the model level.
 */

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CatalogueItem {
    /**
     * A unique, server-generated identifier for the item.
     * @example "6525a4b2729578c8723b283a"
     */
    @IsString()
    @IsNotEmpty()
    id!: string;

    /**
     * The name of the catalogue item.
     * @example "Gryphon"
     */
    @IsString()
    @IsNotEmpty()
    name!: string;

    /**
     * The user-defined category for this item.
     * @example "Creatures"
     */
    @IsString()
    @IsNotEmpty()
    category!: string;

    /**
     * A detailed description of the item.
     */
    @IsString()
    description!: string;

    /**
     * An array of Character IDs linked to this item.
     */
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    linkedCharacterIds?: string[];

    /**
     * The ID of a World linked to this item.
     */
    @IsString()
    @IsOptional()
    linkedWorldId?: string | null;

    /**
     * An array of Timeline Event IDs linked to this item.
     */
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    linkedEventIds?: string[];

    /**
     * An array of Writing Entry IDs linked to this item.
     */
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    linkedWritingIds?: string[];
}