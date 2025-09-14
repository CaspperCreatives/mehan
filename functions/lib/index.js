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
exports.getUserObjectStats = exports.getCompleteUserObject = exports.saveCompleteUserObject = exports.getUserContentStats = exports.deleteOptimizedContent = exports.getOptimizedContentById = exports.getOptimizedContent = exports.saveOptimizedContent = exports.optimizeContent = exports.healthCheck = exports.apiTest = exports.analyzeLinkedInProfile = exports.scrapeLinkedInProfile = void 0;
// Load environment variables first
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const profile_controller_1 = require("./controllers/profile.controller");
const ai_controller_1 = require("./controllers/ai.controller");
const optimized_content_controller_1 = require("./controllers/optimized-content.controller");
const user_context_service_1 = require("./services/user-context.service");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({
    maxInstances: 2,
    region: "us-central1",
    timeoutSeconds: 540, // 9 minutes
    memory: "512MiB",
    minInstances: 0,
    concurrency: 5
});
exports.scrapeLinkedInProfile = (0, https_1.onRequest)(async (request, response) => {
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
    var _a, _b;
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
        const language = data.language || ((_a = data.data) === null || _a === void 0 ? void 0 : _a.language) || 'en';
        const forceRefresh = data.forceRefresh || ((_b = data.data) === null || _b === void 0 ? void 0 : _b.forceRefresh) || false;
        const profileController = new profile_controller_1.ProfileController();
        const result = await profileController.analyzeProfile(url, language, forceRefresh);
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
    }
    catch (error) {
        response.status(500).json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});
exports.optimizeContent = (0, https_1.onRequest)(async (request, response) => {
    var _a, _b, _c, _d, _e;
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
        const content = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.content) || data.content;
        const section = ((_b = data.data) === null || _b === void 0 ? void 0 : _b.section) || data.section;
        const language = ((_c = data.data) === null || _c === void 0 ? void 0 : _c.language) || data.language || 'en';
        const userId = ((_d = data.data) === null || _d === void 0 ? void 0 : _d.userId) || data.userId;
        const linkedinUrl = ((_e = data.data) === null || _e === void 0 ? void 0 : _e.linkedinUrl) || data.linkedinUrl;
        // Load user context if userId is provided and section is headline
        if (userId && section === 'headline') {
            try {
                await user_context_service_1.userContext.loadUserContext(userId, linkedinUrl);
                console.log(`✅ [OPTIMIZE_CONTENT] User context loaded for headline optimization: ${userId}`);
            }
            catch (contextError) {
                console.warn(`⚠️ [OPTIMIZE_CONTENT] Failed to load user context: ${contextError}`);
                // Continue with optimization even if context loading fails
            }
        }
        const aiController = new ai_controller_1.AiController();
        try {
            const result = await aiController.optimizeContent(content, section, language);
            response.json({
                success: true,
                data: result,
                message: 'Content optimized successfully'
            });
        }
        catch (error) {
            response.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// Optimized Content Management Endpoints
exports.saveOptimizedContent = (0, https_1.onRequest)(async (request, response) => {
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
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.saveOptimizedContent(data);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getOptimizedContent = (0, https_1.onRequest)(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        const userId = request.query.userId;
        const section = request.query.section;
        if (!userId) {
            response.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getOptimizedContent(userId, section);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getOptimizedContentById = (0, https_1.onRequest)(async (request, response) => {
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
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getOptimizedContentById(contentId);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.deleteOptimizedContent = (0, https_1.onRequest)(async (request, response) => {
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
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.deleteOptimizedContent(contentId);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getUserContentStats = (0, https_1.onRequest)(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        const userId = request.query.userId;
        if (!userId) {
            response.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getUserContentStats(userId);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// Complete User Object Management Endpoints
exports.saveCompleteUserObject = (0, https_1.onRequest)(async (request, response) => {
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
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.saveCompleteUserObject(data);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getCompleteUserObject = (0, https_1.onRequest)(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        const userId = request.query.userId;
        if (!userId) {
            response.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getCompleteUserObject(userId);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.getUserObjectStats = (0, https_1.onRequest)(async (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
    }
    try {
        const userId = request.query.userId;
        if (!userId) {
            response.status(400).json({
                success: false,
                error: 'User ID is required'
            });
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getUserObjectStats(userId);
        response.json(result);
    }
    catch (error) {
        response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
//# sourceMappingURL=index.js.map