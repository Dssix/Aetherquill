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
  Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
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
  async createProject(
    // 1. Make the method async
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: UserDocument,
  ) {
    // 2. Await the result from the service
    const newProjectDocument = await this.projectsService.createProject(
      createProjectDto,
      user,
    );
    // 3. Manually call the transformation before returning
    return this.projectsService.toProjectData(newProjectDocument);
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

  /**
   * Defines the endpoint for updating a project's details.
   * @param projectId The ID of the project to update, from the URL.
   * @param updateProjectDto The new data for the project, from the request body.
   * @param user The authenticated user, for ownership verification.
   * @returns The complete, updated project object.
   */
  @Put(':projectId')
  async updateProject(
    // 1. Make the method async
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: UserDocument,
  ) {
    // 2. Await the result
    const updatedProjectDocument = await this.projectsService.updateProject(
      projectId,
      updateProjectDto,
      user,
    );
    // 3. Transform the result before returning
    return this.projectsService.toProjectData(updatedProjectDocument);
  }

  /**
   * Defines the endpoint for creating a new character within a specific project.
   * @param projectId The ID of the project, from the URL.
   * @param createCharacterDto The data for the new character, from the request body.
   * @param user The authenticated user, for ownership verification.
   * @returns The complete, newly created character object.
   */
  @Post(':projectId/characters')
  createCharacter(
    @Param('projectId') projectId: string,
    @Body() createCharacterDto: CreateCharacterDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createCharacter(
      projectId,
      createCharacterDto,
      user,
    );
  }

  /**
   * Defines the endpoint for retrieving all characters within a specific project.
   * @param projectId The ID of the project, from the URL.
   * @param user The authenticated user, for ownership verification.
   * @returns An array of the project's character objects.
   */
  @Get(':projectId/characters')
  getCharactersInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getCharactersInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing character.
   * @param projectId The ID of the project, from the URL.
   * @param characterId The ID of the character to update, from the URL.
   * @param updateCharacterDto The new data for the character.
   * @param user The authenticated user.
   * @returns The complete, updated character object.
   */
  @Put(':projectId/characters/:characterId')
  updateCharacter(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateCharacter(
      projectId,
      characterId,
      updateCharacterDto,
      user,
    );
  }

  /**
   * Defines the endpoint for deleting a character from a project.
   * @param projectId The ID of the project, from the URL.
   * @param characterId The ID of the character to delete, from the URL.
   * @param user The authenticated user.
   */
  @Delete(':projectId/characters/:characterId')
  @HttpCode(204)
  deleteCharacter(
    @Param('projectId') projectId: string,
    @Param('characterId') characterId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteCharacter(projectId, characterId, user);
  }

  // =============================================================================
  // WORLDS ENDPOINTS
  // =============================================================================

  /**
   * Defines the endpoint for creating a new world within a specific project.
   * @route POST /projects/:projectId/worlds
   */
  @Post(':projectId/worlds')
  createWorld(
    @Param('projectId') projectId: string,
    @Body() createWorldDto: CreateWorldDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createWorld(projectId, createWorldDto, user);
  }

  /**
   * Defines the endpoint for retrieving all worlds within a specific project.
   * @route GET /projects/:projectId/worlds
   */
  @Get(':projectId/worlds')
  getWorldsInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getWorldsInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing world.
   * @route PUT /projects/:projectId/worlds/:worldId
   */
  @Put(':projectId/worlds/:worldId')
  updateWorld(
    @Param('projectId') projectId: string,
    @Param('worldId') worldId: string,
    @Body() updateWorldDto: UpdateWorldDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateWorld(
      projectId,
      worldId,
      updateWorldDto,
      user,
    );
  }

  /**
   * Defines the endpoint for deleting a world from a project.
   * @route DELETE /projects/:projectId/worlds/:worldId
   */
  @Delete(':projectId/worlds/:worldId')
  @HttpCode(204)
  deleteWorld(
    @Param('projectId') projectId: string,
    @Param('worldId') worldId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteWorld(projectId, worldId, user);
  }

  // =============================================================================
  // WRITINGS ENDPOINTS
  // =============================================================================

  /**
   * Defines the endpoint for creating a new writing entry within a project.
   * @route POST /projects/:projectId/writings
   */
  @Post(':projectId/writings')
  createWriting(
    @Param('projectId') projectId: string,
    @Body() createWritingDto: CreateWritingDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createWriting(
      projectId,
      createWritingDto,
      user,
    );
  }

  /**
   * Defines the endpoint for retrieving all writing entries in a project.
   * @route GET /projects/:projectId/writings
   */
  @Get(':projectId/writings')
  getWritingsInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getWritingsInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing writing entry.
   * @route PUT /projects/:projectId/writings/:writingId
   */
  @Put(':projectId/writings/:writingId')
  updateWriting(
    @Param('projectId') projectId: string,
    @Param('writingId') writingId: string,
    @Body() updateWritingDto: UpdateWritingDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateWriting(
      projectId,
      writingId,
      updateWritingDto,
      user,
    );
  }

  /**
   * Defines the endpoint for deleting a writing entry from a project.
   * @route DELETE /projects/:projectId/writings/:writingId
   */
  @Delete(':projectId/writings/:writingId')
  @HttpCode(204)
  deleteWriting(
    @Param('projectId') projectId: string,
    @Param('writingId') writingId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteWriting(projectId, writingId, user);
  }

  // =============================================================================
  // ERAS ENDPOINTS
  // =============================================================================

  /**
   * Defines the endpoint for creating a new Era within a project.
   * @route POST /projects/:projectId/eras
   */
  @Post(':projectId/eras')
  createEra(
    @Param('projectId') projectId: string,
    @Body() createEraDto: CreateEraDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createEra(projectId, createEraDto, user);
  }

  /**
   * Defines the endpoint for retrieving all Eras in a project.
   * @route GET /projects/:projectId/eras
   */
  @Get(':projectId/eras')
  getErasInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getErasInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing Era.
   * @route PUT /projects/:projectId/eras/:eraId
   */
  @Put(':projectId/eras/:eraId')
  updateEra(
    @Param('projectId') projectId: string,
    @Param('eraId') eraId: string,
    @Body() updateEraDto: UpdateEraDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateEra(projectId, eraId, updateEraDto, user);
  }

  /**
   * Defines the endpoint for deleting an Era from a project.
   * @route DELETE /projects/:projectId/eras/:eraId
   */
  @Delete(':projectId/eras/:eraId')
  @HttpCode(204)
  deleteEra(
    @Param('projectId') projectId: string,
    @Param('eraId') eraId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteEra(projectId, eraId, user);
  }

  /**
   * Defines the special endpoint for reordering all Eras in a project.
   * @route POST /projects/:projectId/eras/reorder
   */
  @Post(':projectId/eras/reorder')
  reorderEras(
    @Param('projectId') projectId: string,
    @Body() reorderErasDto: ReorderErasDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.reorderEras(projectId, reorderErasDto, user);
  }

  // =============================================================================
  // TIMELINE EVENTS ENDPOINTS
  // =============================================================================

  /**
   * Defines the endpoint for creating a new Timeline Event within a specific Era.
   * @route POST /projects/:projectId/eras/:eraId/events
   */
  @Post(':projectId/eras/:eraId/events')
  createEvent(
    @Param('projectId') projectId: string,
    @Param('eraId') eraId: string,
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createEvent(
      projectId,
      eraId,
      createEventDto,
      user,
    );
  }

  /**
   * Defines the endpoint for retrieving all Timeline Events in a project.
   * @route GET /projects/:projectId/timeline
   */
  @Get(':projectId/timeline')
  getEventsInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getEventsInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing Timeline Event.
   * @route PUT /projects/:projectId/timeline/:eventId
   */
  @Put(':projectId/timeline/:eventId')
  updateEvent(
    @Param('projectId') projectId: string,
    @Param('eventId') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateEvent(
      projectId,
      eventId,
      updateEventDto,
      user,
    );
  }

  /**
   * Defines the endpoint for deleting a Timeline Event from a project.
   * @route DELETE /projects/:projectId/timeline/:eventId
   */
  @Delete(':projectId/timeline/:eventId')
  @HttpCode(204)
  deleteEvent(
    @Param('projectId') projectId: string,
    @Param('eventId') eventId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteEvent(projectId, eventId, user);
  }

  /**
   * Defines the special endpoint for reordering all Events within a specific Era.
   * @route POST /projects/:projectId/eras/:eraId/events/reorder
   */
  @Post(':projectId/eras/:eraId/events/reorder')
  reorderEventsInEra(
    @Param('projectId') projectId: string,
    @Param('eraId') eraId: string,
    @Body() reorderEventsDto: ReorderEventsDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.reorderEventsInEra(
      projectId,
      eraId,
      reorderEventsDto,
      user,
    );
  }

  // =============================================================================
  // CATALOGUE ENDPOINTS
  // =============================================================================

  /**
   * Defines the endpoint for creating a new Catalogue Item within a project.
   * @route POST /projects/:projectId/catalogue
   */
  @Post(':projectId/catalogue')
  createCatalogueItem(
    @Param('projectId') projectId: string,
    @Body() createCatalogueItemDto: CreateCatalogueItemDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.createCatalogueItem(
      projectId,
      createCatalogueItemDto,
      user,
    );
  }

  /**
   * Defines the endpoint for retrieving all Catalogue Items in a project.
   * @route GET /projects/:projectId/catalogue
   */
  @Get(':projectId/catalogue')
  getCatalogueInProject(
    @Param('projectId') projectId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.getCatalogueInProject(projectId, user);
  }

  /**
   * Defines the endpoint for updating an existing Catalogue Item.
   * @route PUT /projects/:projectId/catalogue/:itemId
   */
  @Put(':projectId/catalogue/:itemId')
  updateCatalogueItem(
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Body() updateCatalogueItemDto: UpdateCatalogueItemDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.updateCatalogueItem(
      projectId,
      itemId,
      updateCatalogueItemDto,
      user,
    );
  }

  /**
   * Defines the endpoint for deleting a Catalogue Item from a project.
   * @route DELETE /projects/:projectId/catalogue/:itemId
   */
  @Delete(':projectId/catalogue/:itemId')
  @HttpCode(204)
  deleteCatalogueItem(
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.deleteCatalogueItem(projectId, itemId, user);
  }
}
