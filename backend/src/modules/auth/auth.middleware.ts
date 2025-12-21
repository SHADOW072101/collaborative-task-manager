import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../core/config/env';
// import { PrismaClient } from '@prisma/client';

import prisma from '../../lib/prisma'; 


export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         name?: string;
//         role: string;
//         status: string;
//       };
//     }
//   }
// }

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Access denied. Invalid token format.' 
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    
    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true
      }
    });

    if (!user) {
      res.status(401).json({ 
        success: false, 
        error: 'User not found. Token is invalid.' 
      });
      return;
    }
  

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token.' 
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        error: 'Token has expired.' 
      });
      return;
    }

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during authentication.' 
    });
  }
};

