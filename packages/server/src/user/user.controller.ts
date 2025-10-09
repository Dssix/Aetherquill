// packages/server/src/user/user.controller.ts

/**
 * The controller for the /me namespace. All endpoints here are related to
 * the currently authenticated user.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';

@Controller('me')
@UseGuards(AuthGuard()) // Protect all routes in this controller
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * The main data-loading endpoint for the frontend application.
   * Fetches all projects and associated data for the logged-in user.
   * @param user The authenticated user document.
   * @returns The complete UserData object.
   */
  @Get('data')
  getUserData(@GetUser() user: UserDocument) {
    return this.userService.getUserData(user);
  }
}
