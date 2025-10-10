// packages/server/src/projects/dto/create-world.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for creating a new world.
 * @description This class specifies the shape and validation rules for the data
 * received by the server when a user creates a new world entity. It ensures
 * that the incoming data is well-formed before it reaches the service layer.
 */

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWorldDto {
  /**
   * The name of the new world.
   * @description This is a required field and must be a non-empty string.
   * @example "Middle-earth"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * A brief, high-level theme of the world.
   * @description Can be an empty string if not specified by the user.
   * @example "High Fantasy"
   */
  @IsString()
  theme: string;

  /**
   * The general setting or time period of the world.
   * @description Can be an empty string if not specified by the user.
   * @example "Third Age"
   */
  @IsString()
  setting: string;

  /**
   * A detailed description of the world.
   * @description Can be an empty string if not specified by the user.
   */
  @IsString()
  description: string;
}
