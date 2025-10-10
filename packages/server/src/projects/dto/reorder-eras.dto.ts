// packages/server/src/projects/dto/reorder-eras.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for reordering Eras.
 * @description This class specifies the shape and validation rules for the data
 * received by the server when a user reorders the Eras in their timeline.
 */

import { IsArray, IsString } from 'class-validator';

export class ReorderErasDto {
  /**
   * An array of Era IDs, sorted in their new, desired display order.
   * @description This is a required field and must be an array of strings.
   * The server will process this array to update the 'order' property of each Era.
   * @example ["era-id-3", "era-id-1", "era-id-2"]
   */
  @IsArray()
  @IsString({ each: true }) // Validates that each element in the array is a string
  orderedIds: string[];
}
