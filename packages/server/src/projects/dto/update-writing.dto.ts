// packages/server/src/projects/dto/update-writing.dto.ts

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateWritingDto {
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  @IsString()
  @IsOptional()
  linkedWorldId?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedEventIds?: string[];
}
