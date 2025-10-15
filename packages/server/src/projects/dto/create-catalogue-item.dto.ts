// packages/server/src/projects/dto/create-catalogue-item.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new Catalogue Item.
 * @description This class specifies the shape and validation rules for the data
 * received when a user creates a new lore item (e.g., creature, artifact).
 */

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCatalogueItemDto {
  /**
   * The name of the new catalogue item.
   * @description This is a required field and must be a non-empty string.
   * @example "Gryphon"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The user-defined category for this item.
   * @description This is a required field and is used for organization and uniqueness checks.
   * @example "Creatures"
   */
  @IsString()
  @IsNotEmpty()
  category: string;

  /**
   * A detailed description of the item.
   * @description Can be an empty string if not specified.
   */
  @IsString()
  description: string;

  /**
   * An optional array of Character IDs to be linked to this item.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  /**
   * An optional World ID to be linked to this item.
   */
  @IsString()
  @IsOptional()
  linkedWorldId?: string | null;

  /**
   * An optional array of Timeline Event IDs to be linked to this item.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedEventIds?: string[];

  /**
   * An optional array of Writing Entry IDs to be linked to this item.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedWritingIds?: string[];
}
