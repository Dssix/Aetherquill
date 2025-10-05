// packages/server/src/common/types/request-with-user.ts

import { Request } from 'express';
import type { UserDocument } from '../../auth/schemas/user.schema';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
