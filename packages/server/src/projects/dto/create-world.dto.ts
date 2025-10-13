// packages/server/src/projects/dto/create-world.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new world.
 * @description This class specifies the shape and validation rules for the data
 * received by the server when a user creates a new world entity. It ensures
 * that the incoming data is well-formed before it reaches the service layer.
 */

import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateWorldDto {
  /**
   * The name of the new world.
   * @description This is a required field and must be a non-empty string.
   * @example "Middle-earth"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * A brief, high-level theme of the world.
   * @description Can be an empty string if not specified by the user.
   * @example "High Fantasy"
   */
  @IsString()
  theme: string;

  /**
   * The general setting or time period of the world.
   * @description Can be an empty string if not specified by the user.
   * @example "Third Age"
   */
  @IsString()
  setting: string;

  /**
   * A detailed description of the world.
   * @description Can be an empty string if not specified by the user.
   */
  @IsString()
  description: string;

  /**
   * An optional array of Character IDs to be linked to this world.
   * @description Validates that if provided, it is an array of strings.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  /**
   * An optional array of Writing Entry IDs to be linked to this world.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedWritingIds?: string[];

  /**
   * An optional array of Timeline Event IDs to be linked to this world.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedEventIds?: string[];
}
