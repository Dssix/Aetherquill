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
}
