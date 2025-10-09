// packages/server/src/projects/dto/update-project.dto.ts

/**
 * Data Transfer Object (DTO) for updating an existing project.
 * It defines the shape and validation rules for the incoming request body.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProjectDto {
  /**
   * The new name for the project.
   * It must be a non-empty string.
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
