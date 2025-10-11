// packages/server/src/projects/dto/update-catalogue-item.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for updating an existing Catalogue Item.
 * @description This class specifies the shape and validation rules for the data
 * received when a user updates a lore item.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCatalogueItemDto {
  /**
   * The name of the catalogue item.
   * @description This is a required field and must be a non-empty string.
   * @example "Golden Gryphon"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The user-defined category for this item.
   * @description This is a required field and is used for organization and uniqueness checks.
   * @example "Mythical Creatures"
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
}
