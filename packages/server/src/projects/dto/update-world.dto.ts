// packages/server/src/projects/dto/update-world.dto.ts

/**
 * Data Transfer Object (DTO) for updating an existing world.
 */
import { IsNotEmpty, IsString } from 'class-validator';

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
}
