// packages/server/src/auth/auth.controller.ts

import { Body, Controller, Post, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 3. Await the result from the service, which will now include the token
    const { accessToken, user } = await this.authService.login(loginUserDto);

    // 4. Set the cookie on the response object
    response.cookie('access_token', accessToken, {
      httpOnly: true, // The cookie cannot be accessed by client-side scripts
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', // Helps prevent CSRF attacks
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // 5. Return the user data as the response body
    return { user };
  }

  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@GetUser() user: UserDocument) {
    return {
      _id: user._id,
      username: user.username,
    };
  }

  /**
   * Defines the endpoint for logging a user out.
   * This endpoint clears the secure, httpOnly access_token cookie.
   * @param response The Express Response object, injected to manage cookies.
   */
  @Post('logout')
  @HttpCode(204) // Set the success status code to 204 No Content
  logout(@Res({ passthrough: true }) response: Response) {
    // The clearCookie method instructs the browser to immediately expire the cookie.
    response.clearCookie('access_token');
    // We don't need to return anything, as the 204 status code indicates success.
  }
}
