import { Request, Response } from 'express';
import { UserRepository } from '../repository';
import { generateToken } from '../auth';
import { createUserSchema, loginSchema } from '../validation';
import { AuthenticatedRequest } from '../middleware';
import { AuthResponse, UserResponse } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = createUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists with this email' });
      return;
    }

    // Create new user
    const user = await UserRepository.createUser({ email, password });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = { accessToken: token };
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input data', details: error.message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const isValidPassword = await UserRepository.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = { accessToken: token };
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid input data', details: error.message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await UserRepository.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const response: UserResponse = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };

    res.json(response);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
