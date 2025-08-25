"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onRequest} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.apiTest = exports.analyzeLinkedInProfile = exports.scrapeLinkedInProfile = void 0;
// Load environment variables first
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const profile_controller_1 = require("./controllers/profile.controller");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    region: "us-central1",
    timeoutSeconds: 540, // 9 minutes
    memory: "256MiB",
    minInstances: 0,
    concurrency: 80
});
exports.scrapeLinkedInProfile = (0, https_1.onRequest)(async (request, response) => {
    try {
        const data = request.body;
        // Handle both direct URL format and wrapped data format
        let url;
        if (data && data.url) {
            url = data.url;
        }
        else if (data && data.data && data.data.url) {
            url = data.data.url;
        }
        else {
            response.status(400).json({
                success: false,
                error: 'URL is required'
            });
            return;
        }
        const profileController = new profile_controller_1.ProfileController();
        const result = await profileController.scrapeProfile(url);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.analyzeLinkedInProfile = (0, https_1.onRequest)(async (request, response) => {
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
        let url;
        if (data && data.url) {
            url = data.url;
        }
        else if (data && data.data && data.data.url) {
            url = data.data.url;
        }
        else {
            response.status(400).json({
                success: false,
                error: 'URL is required'
            });
            return;
        }
        const profileController = new profile_controller_1.ProfileController();
        const result = await profileController.analyzeProfile(url);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.apiTest = (0, https_1.onRequest)(async (request, response) => {
    try {
        response.json({
            message: "API is working",
            timestamp: new Date().toISOString(),
            status: "success"
        });
    }
    catch (error) {
        response.status(500).json({
            message: "API test failed",
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});
exports.healthCheck = (0, https_1.onRequest)(async (request, response) => {
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
    }
    catch (error) {
        response.status(500).json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});
//# sourceMappingURL=index.js.map