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
const cors_helper_1 = require("./utils/cors-helper");
admin.initializeApp();
(0, v2_1.setGlobalOptions)({
    maxInstances: 2,
    region: "us-central1",
    timeoutSeconds: 540, // 9 minutes
    memory: "512MiB",
    minInstances: 0,
    concurrency: 5
});
exports.scrapeLinkedInProfile = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
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
            cors_helper_1.CorsHelper.sendCorsError(response, 'URL is required', 400);
            return;
        }
        const profileController = new profile_controller_1.ProfileController();
        const result = await profileController.scrapeProfile(url);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.analyzeLinkedInProfile = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    var _a, _b;
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
            cors_helper_1.CorsHelper.sendCorsError(response, 'URL is required', 400);
            return;
        }
        const language = data.language || ((_a = data.data) === null || _a === void 0 ? void 0 : _a.language) || 'en';
        const forceRefresh = data.forceRefresh || ((_b = data.data) === null || _b === void 0 ? void 0 : _b.forceRefresh) || false;
        const profileController = new profile_controller_1.ProfileController();
        const result = await profileController.analyzeProfile(url, language, forceRefresh);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.apiTest = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        cors_helper_1.CorsHelper.sendCorsResponse(response, {
            message: "API is working",
            timestamp: new Date().toISOString(),
            status: "success"
        });
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.healthCheck = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
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
        cors_helper_1.CorsHelper.sendCorsResponse(response, healthStatus);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.optimizeContent = (0, https_1.onRequest)({
    memory: '256MiB',
    timeoutSeconds: 300,
    maxInstances: 10
}, cors_helper_1.CorsHelper.withCors(async (request, response) => {
    var _a, _b, _c, _d, _e;
    try {
        console.log(`🚀 [OPTIMIZE_CONTENT] Starting optimization request`);
        const data = request.body;
        const content = ((_a = data.data) === null || _a === void 0 ? void 0 : _a.content) || data.content;
        const section = ((_b = data.data) === null || _b === void 0 ? void 0 : _b.section) || data.section;
        const language = ((_c = data.data) === null || _c === void 0 ? void 0 : _c.language) || data.language || 'en';
        const userId = ((_d = data.data) === null || _d === void 0 ? void 0 : _d.userId) || data.userId;
        const linkedinUrl = ((_e = data.data) === null || _e === void 0 ? void 0 : _e.linkedinUrl) || data.linkedinUrl;
        // Validate required parameters
        if (!content) {
            console.error(`❌ [OPTIMIZE_CONTENT] Missing content parameter`);
            cors_helper_1.CorsHelper.sendCorsError(response, 'Content parameter is required', 400);
            return;
        }
        if (!section) {
            console.error(`❌ [OPTIMIZE_CONTENT] Missing section parameter`);
            cors_helper_1.CorsHelper.sendCorsError(response, 'Section parameter is required', 400);
            return;
        }
        console.log(`📝 [OPTIMIZE_CONTENT] Optimizing ${section} content for user: ${userId || 'anonymous'}`);
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
            console.log(`🤖 [OPTIMIZE_CONTENT] Calling AI service for optimization`);
            const result = await aiController.optimizeContent(content, section, language);
            console.log(`✅ [OPTIMIZE_CONTENT] Optimization completed successfully`);
            cors_helper_1.CorsHelper.sendCorsResponse(response, {
                success: true,
                data: result,
                message: 'Content optimized successfully'
            });
        }
        catch (error) {
            console.error(`❌ [OPTIMIZE_CONTENT] AI service error:`, error);
            cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred during optimization', 500);
        }
    }
    catch (error) {
        console.error(`❌ [OPTIMIZE_CONTENT] General error:`, error);
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
// Optimized Content Management Endpoints
exports.saveOptimizedContent = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const data = request.body;
        if (!data.userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        if (!data.section) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'Section is required', 400);
            return;
        }
        if (!data.originalContent) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'Original content is required', 400);
            return;
        }
        if (!data.optimizedContent) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'Optimized content is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.saveOptimizedContent(data);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.getOptimizedContent = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const userId = request.query.userId;
        const section = request.query.section;
        if (!userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getOptimizedContent(userId, section);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.getOptimizedContentById = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const data = request.body;
        const contentId = data.contentId;
        if (!contentId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'Content ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getOptimizedContentById(contentId);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.deleteOptimizedContent = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const data = request.body;
        const contentId = data.contentId;
        if (!contentId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'Content ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.deleteOptimizedContent(contentId);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.getUserContentStats = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const userId = request.query.userId;
        if (!userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getUserContentStats(userId);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
// Complete User Object Management Endpoints
exports.saveCompleteUserObject = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const data = request.body;
        if (!data.userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.saveCompleteUserObject(data);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.getCompleteUserObject = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const userId = request.query.userId;
        if (!userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getCompleteUserObject(userId);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
exports.getUserObjectStats = (0, https_1.onRequest)(cors_helper_1.CorsHelper.withCors(async (request, response) => {
    try {
        const userId = request.query.userId;
        if (!userId) {
            cors_helper_1.CorsHelper.sendCorsError(response, 'User ID is required', 400);
            return;
        }
        const controller = new optimized_content_controller_1.OptimizedContentController();
        const result = await controller.getUserObjectStats(userId);
        cors_helper_1.CorsHelper.sendCorsResponse(response, result);
    }
    catch (error) {
        cors_helper_1.CorsHelper.sendCorsError(response, error instanceof Error ? error.message : 'Unknown error occurred', 500);
    }
}));
//# sourceMappingURL=index.js.map