import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/database';
import User from '../models/User';
import Client from '../models/Client';

export interface AuthRequest extends Request {
  user?: User & { clientId?: string };
  client?: Client;
}

// JWT authentication middleware for admin panel
export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Auth Middleware - Headers:', req.headers.authorization);
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth Middleware - No Bearer token found');
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔍 Auth Middleware - Token received:', token.substring(0, 50) + '...');
    console.log('🔍 Auth Middleware - JWT Secret:', jwtConfig.secret.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, jwtConfig.secret) as any;
    console.log('✅ Auth Middleware - Token decoded successfully:', decoded);
    
    console.log('🔍 Auth Middleware - Looking for user with ID:', decoded.userId);
    
    try {
      const user = await User.findOne({
        where: { id: decoded.userId, isActive: true }
      });
      console.log('🔍 Auth Middleware - User found:', user ? 'YES' : 'NO');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found'
        });
      }
      
      // Add clientId from token to user object
      req.user = user;
      if (decoded.clientId || user.clientId) {
        (req.user as any).clientId = decoded.clientId || user.clientId;
      }
      console.log('✅ Auth Middleware - Authentication successful');
      next();
    } catch (dbError: any) {
      console.error('❌ Auth Middleware - Database error:', dbError.message);
      return res.status(500).json({
        success: false,
        message: 'Database error during authentication'
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// API Key authentication middleware for client API access
export const authenticateAPIKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const clientId = req.headers['x-api-key'] as string;
        
    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Client ID required'
      });
    }

    const client = await Client.findOne({
      where: { id: clientId, isActive: true },
      attributes: ['id', 'companyName']
    });

    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Invalid client ID'
      });
    }

    req.client = client;
    
    // THIS IS THE FIX: Set req.user with clientId for your controller
    req.user = {
      clientId: client.id
    } as any;
    
    console.log('✅ API Key Auth - Client found:', client.companyName);
    console.log('✅ API Key Auth - ClientId set:', client.id);
    
    next();
  } catch (error) {
    console.error('API Key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Dual authentication middleware - accepts EITHER JWT Bearer token OR X-API-Key
export const authenticateBoth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'];
  
  // Try JWT authentication first if Bearer token is present
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('🔄 Dual Auth - Using JWT authentication');
    return authenticateJWT(req, res, next);
  }
  
  // Try API Key authentication if x-api-key is present
  if (apiKey) {
    console.log('🔄 Dual Auth - Using API Key authentication');
    return authenticateAPIKey(req, res, next);
  }
  
  // If neither authentication method is provided
  console.log('❌ Dual Auth - No authentication method provided');
  return res.status(401).json({
    success: false,
    message: 'Authentication required. Provide either Bearer token or x-api-key header.'
  });
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // TODO: Check user role against allowed roles
      // This would require Role model implementation
      
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
  };
};