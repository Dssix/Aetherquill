// packages/server/src/user/user.service.ts

/**
 * The service layer for the User module. It aggregates data from various
 * other services to construct a complete data payload for the authenticated user.
 */

import { Injectable } from '@nestjs/common';
import { UserDocument } from '../auth/schemas/user.schema';
import { ProjectsService } from '../projects/projects.service';
import { ProjectDocument } from '../projects/schemas/project.schema';
import { ProjectData, UserData } from 'aetherquill-common';

@Injectable()
export class UserService {
  /**
   * Injects the ProjectsService to fetch project data.
   * @param projectsService The service for project-related operations.
   */
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Assembles the complete UserData object for the frontend.
   * @param user The authenticated user document.
   * @returns The fully-formed UserData object.
   */
  async getUserData(user: UserDocument): Promise<UserData> {
    // 1. Fetch all projects belonging to the user.
    const projects = await this.projectsService.getProjectsForUser(user);

    // 2. Transform the Mongoose documents into the plain ProjectData objects
    //    that the frontend expects, as defined in the common package.
    const projectsData = this.formatProjectsForClient(projects);

    // 3. Assemble and return the final UserData payload.
    return {
      username: user.username,
      projects: projectsData,
    };
  }

  /**
   * A private helper method to format project documents into the required
   * key-value structure for the UserData object.
   * @param projects An array of Mongoose ProjectDocuments.
   * @returns An object where keys are project IDs and values are ProjectData.
   */
  private formatProjectsForClient(projects: ProjectDocument[]): {
    [projectId: string]: ProjectData;
  } {
    const projectsData: { [projectId: string]: ProjectData } = {};

    for (const project of projects) {
      // The key is the project's _id, converted to a string.
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const projectId = project._id.toString();

      projectsData[projectId] = {
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

    return projectsData;
  }
}
