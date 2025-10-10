// packages/server/src/projects/dto/update-character.dto.ts
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CharacterTrait } from 'aetherquill-common';

export class UpdateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  species: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacterTrait)
  traits: CharacterTrait[];
}
