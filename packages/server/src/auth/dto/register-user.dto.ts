// packages/server/src/auth/dto/register-user.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// A Schema for RegisterUserDto object
export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}
