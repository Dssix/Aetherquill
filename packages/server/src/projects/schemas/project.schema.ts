// packages/server/src/projects/schemas/project.schema.ts

/**
 * This file defines the Mongoose schema for the Project entity.
 * A Project represents a single, self-contained creative work or "chronicle"
 * belonging to a user. It acts as the root container for all related entities
 * like characters, worlds, and timeline events.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';
import {
  Character,
  Era,
  TimelineEvent,
  World,
  WritingEntry,
  CatalogueItem,
} from 'aetherquill-common';

// Defines the document type based on the Project class for Mongoose.
export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true }) // Automatically adds createdAt and updatedAt fields
export class Project {
  /**
   * The unique identifier for the project.
   * This is the native MongoDB _id, and we don't need a separate @Prop for it.
   */
  _id: mongoose.Schema.Types.ObjectId;

  /**
   * The name of the project, e.g., "The Sunstone Chronicle".
   * This is required for every project.
   */
  @Prop({ required: true })
  name: string;

  /**
   * A reference to the User who owns this project.
   * This is the crucial link that establishes ownership and enables data scoping.
   * We store the ObjectId of the User document.
   * The `ref` option tells Mongoose which model to use during population.
   */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  // --- Embedded Entities ---
  // For Aetherquill, we are embedding the entities directly within the project document.
  // This aligns with our "UserData -> ProjectData" local-first model and is efficient
  // for our use case where a project's data is always loaded as a whole.

  @Prop({ type: [Object], default: [] })
  eras: Era[];

  @Prop({ type: [Object], default: [] })
  timeline: TimelineEvent[];

  @Prop({ type: [Object], default: [] })
  characters: Character[];

  @Prop({ type: [Object], default: [] })
  worlds: World[];

  @Prop({ type: [Object], default: [] })
  writings: WritingEntry[];

  @Prop({ type: [Object], default: [] })
  catalogue: CatalogueItem[];
}

// Create the Mongoose schema from the TypeScript class.
export const ProjectSchema = SchemaFactory.createForClass(Project);
