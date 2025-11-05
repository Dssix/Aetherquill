// packages/server/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { Request } from 'express';

const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null; // Explicitly define the type
  if (req && req.cookies) {
    // We access the property and ensure it's treated as a string or null
    token = req.cookies['access_token'] as string | null;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService, // Keep the injection
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET not found in environment variables. Application cannot start.',
      );
    }

    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { username: string }): Promise<UserDocument> {
    const { username } = payload;
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
