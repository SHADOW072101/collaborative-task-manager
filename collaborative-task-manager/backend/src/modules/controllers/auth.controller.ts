import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../core/config/env';

const prisma = new PrismaClient();

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword }: RegisterRequest = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Passwords do not match' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
         // Email verification needed
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
      },
      env.JWT_SECRET as jwt.Secret,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions 
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      env.REFRESH_TOKEN_SECRET as jwt.Secret,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    // // Store refresh token in database (optional)
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { refreshToken }
    // });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

   

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Prepare user data (exclude password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    // Send response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (userId) {
      // Clear refresh token from database
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
      });
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { userId: string };

    // Find user with this refresh token
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        refreshToken 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,

      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );

    return res.status(200).json({
      success: true,
      data: {
        token: newAccessToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

// For protected route example
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};