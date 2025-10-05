// packages/server/src/projects/dto/create-project.dto.ts

/**
 * Data Transfer Object (DTO) for creating a new project.
 * It defines the shape and validation rules for the incoming request body.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  /**
   * The name of the new project.
   * It must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
