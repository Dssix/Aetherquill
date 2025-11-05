// packages/server/src/auth/auth.service.ts

import { RegisterUserDto } from './dto/register-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // Register User
  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.userModel.findOne({
      username: registerUserDto.username,
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const createdUser = new this.userModel(registerUserDto);

    await createdUser.save();

    return {
      message: `User ${createdUser.username} registered successfully.`,
    };
  }

  // Login User
  async login(loginUserDto: LoginUserDto) {
    // Step 1: Find the Scribe
    const user = await this.userModel.findOne({
      username: loginUserDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 2: Check the Key
    const isPasswordMatching = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 3: Mint the Signet Ring (JWT)
    const payload = { username: user.username };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user: { username: user.username } };
  }
}
