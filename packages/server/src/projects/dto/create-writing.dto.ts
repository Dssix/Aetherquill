// packages/server/src/projects/dto/create-writing.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new writing entry.
 * @description This class specifies the shape and validation rules for the data
 * received by the server when a user creates a new manuscript or note.
 */

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWritingDto {
  /**
   * The title of the writing entry.
   * @description This is a required field and must be a non-empty string.
   * @example "Chapter 1: The Shadow's Approach"
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * The main content of the writing entry, stored as raw Markdown.
   * @description Can be an empty string for a new, untitled entry.
   */
  @IsString()
  content: string;

  /**
   * An optional array of string tags for categorization.
   * @description If provided, it must be an array of strings.
   * @example ["prologue", "world-building"]
   */
  @IsArray()
  @IsString({ each: true }) // Validates that each element in the array is a string
  @IsOptional() // The entire array is optional
  tags?: string[];

  /**
   * An optional array of Character IDs to be linked to this writing entry.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  /**
   * An optional World ID to be linked to this writing entry.
   * Can be a string or null.
   */
  @IsString()
  @IsOptional()
  linkedWorldId?: string | null;

  /**
   * An optional array of Timeline Event IDs to be linked to this writing entry.
   */
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedEventIds?: string[];
}
