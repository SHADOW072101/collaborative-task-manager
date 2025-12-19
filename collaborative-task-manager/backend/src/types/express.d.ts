import { Multer } from 'multer';
import { User } from '../../modules/auth/auth.types';
import { Role } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: {
        [fieldname: string]: Multer.File[];
      } | Multer.File[];
    }
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: User; // Make it optional if not all routes have auth
    }
  }
}


declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name?: string;
        role: string;
        status: string;
      };
    }
  }
}



export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  status: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser; 
}

export {};