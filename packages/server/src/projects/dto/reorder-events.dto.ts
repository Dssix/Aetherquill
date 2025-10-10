// packages/server/src/projects/dto/reorder-events.dto.ts

/**
 * @file Defines the Data Transfer Object (DTO) for reordering Timeline Events.
 * @description This class specifies the shape and validation rules for the data
 * received when a user reorders the events within a specific Era.
 */

import { IsArray, IsString } from 'class-validator';

export class ReorderEventsDto {
  /**
   * An array of Event IDs, sorted in their new, desired display order.
   * @description This is a required field and must be an array of strings.
   * The server will process this array to update the 'order' property of each
   * event within the specified Era.
   * @example ["event-id-3", "event-id-1", "event-id-2"]
   */
  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}
