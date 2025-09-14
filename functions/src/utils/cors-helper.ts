import { Request, Response } from 'express';

/**
 * CORS Helper Utility
 * Provides easy-to-use functions for applying CORS to Cloud Functions
 */
export class CorsHelper {
  
  /**
   * Apply CORS headers to a response
   * @param response - Express response object
   */
  static applyCorsHeaders(response: Response): void {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, sec-fetch-dest, sec-fetch-mode, sec-fetch-site, user-agent');
    response.set('Access-Control-Allow-Credentials', 'true');
    response.set('Access-Control-Max-Age', '86400');
  }

  /**
   * Handle preflight OPTIONS request
   * @param request - Express request object
   * @param response - Express response object
   * @returns true if handled, false if not an OPTIONS request
   */
  static handlePreflightRequest(request: Request, response: Response): boolean {
    if (request.method === 'OPTIONS') {
      this.applyCorsHeaders(response);
      response.status(204).send('');
      return true;
    }
    return false;
  }

  /**
   * Wrap a Cloud Function handler with CORS support
   * @param handler - The original function handler
   * @returns Wrapped handler with CORS support
   */
  static withCors<T extends any[], R>(
    handler: (request: Request, response: Response, ...args: T) => Promise<R> | R
  ) {
    return async (request: Request, response: Response, ...args: T): Promise<R> => {
      // Apply CORS headers
      this.applyCorsHeaders(response);
      
      // Handle preflight requests
      if (this.handlePreflightRequest(request, response)) {
        return undefined as R;
      }
      
      // Log CORS info
      const origin = request.get('Origin');
      console.log(`🌐 [CORS] ${request.method} request from origin: ${origin || 'unknown'}`);
      
      // Call the original handler
      return await handler(request, response, ...args);
    };
  }

  /**
   * Create a CORS-enabled response handler
   * @param response - Express response object
   * @param data - Data to send
   * @param statusCode - HTTP status code (default: 200)
   */
  static sendCorsResponse(response: Response, data: any, statusCode: number = 200): void {
    this.applyCorsHeaders(response);
    response.status(statusCode).json(data);
  }

  /**
   * Create a CORS-enabled error response handler
   * @param response - Express response object
   * @param error - Error message or object
   * @param statusCode - HTTP status code (default: 500)
   */
  static sendCorsError(response: Response, error: any, statusCode: number = 500): void {
    this.applyCorsHeaders(response);
    response.status(statusCode).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
}
