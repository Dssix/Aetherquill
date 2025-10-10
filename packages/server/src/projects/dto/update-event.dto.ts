// packages/server/src/projects/dto/update-event.dto.ts

import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEventDto {
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
}
