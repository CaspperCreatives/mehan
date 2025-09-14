import { Request, Response, NextFunction } from 'express';

/**
 * CORS Middleware
 * Handles all CORS-related headers and preflight requests
 */
export class CorsMiddleware {
  
  /**
   * Set CORS headers for all requests
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static setCorsHeaders(req: Request, res: Response, next: NextFunction): void {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    
    next();
  }

  /**
   * Handle CORS errors
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static handleCorsError(req: Request, res: Response, next: NextFunction): void {
    // Log CORS-related issues
    console.log(`🌐 [CORS] ${req.method} request from origin: ${req.get('Origin') || 'unknown'}`);
    
    // Continue to next middleware
    next();
  }

  /**
   * Validate CORS request
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  static validateCorsRequest(req: Request, res: Response, next: NextFunction): void {
    const origin = req.get('Origin');

    // Allow all origins for now, but log them
    if (origin) {
      console.log(`🌐 [CORS] Request from origin: ${origin}`);
    }

    next();
  }
}

/**
 * CORS configuration object
 */
export const corsConfig = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'user-agent'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};
