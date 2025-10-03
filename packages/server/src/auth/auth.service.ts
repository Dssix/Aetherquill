// packages/server/src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  register(registerUserDto: RegisterUserDto) {
    console.log('Data received by the service:', registerUserDto);
    return {
      message: `User ${registerUserDto.username} registered successfully.`,
    };
  }
}
