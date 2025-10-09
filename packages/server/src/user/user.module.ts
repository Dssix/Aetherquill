// packages/server/src/user/user.module.ts

/**
 * This module handles requests related to the authenticated user's own data,
 * under the /me namespace.
 */

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  // Import AuthModule for guards and ProjectsModule to access its services.
  imports: [AuthModule, ProjectsModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
