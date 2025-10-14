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
import {
  ProjectData,
  Character,
  World,
  WritingEntry,
  Era,
  TimelineEvent,
  CatalogueItem,
} from 'aetherquill-common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CreateWorldDto } from './dto/create-world.dto';
import { UpdateWorldDto } from './dto/update-world.dto';
import { CreateWritingDto } from './dto/create-writing.dto';
import { UpdateWritingDto } from './dto/update-writing.dto';
import { CreateEraDto } from './dto/create-era.dto';
import { UpdateEraDto } from './dto/update-era.dto';
import { ReorderErasDto } from './dto/reorder-eras.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReorderEventsDto } from './dto/reorder-events.dto';
import { CreateCatalogueItemDto } from './dto/create-catalogue-item.dto';
import { UpdateCatalogueItemDto } from './dto/update-catalogue-item.dto';

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
   * A private helper to transform a Mongoose Project document into the
   * clean ProjectData object expected by the frontend.
   * @param project The Mongoose document to transform.
   * @returns A frontend-safe ProjectData object.
   */
  public toProjectData(project: ProjectDocument): ProjectData {
    // Explicitly access the ObjectId's reliable toString method.
    // This is a safe and correct operation.
    const projectId = project._id.toString();
    return {
      projectId: projectId,
      name: project.name,
      eras: project.eras,
      timeline: project.timeline,
      characters: project.characters,
      worlds: project.worlds,
      writings: project.writings,
      catalogue: project.catalogue,
    };
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

    // --- THE CORRECTED ASSEMBLY LOGIC ---
    const newWorld: World = {
      // 1. Assign properties that are guaranteed to be in the DTO.
      id: new mongoose.Types.ObjectId().toHexString(),
      name: createWorldDto.name,
      theme: createWorldDto.theme,
      setting: createWorldDto.setting,
      description: createWorldDto.description,

      // 2. Intelligently provide defaults for optional linking arrays.
      //    Use the nullish coalescing operator (??) to default to an empty array
      //    only if the property is null or undefined in the DTO.
      linkedCharacterIds: createWorldDto.linkedCharacterIds ?? [],
      linkedWritingIds: createWorldDto.linkedWritingIds ?? [],
      linkedEventIds: createWorldDto.linkedEventIds ?? [],
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
   *
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

    // --- THE DEFINITIVE AND CORRECTED ASSEMBLY LOGIC ---
    const now = Date.now();
    const newWriting: WritingEntry = {
      // 1. Assign properties that are generated here or guaranteed to be in the DTO.
      id: new mongoose.Types.ObjectId().toHexString(),
      title: createWritingDto.title,
      content: createWritingDto.content,
      createdAt: now,
      updatedAt: now,

      // 2. Intelligently provide defaults for all optional properties.
      tags: createWritingDto.tags ?? [],
      linkedCharacterIds: createWritingDto.linkedCharacterIds ?? [],
      linkedWorldId: createWritingDto.linkedWorldId ?? null,
      linkedEventIds: createWritingDto.linkedEventIds ?? [],
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

  // =============================================================================
  // ERAS SERVICE METHODS
  // =============================================================================

  /**
   * Creates a new Era and adds it to a specified project.
   * It automatically calculates the 'order' to place the new Era at the end.
   *
   * @param projectId The identifier of the target project.
   * @param createEraDto The data for the new Era.
   * @param user The authenticated user performing the action.
   * @returns The newly created Era object.
   */
  async createEra(
    projectId: string,
    createEraDto: CreateEraDto,
    user: UserDocument,
  ): Promise<Era> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add an Era to this project.',
      );
    }

    // Check if an Era with the same name already exists within this project.
    const existingEra = project.eras.find(
      (era) => era.name === createEraDto.name,
    );
    if (existingEra) {
      throw new ConflictException(
        'An Era with this name already exists in this project.',
      );
    }

    // Determine the order for the new Era.
    // If there are existing eras, it's the highest current order + 1.
    // Otherwise, it starts at 0.
    const maxOrder =
      project.eras.length > 0
        ? Math.max(...project.eras.map((e) => e.order))
        : -1;
    const newOrder = maxOrder + 1;

    const newEra: Era = {
      id: new mongoose.Types.ObjectId().toHexString(),
      ...createEraDto,
      order: newOrder,
    };

    project.eras.push(newEra);
    await project.save();

    return newEra;
  }

  /**
   * Retrieves all Eras within a specific project.
   *
   * @param projectId The identifier of the target project.
   * @param user The authenticated user performing the action.
   * @returns An array of Era objects.
   */
  async getErasInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<Era[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view Eras in this project.',
      );
    }

    return project.eras;
  }

  /**
   * Updates an existing Era within a project.
   *
   * @param projectId The identifier of the target project.
   * @param eraId The identifier of the Era to update.
   * @param updateEraDto The data containing the updates.
   * @param user The authenticated user performing the action.
   * @returns The updated Era object.
   */
  async updateEra(
    projectId: string,
    eraId: string,
    updateEraDto: UpdateEraDto,
    user: UserDocument,
  ): Promise<Era> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const eraIndex = project.eras.findIndex((e) => e.id === eraId);
    if (eraIndex === -1) {
      throw new NotFoundException(
        `Era with ID "${eraId}" not found in this project.`,
      );
    }

    // If the name is being changed, check for conflicts with other Eras.
    if (updateEraDto.name !== project.eras[eraIndex].name) {
      const existingEra = project.eras.find(
        (era) => era.name === updateEraDto.name,
      );
      if (existingEra) {
        throw new ConflictException(
          'An Era with this name already exists in this project.',
        );
      }
    }

    const updatedEra: Era = {
      ...project.eras[eraIndex],
      ...updateEraDto,
      id: eraId,
    };

    project.eras[eraIndex] = updatedEra;
    project.markModified('eras');
    await project.save();

    return updatedEra;
  }

  /**
   * Deletes an Era from a project.
   *
   * @param projectId The identifier of the target project.
   * @param eraId The identifier of the Era to delete.
   * @param user The authenticated user performing the action.
   */
  async deleteEra(
    projectId: string,
    eraId: string,
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

    const initialLength = project.eras.length;
    project.eras = project.eras.filter((e) => e.id !== eraId);

    if (project.eras.length === initialLength) {
      throw new NotFoundException(
        `Era with ID "${eraId}" not found in this project.`,
      );
    }

    project.markModified('eras');
    await project.save();
  }

  /**
   * Reorders all Eras within a project based on a provided sequence of IDs.
   *
   * @param projectId The identifier of the target project.
   * @param reorderErasDto The DTO containing the array of ordered Era IDs.
   * @param user The authenticated user performing the action.
   * @returns The full, updated array of Era objects in their new order.
   */
  async reorderEras(
    projectId: string,
    reorderErasDto: ReorderErasDto,
    user: UserDocument,
  ): Promise<Era[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const { orderedIds } = reorderErasDto;

    // Create a map for quick lookup of the new order by ID.
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      orderMap.set(id, index);
    });

    // Update the 'order' property for each Era in the project based on the map.
    project.eras.forEach((era) => {
      const newOrder = orderMap.get(era.id);
      if (newOrder !== undefined) {
        era.order = newOrder;
      }
    });

    // Sort the project's eras array itself to reflect the new order.
    project.eras.sort((a, b) => a.order - b.order);

    project.markModified('eras');
    await project.save();

    // Return the newly sorted array of Eras.
    return project.eras;
  }

  // =============================================================================
  // TIMELINE EVENTS SERVICE METHODS
  // =============================================================================

  /**
   * Creates a new Timeline Event and adds it to a specified project.
   * It automatically calculates the 'order' to place the new event at the end
   * of the list of events within its parent Era.
   *
   * @param projectId The identifier of the target project.
   * @param eraId The identifier of the parent Era for the new event.
   * @param createEventDto The data for the new event.
   * @param user The authenticated user performing the action.
   * @returns The newly created Timeline Event object.
   */
  async createEvent(
    projectId: string,
    eraId: string,
    createEventDto: CreateEventDto,
    user: UserDocument,
  ): Promise<TimelineEvent> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add an event to this project.',
      );
    }
    // Ensure the parent Era exists within the project.
    if (!project.eras.some((e) => e.id === eraId)) {
      throw new NotFoundException(
        `Era with ID "${eraId}" not found in this project.`,
      );
    }

    // Check if an event with the same title already exists within the same Era.
    const existingEvent = project.timeline.find(
      (event) => event.eraId === eraId && event.title === createEventDto.title,
    );
    if (existingEvent) {
      throw new ConflictException(
        'An event with this title already exists in this Era.',
      );
    }

    // Filter to get events only within the target Era to calculate the new order.
    const eventsInEra = project.timeline.filter(
      (event) => event.eraId === eraId,
    );
    const maxOrder =
      eventsInEra.length > 0
        ? Math.max(...eventsInEra.map((e) => e.order))
        : -1;
    const newOrder = maxOrder + 1;

    const newEvent: TimelineEvent = {
      // 1. Assign properties that are generated here or guaranteed to be in the DTO.
      id: new mongoose.Types.ObjectId().toHexString(),
      eraId: eraId,
      order: newOrder,
      title: createEventDto.title,
      displayDate: createEventDto.displayDate,
      description: createEventDto.description,

      // 2. Intelligently provide defaults for all optional properties.
      //    Use the nullish coalescing operator (??) to default to an empty array
      //    only if the property is null or undefined in the DTO.
      tags: createEventDto.tags ?? [],
      linkedCharacterIds: createEventDto.linkedCharacterIds ?? [],
      linkedWritingIds: createEventDto.linkedWritingIds ?? [],
    };

    project.timeline.push(newEvent);
    await project.save();

    return newEvent;
  }

  /**
   * Retrieves all Timeline Events for a specific project.
   * Note: This fetches all events; filtering by Era is typically a frontend concern.
   *
   * @param projectId The identifier of the target project.
   * @param user The authenticated user performing the action.
   * @returns An array of Timeline Event objects.
   */
  async getEventsInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<TimelineEvent[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view events in this project.',
      );
    }

    return project.timeline;
  }

  /**
   * Updates an existing Timeline Event within a project.
   *
   * @param projectId The identifier of the target project.
   * @param eventId The identifier of the event to update.
   * @param updateEventDto The data containing the updates.
   * @param user The authenticated user performing the action.
   * @returns The updated Timeline Event object.
   */
  async updateEvent(
    projectId: string,
    eventId: string,
    updateEventDto: UpdateEventDto,
    user: UserDocument,
  ): Promise<TimelineEvent> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const eventIndex = project.timeline.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) {
      throw new NotFoundException(
        `Event with ID "${eventId}" not found in this project.`,
      );
    }

    if (updateEventDto.title !== project.timeline[eventIndex].title) {
      const eventEraId = project.timeline[eventIndex].eraId;
      const existingEvent = project.timeline.find(
        (event) =>
          event.eraId === eventEraId && event.title === updateEventDto.title,
      );
      if (existingEvent) {
        throw new ConflictException(
          'An event with this title already exists in this Era.',
        );
      }
    }

    const updatedEvent: TimelineEvent = {
      ...project.timeline[eventIndex],
      ...updateEventDto,
      id: eventId,
    };

    project.timeline[eventIndex] = updatedEvent;
    project.markModified('timeline');
    await project.save();

    return updatedEvent;
  }

  /**
   * Deletes a Timeline Event from a project.
   *
   * @param projectId The identifier of the target project.
   * @param eventId The identifier of the event to delete.
   * @param user The authenticated user performing the action.
   */
  async deleteEvent(
    projectId: string,
    eventId: string,
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

    const initialLength = project.timeline.length;
    project.timeline = project.timeline.filter((e) => e.id !== eventId);

    if (project.timeline.length === initialLength) {
      throw new NotFoundException(
        `Event with ID "${eventId}" not found in this project.`,
      );
    }

    project.markModified('timeline');
    await project.save();
  }

  /**
   * Reorders all Timeline Events within a specific Era based on a provided sequence of IDs.
   * @param projectId The identifier of the target project.
   * @param eraId The identifier of the Era whose events are to be reordered.
   * @param reorderEventsDto The DTO containing the array of ordered Event IDs.
   * @param user The authenticated user performing the action.
   * @returns The full, updated array of all Timeline Events for the project.
   */
  async reorderEventsInEra(
    projectId: string,
    eraId: string,
    reorderEventsDto: ReorderEventsDto,
    user: UserDocument,
  ): Promise<TimelineEvent[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }
    if (!project.eras.some((e) => e.id === eraId)) {
      throw new NotFoundException(
        `Era with ID "${eraId}" not found in this project.`,
      );
    }

    const { orderedIds } = reorderEventsDto;

    // Create a map for quick lookup of the new order by ID.
    const orderMap = new Map<string, number>();
    orderedIds.forEach((id, index) => {
      orderMap.set(id, index);
    });

    // Update the 'order' property for each event that belongs to the target Era.
    project.timeline.forEach((event) => {
      // We only modify events that are within the specified Era.
      if (event.eraId === eraId) {
        const newOrder = orderMap.get(event.id);
        if (newOrder !== undefined) {
          event.order = newOrder;
        }
      }
    });

    project.markModified('timeline');
    await project.save();

    // Return the complete timeline for the project, allowing the frontend to easily update its state.
    return project.timeline;
  }

  // =============================================================================
  // CATALOGUE ITEMS SERVICE METHODS
  // =============================================================================

  /**
   * Creates a new Catalogue Item and adds it to a specified project.
   * Enforces that the item name is unique within its category for the project.
   *
   * @param projectId The identifier of the target project.
   * @param createCatalogueItemDto The data for the new item.
   * @param user The authenticated user performing the action.
   * @returns The newly created Catalogue Item object.
   */
  async createCatalogueItem(
    projectId: string,
    createCatalogueItemDto: CreateCatalogueItemDto,
    user: UserDocument,
  ): Promise<CatalogueItem> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to add an item to this project.',
      );
    }

    // Uniqueness Validation: Check for an item with the same name in the same category.
    const existingItem = project.catalogue.find(
      (item) =>
        item.category === createCatalogueItemDto.category &&
        item.name === createCatalogueItemDto.name,
    );
    if (existingItem) {
      throw new ConflictException(
        `An item named "${createCatalogueItemDto.name}" already exists in the "${createCatalogueItemDto.category}" category.`,
      );
    }

    const newItem: CatalogueItem = {
      id: new mongoose.Types.ObjectId().toHexString(),
      ...createCatalogueItemDto,
      // Initialize linking fields.
      linkedCharacterIds: [],
      linkedWorldId: null,
      linkedEventIds: [],
      linkedWritingIds: [],
    };

    project.catalogue.push(newItem);
    await project.save();

    return newItem;
  }

  /**
   * Retrieves all Catalogue Items within a specific project.
   *
   * @param projectId The identifier of the target project.
   * @param user The authenticated user performing the action.
   * @returns An array of Catalogue Item objects.
   */
  async getCatalogueInProject(
    projectId: string,
    user: UserDocument,
  ): Promise<CatalogueItem[]> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to view the catalogue of this project.',
      );
    }

    return project.catalogue;
  }

  /**
   * Updates an existing Catalogue Item within a project.
   *
   * @param projectId The identifier of the target project.
   * @param itemId The identifier of the item to update.
   * @param updateCatalogueItemDto The data containing the updates.
   * @param user The authenticated user performing the action.
   * @returns The updated Catalogue Item object.
   */
  async updateCatalogueItem(
    projectId: string,
    itemId: string,
    updateCatalogueItemDto: UpdateCatalogueItemDto,
    user: UserDocument,
  ): Promise<CatalogueItem> {
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found.`);
    }
    if (project.owner.toString() !== user._id.toString()) {
      throw new ForbiddenException(
        'You do not have permission to modify this project.',
      );
    }

    const itemIndex = project.catalogue.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException(
        `Catalogue Item with ID "${itemId}" not found in this project.`,
      );
    }

    // Uniqueness Validation: If name or category is changed, check for conflicts.
    const originalItem = project.catalogue[itemIndex];
    if (
      updateCatalogueItemDto.name !== originalItem.name ||
      updateCatalogueItemDto.category !== originalItem.category
    ) {
      const existingItem = project.catalogue.find(
        (item) =>
          item.id !== itemId && // Exclude the item we are currently editing
          item.category === updateCatalogueItemDto.category &&
          item.name === updateCatalogueItemDto.name,
      );
      if (existingItem) {
        throw new ConflictException(
          `An item named "${updateCatalogueItemDto.name}" already exists in the "${updateCatalogueItemDto.category}" category.`,
        );
      }
    }

    const updatedItem: CatalogueItem = {
      ...originalItem,
      ...updateCatalogueItemDto,
      id: itemId,
    };

    project.catalogue[itemIndex] = updatedItem;
    project.markModified('catalogue');
    await project.save();

    return updatedItem;
  }

  /**
   * Deletes a Catalogue Item from a project.
   *
   * @param projectId The identifier of the target project.
   * @param itemId The identifier of the item to delete.
   * @param user The authenticated user performing the action.
   */
  async deleteCatalogueItem(
    projectId: string,
    itemId: string,
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

    const initialLength = project.catalogue.length;
    project.catalogue = project.catalogue.filter((item) => item.id !== itemId);

    if (project.catalogue.length === initialLength) {
      throw new NotFoundException(
        `Catalogue Item with ID "${itemId}" not found in this project.`,
      );
    }

    project.markModified('catalogue');
    await project.save();
  }
}
