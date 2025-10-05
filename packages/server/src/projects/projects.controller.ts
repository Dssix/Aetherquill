// packages/server/src/projects/projects.controller.ts

/**
 * The controller layer for the Projects module.
 * It defines the API endpoints for project-related actions and is protected
 * by the authentication guard, ensuring only logged-in users can access it.
 */

import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Delete,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(AuthGuard()) // Apply the default JWT AuthGuard to all routes in this controller
export class ProjectsController {
  /**
   * Injects the ProjectsService to delegate the actual business logic.
   * @param projectsService The service responsible for project operations.
   */
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Defines the endpoint for creating a new project.
   * It expects a request body matching the CreateProjectDto.
   * @param createProjectDto The validated data for the new project.
   * @param user The authenticated user, extracted from the JWT by the GetUser decorator.
   * @returns The newly created project object.
   */
  @Post()
  createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: UserDocument,
  ) {
    // Delegate the creation logic to the service layer.
    return this.projectsService.createProject(createProjectDto, user);
  }

  /**
   * Defines the endpoint for retrieving all projects belonging to the authenticated user.
   * @param user The authenticated user, extracted from the JWT.
   * @returns An array of the user's project objects.
   */
  @Get()
  getProjects(@GetUser() user: UserDocument) {
    // Delegate the logic to the service layer.
    return this.projectsService.getProjectsForUser(user);
  }

  /**
   * Defines the endpoint for deleting a project.
   * The project ID is passed as a URL parameter.
   * @param projectId The ID of the project to delete.
   * @param user The authenticated user, for ownership verification.
   */
  @Delete(':projectId')
  @HttpCode(204) // Set the success status code to 204 No Content
  deleteProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    // Delegate the deletion logic and authorization check to the service.
    return this.projectsService.deleteProject(projectId, user);
  }
}
