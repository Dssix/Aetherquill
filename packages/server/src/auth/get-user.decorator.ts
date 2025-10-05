// packages/server/src/auth/get-user.decorator.ts
// creates a new, reusable decorator called @GetUser()

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserDocument } from './schemas/user.schema';
import type { RequestWithUser } from '../common/types/request-with-user';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): UserDocument => {
    // Cast the generic request to our specific type
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
