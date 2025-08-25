"use strict";
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
const logger = __importStar(require("firebase-functions/logger"));
class ScraperService {
    async scrapeLinkedInProfile(url) {
        try {
            const apifyUrl = process.env.APIFY_URL;
            const apifyToken = process.env.APIFY_TOKEN;
            if (!apifyUrl) {
                logger.error('APIFY_URL environment variable is not set');
                return {
                    success: false,
                    error: 'APIFY_URL environment variable is not set'
                };
            }
            if (!apifyToken) {
                logger.error('APIFY_TOKEN environment variable is not set');
                return {
                    success: false,
                    error: 'APIFY_TOKEN environment variable is not set'
                };
            }
            logger.info('Starting LinkedIn profile scraping for URL:', url);
            logger.info('Using Apify URL:', apifyUrl);
            const profileData = await fetch(apifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apifyToken}`
                },
                body: JSON.stringify({
                    "urls": [
                        {
                            "url": url,
                            "method": "GET"
                        }
                    ],
                    "findContacts": false,
                    "scrapeCompany": false
                }),
            });
            if (!profileData.ok) {
                const errorText = await profileData.text();
                logger.error('Apify API request failed:', {
                    status: profileData.status,
                    statusText: profileData.statusText,
                    error: errorText
                });
                return {
                    success: false,
                    error: `Apify API request failed: ${profileData.status} ${profileData.statusText}`
                };
            }
            const data = await profileData.json();
            logger.info('Apify API response received:', {
                hasData: !!data,
                dataType: typeof data,
                dataKeys: data ? Object.keys(data) : 'null/undefined'
            });
            // Wrap the response in the expected format
            return {
                success: true,
                data: data
            };
        }
        catch (error) {
            logger.error('Error scraping LinkedIn profile:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred during scraping'
            };
        }
    }
}
exports.default = ScraperService;
//# sourceMappingURL=scraper.service.js.map