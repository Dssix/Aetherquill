// packages/server/src/projects/dto/create-character.dto.ts

/**
 * Data Transfer Object (DTO) for creating a new character within a project.
 * It defines the shape and validation rules for the incoming request body.
 */

import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CharacterTrait } from 'aetherquill-common';

export class CreateCharacterDto {
  /**
   * The name of the new character.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The species of the new character. Can be an empty string if not specified.
   */
  @IsString()
  species: string;

  /**
   * The initial array of traits for the character. This includes both the
   * default fields (like Appearance, Background) and any initial custom fields.
   */
  @IsArray()
  @ValidateNested({ each: true }) // This ensures each object in the array is validated
  @Type(() => CharacterTrait) // This is needed for class-validator to know the type of the objects in the array
  traits: CharacterTrait[];
}
