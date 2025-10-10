// packages/server/src/projects/projects.service.ts

/**
 * The service layer for the Projects module.
 * It contains the core business logic for creating, reading, updating,
 * and deleting projects, interacting directly with the database.
 */

import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Model } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserDocument } from '../auth/schemas/user.schema';
import { UpdateProjectDto } from './dto/update-project.dto';
import mongoose from 'mongoose';
import { Character, World, WritingEntry } from 'aetherquill-common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateWorldDto } from './dto/create-world.dto';
import { UpdateWorldDto } from './dto/update-world.dto';
import { CreateWritingDto } from './dto/create-writing.dto';
import { UpdateWritingDto } from './dto/update-writing.dto';

@Injectable()
export class ProjectsService {
  /**
   * Injects the Mongoose model for the Project schema, allowing this service
   * to perform CRUD operations on the 'projects' collection in MongoDB.
   * @param projectModel The Mongoose model for the Project document.
   */
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  /**
   * Creates a new project in the database and associates it with the provided user.
   * @param createProjectDto The data for the new project (e.g., its name).
   * @param user The authenticated user document, who will become the project owner.
   * @returns The newly created project document.
   */
  async createProject(
    createProjectDto: CreateProjectDto,
    user: UserDocument,
  ): Promise<ProjectDocument> {
    // Check if a project with the same name already exists for this specific user.
    const existingProject = await this.projectModel.findOne({
      name: createProjectDto.name,
      owner: user._id, // The crucial part: scope the check to the current user
    });

    if (existingProject) {
      // If a project is found, throw a 409 Conflict exception.
      throw new ConflictException(
        'A project with this name already exists for your account.',
      );
    }

    // Create a new project document in memory.
    const newProject = new this.projectModel({
      ...createProjectDto, // Spread the properties from the DTO (e.g., name)
      owner: user._id, // Set the owner to the authenticated user's ID
    });

    // Save the new project to the database.
    return newProject.save();
  }

  /**
   * Retrieves all projects owned by a specific user.
   * @param user The authenticated user document whose projects are to be fetched.
   * @returns A promise that resolves to an array of project documents.
   */
  async getProjectsForUser(user: UserDocument): Promise<ProjectDocument[]> {
    // Use the projectModel to find all documents where the 'owner' field
    // matches the provided user's _id.
    return this.projectModel.find({ owner: user._id }).exec();
  }

  /**
   * Deletes a project after verifying ownership.
   * @param projectId The ID of the project to be deleted.
   * @param user The authenticated user attempting the deletion.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteProject(projectId: string, user: UserDocument): Promise<void> {
    // Find the project by its ID.
    const project = await this.projectModel.findById(projectId).exec();

    // If the project doesn't exist, throw a 404 Not Found error.
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }

    // Compare the project's owner ID with the ID of the user making the request.
    // We must convert the ObjectId to a string for a reliable comparison.
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to delete this project.',
      );
    }

    // Step 4: If all checks pass, delete the project.
    await this.projectModel.deleteOne({ _id: projectId }).exec();
  }

  /**
   * Updates an existing project after verifying ownership and checking for name conflicts.
   * @param projectId The ID of the project to update.
   * @param updateProjectDto The data containing the updates (e.g., new name).
   * @param user The authenticated user attempting the update.
   * @returns The updated project document.
   */
  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    user: UserDocument,
  ): Promise<ProjectDocument> {
    // Step 1: Find the project by its ID.
    const project = await this.projectModel.findById(projectId).exec();

    // Step 2: If the project doesn't exist, throw a 404 Not Found error.
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }

    // Step 3: Perform the AUTHORIZATION check.
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    // Step 4: Check for name conflicts with OTHER projects.
    // A user should not be able to rename Project A to the same name as their existing Project B.
    if (updateProjectDto.name !== project.name) {
      const existingProject = await this.projectModel.findOne({
        name: updateProjectDto.name,
        owner: user._id,
      });
      if (existingProject) {
        throw new ConflictException(
          'A project with this name already exists for your account.',
        );
      }
    }

    // Step 5: Apply the updates and save the document.
    project.name = updateProjectDto.name;
    return project.save();
  }

  /**
   * Creates a new character and adds it to a specific project.
   * @param projectId The ID of the project to add the character to.
   * @param createCharacterDto The data for the new character.
   * @param user The authenticated user, for ownership verification.
   * @returns The newly created character object.
   */
  async createCharacter(
    projectId: string,
    createCharacterDto: CreateCharacterDto,
    user: UserDocument,
  ): Promise<Character> {
    //  Find the project and perform the AUTHORIZATION check.
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add a character to this project.',
      );
    }

    // Construct the new character object.
    // We generate a new MongoDB ObjectId for the character's unique ID.
    const newCharacter: Character = {
      id: new mongoose.Types.ObjectId().toHexString(),
      ...createCharacterDto,
      // Ensure linking fields are initialized if not provided.
      linkedWorldId: null,
      linkedEventIds: [],
      linkedWritingIds: [],
    };

    // Step 3: Add the new character to the project's characters array.
    project.characters.push(newCharacter);

    // Step 4: Save the parent project document.
    await project.save();

    // Step 5: Return the newly created character object as confirmation.
    return newCharacter;
  }

  /**
   * Retrieves all characters from a specific project after verifying ownership.
   * @param projectId The ID of the project whose characters are to be fetched.
   * @param user The authenticated user, for ownership verification.
   * @returns A promise that resolves to an array of Character objects.
   */
  async getCharactersInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<Character[]> {
    // Step 1: Find the project and perform the AUTHORIZATION check.
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view characters in this project.',
      );
    }

    // Step 2: If all checks pass, return the project's embedded characters array.
    return project.characters;
  }

  /**
   * Updates an existing character within a specific project.
   * @param projectId The ID of the project containing the character.
   * @param characterId The ID of the character to update.
   * @param updateCharacterDto The data containing the updates.
   * @param user The authenticated user, for ownership verification.
   * @returns The updated character object.
   */
  async updateCharacter(
    projectId: string,
    characterId: string,
    updateCharacterDto: UpdateCharacterDto,
    user: UserDocument,
  ): Promise<Character> {
    // Find the project and perform the AUTHORIZATION check.
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    // Find the specific character within the project's array.
    const characterIndex = project.characters.findIndex(
      (c) => c.id === characterId,
    );
    if (characterIndex === -1) {
      throw new NotFoundException(
        `Character with ID "${characterId}" not found in this project.`,
      );
    }

    // Create the updated character object.
    // We merge the existing character data with the new data from the DTO.
    const updatedCharacter: Character = {
      ...project.characters[characterIndex], // Start with the original character data
      ...updateCharacterDto, // Overwrite with the new data
      id: characterId, // Ensure the original ID is preserved
    };

    // Replace the old character object with the updated one in the array.
    project.characters[characterIndex] = updatedCharacter;

    // Mark the array as modified for Mongoose to detect the change.
    project.markModified('characters');

    // Save the parent project document.
    await project.save();

    // SReturn the updated character object.
    return updatedCharacter;
  }

  /**
   * Deletes a character from a specific project.
   * @param projectId The ID of the project containing the character.
   * @param characterId The ID of the character to delete.
   * @param user The authenticated user, for ownership verification.
   * @returns A promise that resolves when the operation is complete.
   */
  async deleteCharacter(
    projectId: string,
    characterId: string,
    user: UserDocument,
  ): Promise<void> {
    // Find the project and perform the AUTHORIZATION check.
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    // Find the character to ensure it exists before attempting deletion.
    const characterExists = project.characters.some(
      (c) => c.id === characterId,
    );
    if (!characterExists) {
      throw new NotFoundException(
        `Character with ID "${characterId}" not found in this project.`,
      );
    }

    // Remove the character from the array using Array.prototype.filter.
    project.characters = project.characters.filter((c) => c.id !== characterId);

    // Mark the array as modified and save the parent project.
    project.markModified('characters');
    await project.save();
  }

  // =============================================================================
  // WORLDS SERVICE METHODS
  // =============================================================================

  /**
   * Creates a new world and adds it to a specified project.
   *
   * @param projectId The identifier of the target project.
   * @param createWorldDto The data for the new world.
   * @param user The authenticated user performing the action.
   * @returns The newly created world object.
   * @throws {NotFoundException} If the project is not found.
   * @throws {ForbiddenException} If the user does not own the project.
   */
  async createWorld(
    projectId: string,
    createWorldDto: CreateWorldDto,
    user: UserDocument,
  ): Promise<World> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add a world to this project.',
      );
    }

    const newWorld: World = {
      id: new mongoose.Types.ObjectId().toHexString(),
      ...createWorldDto,
      // Initialize linking fields to ensure data consistency.
      linkedCharacterIds: [],
      linkedWritingIds: [],
      linkedEventIds: [],
    };

    project.worlds.push(newWorld);
    await project.save();

    return newWorld;
  }

  /**
   * Retrieves all worlds within a specific project.
   *
   * @param projectId The identifier of the target project.
   * @param user The authenticated user performing the action.
   * @returns An array of world objects.
   * @throws {NotFoundException} If the project is not found.
   * @throws {ForbiddenException} If the user does not own the project.
   */
  async getWorldsInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<World[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view worlds in this project.',
      );
    }

    return project.worlds;
  }

  /**
   * Updates an existing world within a project.
   *
   * @param projectId The identifier of the target project.
   * @param worldId The identifier of the world to update.
   * @param updateWorldDto The data containing the updates.
   * @param user The authenticated user performing the action.
   * @returns The updated world object.
   * @throws {NotFoundException} If the project or world is not found.
   * @throws {ForbiddenException} If the user does not own the project.
   */
  async updateWorld(
    projectId: string,
    worldId: string,
    updateWorldDto: UpdateWorldDto,
    user: UserDocument,
  ): Promise<World> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const worldIndex = project.worlds.findIndex((w) => w.id === worldId);
    if (worldIndex === -1) {
      throw new NotFoundException(
        `World with ID "${worldId}" not found in this project.`,
      );
    }

    const updatedWorld: World = {
      ...project.worlds[worldIndex],
      ...updateWorldDto,
      id: worldId,
    };

    project.worlds[worldIndex] = updatedWorld;
    project.markModified('worlds');
    await project.save();

    return updatedWorld;
  }

  /**
   * Deletes a world from a project.
   *
   * @param projectId The identifier of the target project.
   * @param worldId The identifier of the world to delete.
   * @param user The authenticated user performing the action.
   * @throws {NotFoundException} If the project or world is not found.
   * @throws {ForbiddenException} If the user does not own the project.
   */
  async deleteWorld(
    projectId: string,
    worldId: string,
    user: UserDocument,
  ): Promise<void> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const initialLength = project.worlds.length;
    project.worlds = project.worlds.filter((w) => w.id !== worldId);

    if (project.worlds.length === initialLength) {
      throw new NotFoundException(
        `World with ID "${worldId}" not found in this project.`,
      );
    }

    project.markModified('worlds');
    await project.save();
  }

  // =============================================================================
  // WRITINGS SERVICE METHODS
  // =============================================================================

  /**
   * Creates a new writing entry and adds it to a specified project.
   * @param projectId The identifier of the target project.
   * @param createWritingDto The data for the new writing entry.
   * @param user The authenticated user performing the action.
   * @returns The newly created writing entry object.
   */
  async createWriting(
    projectId: string,
    createWritingDto: CreateWritingDto,
    user: UserDocument,
  ): Promise<WritingEntry> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add a writing entry to this project.',
      );
    }

    const newWriting: WritingEntry = {
      id: new mongoose.Types.ObjectId().toHexString(),
      ...createWritingDto,
      // Generate server-side timestamps for data integrity.
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Ensure linking fields are initialized.
      linkedCharacterIds: [],
      linkedWorldId: null,
      linkedEventIds: [],
    };

    project.writings.push(newWriting);
    await project.save();

    return newWriting;
  }

  /**
   * Retrieves all writing entries within a specific project.
   *
   * @param projectId The identifier of the target project.
   * @param user The authenticated user performing the action.
   * @returns An array of writing entry objects.
   */
  async getWritingsInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<WritingEntry[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view writing entries in this project.',
      );
    }

    return project.writings;
  }

  /**
   * Updates an existing writing entry within a project.
   *
   * @param projectId The identifier of the target project.
   * @param writingId The identifier of the writing entry to update.
   * @param updateWritingDto The data containing the updates.
   * @param user The authenticated user performing the action.
   * @returns The updated writing entry object.
   */
  async updateWriting(
    projectId: string,
    writingId: string,
    updateWritingDto: UpdateWritingDto,
    user: UserDocument,
  ): Promise<WritingEntry> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const writingIndex = project.writings.findIndex((w) => w.id === writingId);
    if (writingIndex === -1) {
      throw new NotFoundException(
        `Writing entry with ID "${writingId}" not found in this project.`,
      );
    }

    const updatedWriting: WritingEntry = {
      ...project.writings[writingIndex],
      ...updateWritingDto,
      id: writingId,
      // Critically, update the 'updatedAt' timestamp on every modification.
      updatedAt: Date.now(),
    };

    project.writings[writingIndex] = updatedWriting;
    project.markModified('writings');
    await project.save();

    return updatedWriting;
  }

  /**
   * Deletes a writing entry from a project.
   *
   * @param projectId The identifier of the target project.
   * @param writingId The identifier of the writing entry to delete.
   * @param user The authenticated user performing the action.
   */
  async deleteWriting(
    projectId: string,
    writingId: string,
    user: UserDocument,
  ): Promise<void> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const initialLength = project.writings.length;
    project.writings = project.writings.filter((w) => w.id !== writingId);

    if (project.writings.length === initialLength) {
      throw new NotFoundException(
        `Writing entry with ID "${writingId}" not found in this project.`,
      );
    }

    project.markModified('writings');
    await project.save();
  }
}
