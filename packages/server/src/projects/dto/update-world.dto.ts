// packages/server/src/projects/dto/update-world.dto.ts

/**
 * Data Transfer Object (DTO) for updating an existing world.
 */
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateWorldDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  theme: string;

  @IsString()
  setting: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCharacterIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedWritingIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedEventIds?: string[];
}
