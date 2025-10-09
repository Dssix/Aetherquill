// packages/server/src/projects/projects.module.ts

/**
 * This module encapsulates all functionality related to managing user projects.
 * It imports the AuthModule to gain access to authentication guards and strategies,
 * ensuring that all project-related endpoints are secure.
 */

import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Import the AuthModule to make Passport's authentication tools available.
    AuthModule,
    // Register the Project schema with Mongoose for this module.
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
