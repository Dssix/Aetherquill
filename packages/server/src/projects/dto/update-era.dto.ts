// packages/server/src/projects/dto/update-era.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEraDto {
  /**
   * The new name of the new Era.
   * @description This is a required field and must be a non-empty string.
   * @example "The Age of Ascension"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * A detailed description of the Era.
   * @description Can be an empty string if not specified by the user.
   */
  @IsString()
  description: string;
}
