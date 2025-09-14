/**
 * Import function triggers from their respective submodules:
 *
 * import {onRequest} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Load environment variables first
import * as dotenv from "dotenv";
dotenv.config();

import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest, HttpsFunction} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { ProfileController } from "./controllers/profile.controller";
import { AiController } from "./controllers/ai.controller";
import { OptimizedContentController } from "./controllers/optimized-content.controller";
import { userContext } from "./services/user-context.service";


admin.initializeApp();

setGlobalOptions({ 
  maxInstances: 2,
  region: "us-central1",
  timeoutSeconds: 540, // 9 minutes
  memory: "512MiB",
  minInstances: 0,
  concurrency: 5
});

export const scrapeLinkedInProfile: HttpsFunction = onRequest(async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    
    // Handle both direct URL format and wrapped data format
    let url: string;
    if (data && data.url) {
      url = data.url;
    } else if (data && data.data && data.data.url) {
      url = data.data.url;
    } else {
      response.status(400).json({
        success: false,
        error: 'URL is required'
      });
      return;
    }
    
    const profileController = new ProfileController();
    const result = await profileController.scrapeProfile(url);
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const analyzeLinkedInProfile: HttpsFunction = onRequest(async (request, response) => {
  // Set comprehensive CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, User-Agent, Referer');
  response.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    
    // Handle both direct URL format and wrapped data format
    let url: string;
    if (data && data.url) {
      url = data.url;
    } else if (data && data.data && data.data.url) {
      url = data.data.url;
    } else {
      response.status(400).json({
        success: false,
        error: 'URL is required'
      });
      return;
    }
    
    const language = data.language || data.data?.language || 'en';
    const forceRefresh = data.forceRefresh || data.data?.forceRefresh || false;
    
    const profileController = new ProfileController();
    const result = await profileController.analyzeProfile(url, language, forceRefresh);

    response.json(result);
  } catch (error) {
    
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const apiTest: HttpsFunction = onRequest(async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    response.json({
      message: "API is working",
      timestamp: new Date().toISOString(),
      status: "success"
    });
  } catch (error) {
    response.status(500).json({
      message: "API test failed",
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});

export const healthCheck: HttpsFunction = onRequest(async (request, response) => {
  // Set CORS headers
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.set('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
    
  }
  
  try {
    // Basic health check that doesn't depend on external services
    const healthStatus = {
      status: "healthy",
      service: "linkedin-extension-api",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    response.json(healthStatus);
  } catch (error) {
    response.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
});


export const optimizeContent: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    const content = data.data?.content || data.content;
    const section = data.data?.section || data.section;
    const language = data.data?.language || data.language || 'en';
    const userId = data.data?.userId || data.userId;
    const linkedinUrl = data.data?.linkedinUrl || data.linkedinUrl;

    // Load user context if userId is provided and section is headline
    if (userId && section === 'headline') {
      try {
        await userContext.loadUserContext(userId, linkedinUrl);
        console.log(`✅ [OPTIMIZE_CONTENT] User context loaded for headline optimization: ${userId}`);
      } catch (contextError) {
        console.warn(`⚠️ [OPTIMIZE_CONTENT] Failed to load user context: ${contextError}`);
        // Continue with optimization even if context loading fails
      }
    }

    const aiController = new AiController();
    try {
      const result = await aiController.optimizeContent(content, section, language);
      
      response.json({
        success: true,
        data: result,
        message: 'Content optimized successfully'
      });
    } catch (error) {
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Optimized Content Management Endpoints

export const saveOptimizedContent: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    
    if (!data.userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }
    
    if (!data.section) {
      response.status(400).json({
        success: false,
        error: 'Section is required'
      });
      return;
    }
    
    if (!data.originalContent) {
      response.status(400).json({
        success: false,
        error: 'Original content is required'
      });
      return;
    }
    
    if (!data.optimizedContent) {
      response.status(400).json({
        success: false,
        error: 'Optimized content is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.saveOptimizedContent(data);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const getOptimizedContent: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const userId = request.query.userId as string;
    const section = request.query.section as string;
    
    if (!userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getOptimizedContent(userId, section);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const getOptimizedContentById: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    const contentId = data.contentId;
    
    if (!contentId) {
      response.status(400).json({
        success: false,
        error: 'Content ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getOptimizedContentById(contentId);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const deleteOptimizedContent: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    const contentId = data.contentId;
    
    if (!contentId) {
      response.status(400).json({
        success: false,
        error: 'Content ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.deleteOptimizedContent(contentId);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const getUserContentStats: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getUserContentStats(userId);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Complete User Object Management Endpoints

export const saveCompleteUserObject: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const data = request.body;
    
    if (!data.userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.saveCompleteUserObject(data);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const getCompleteUserObject: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getCompleteUserObject(userId);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const getUserObjectStats: HttpsFunction = onRequest(async (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      response.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getUserObjectStats(userId);
    
    response.json(result);
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});