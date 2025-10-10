// packages/server/src/projects/dto/create-era.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new Era.
 * @description This class specifies the shape and validation rules for the data
 * received by the server when a user creates a new historical period.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEraDto {
  /**
   * The name of the new Era.
   * @description This is a required field and must be a non-empty string.
   * @example "The Age of Ascension"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * A detailed description of the Era.
   * @description Can be an empty string if not specified by the user.
   */
  @IsString()
  description: string;
}
