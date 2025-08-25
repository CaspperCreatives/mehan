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

admin.initializeApp();

setGlobalOptions({ 
  maxInstances: 10,
  region: "us-central1",
  timeoutSeconds: 540, // 9 minutes
  memory: "256MiB",
  minInstances: 0,
  concurrency: 80
});

export const scrapeLinkedInProfile: HttpsFunction = onRequest(async (request, response) => {
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
    const result = await profileController.analyzeProfile(url);

    response.json(result);
  } catch (error) {
    
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export const apiTest: HttpsFunction = onRequest(async (request, response) => {
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
