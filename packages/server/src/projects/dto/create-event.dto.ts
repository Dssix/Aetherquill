// packages/server/src/projects/dto/create-event.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new Timeline Event.
 * @description This class specifies the shape and validation rules for the data
 * received when a user creates a new event within an Era.
 */

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  /**
   * The title or name of the event.
   * @description This is a required field and must be a non-empty string.
   * @example "The Battle of Blackwater Bridge"
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * A narrative-friendly, user-defined date string.
   * @description This field is for display purposes only and is not used for sorting.
   * @example "15th Day of the Sun's Height"
   */
  @IsString()
  displayDate: string;

  /**
   * A detailed description of the event.
   * @description Can be an empty string if not specified.
   */
  @IsString()
  description: string;

  /**
   * An optional array of string tags for categorization.
   * @example ["major-battle", "political-intrigue"]
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  /**
   * An optional array of Character IDs to be linked to this event.
   * @description Validates that if provided, it is an array of strings.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  /**
   * An optional array of Writing Entry IDs to be linked to this event.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedWritingIds?: string[];
}
