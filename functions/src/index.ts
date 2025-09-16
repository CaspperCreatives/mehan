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
import { CorsHelper } from "./utils/cors-helper";


admin.initializeApp();

setGlobalOptions({ 
  maxInstances: 2,
  region: "us-central1",
  timeoutSeconds: 540, // 9 minutes
  memory: "512MiB",
  minInstances: 0,
  concurrency: 5
});

export const scrapeLinkedInProfile: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    
    // Handle both direct URL format and wrapped data format
    let url: string;
    if (data && data.url) {
      url = data.url;
    } else if (data && data.data && data.data.url) {
      url = data.data.url;
    } else {
      CorsHelper.sendCorsError(response, 'URL is required', 400);
      return;
    }
    
    const profileController = new ProfileController();
    const result = await profileController.scrapeProfile(url);
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const analyzeLinkedInProfile: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    let url: string;
    if (data && data.url) {
      url = data.url;
    } else if (data && data.data && data.data.url) {
      url = data.data.url;
    } else {
      CorsHelper.sendCorsError(response, 'URL is required', 400);
      return;
    }
    
    const language = data.language || data.data?.language || 'en';
    const forceRefresh = data.forceRefresh || data.data?.forceRefresh || false;
    const userId = data.userId || data.data?.userId;
    
    const profileController = new ProfileController();
    const result = await profileController.analyzeProfile(url, language, forceRefresh, userId);

    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const apiTest: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    CorsHelper.sendCorsResponse(response, {
      message: "API is working",
      timestamp: new Date().toISOString(),
      status: "success"
    });
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const healthCheck: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
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
    
    CorsHelper.sendCorsResponse(response, healthStatus);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));


export const optimizeContent: HttpsFunction = onRequest({
  memory: '256MiB',
  timeoutSeconds: 300,
  maxInstances: 10
}, CorsHelper.withCors(async (request, response) => {
  try {
    
    const data = request.body;
    const content = data.data?.content || data.content;
    const section = data.data?.section || data.section;
    const language = data.data?.language || data.language || 'en';
    const userId = data.data?.userId || data.userId;
    const linkedinUrl = data.data?.linkedinUrl || data.linkedinUrl;

    // Validate required parameters
    if (!content) {
      console.error(`❌ [OPTIMIZE_CONTENT] Missing content parameter`);
      CorsHelper.sendCorsError(response, 'Content parameter is required', 400);
      return;
    }

    if (!section) {
      console.error(`❌ [OPTIMIZE_CONTENT] Missing section parameter`);
      CorsHelper.sendCorsError(response, 'Section parameter is required', 400);
      return;
    }

    console.log(`📝 [OPTIMIZE_CONTENT] Optimizing ${section} content for user: ${userId || 'anonymous'}`);

    // Load user context if userId is provided and section is headline
    if (userId && section === 'headline') {
      try {
        await userContext.loadUserContext(userId, linkedinUrl);
      } catch (contextError) {
        console.warn(`⚠️ [OPTIMIZE_CONTENT] Failed to load user context: ${contextError}`);
        // Continue with optimization even if context loading fails
      }
    }

    const aiController = new AiController();
    try {
      const result = await aiController.optimizeContent(content, section, language);
      
      CorsHelper.sendCorsResponse(response, {
        success: true,
        data: result,
        message: 'Content optimized successfully'
      });
    } catch (error) {
      console.error(`❌ [OPTIMIZE_CONTENT] AI service error:`, error);
      CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred during optimization', 500);
    }
  } catch (error) {
    console.error(`❌ [OPTIMIZE_CONTENT] General error:`, error);
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

// Optimized Content Management Endpoints

export const saveOptimizedContent: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    
    if (!data.userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }
    
    if (!data.section) {
      CorsHelper.sendCorsError(response, 'Section is required', 400);
      return;
    }
    
    if (!data.originalContent) {
      CorsHelper.sendCorsError(response, 'Original content is required', 400);
      return;
    }
    
    if (!data.optimizedContent) {
      CorsHelper.sendCorsError(response, 'Optimized content is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.saveOptimizedContent(data);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const getOptimizedContent: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const userId = request.query.userId as string;
    const section = request.query.section as string;
    
    if (!userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getOptimizedContent(userId, section);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const getOptimizedContentById: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    const contentId = data.contentId;
    
    if (!contentId) {
      CorsHelper.sendCorsError(response, 'Content ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getOptimizedContentById(contentId);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const deleteOptimizedContent: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    const contentId = data.contentId;
    
    if (!contentId) {
      CorsHelper.sendCorsError(response, 'Content ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.deleteOptimizedContent(contentId);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const getUserContentStats: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getUserContentStats(userId);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

// Complete User Object Management Endpoints

export const saveCompleteUserObject: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const data = request.body;
    
    if (!data.userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.saveCompleteUserObject(data);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const getCompleteUserObject: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getCompleteUserObject(userId);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));

export const getUserObjectStats: HttpsFunction = onRequest(CorsHelper.withCors(async (request, response) => {
  try {
    const userId = request.query.userId as string;
    
    if (!userId) {
      CorsHelper.sendCorsError(response, 'User ID is required', 400);
      return;
    }

    const controller = new OptimizedContentController();
    const result = await controller.getUserObjectStats(userId);
    
    CorsHelper.sendCorsResponse(response, result);
  } catch (error) {
    CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
  }
}));