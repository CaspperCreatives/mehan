/**
 * Centralized API Key Management
 * This file serves as the single source of truth for all API keys used in the application.
 * All API keys should be retrieved from this file to ensure consistency and easy management.
 */

export interface APIKeys {
  openai: string;
  gemini: string;
  googleAI: string;
}

/**
 * Retrieves the OpenAI API key from environment variables
 * @returns {string} The OpenAI API key
 */
const getOpenAIKey = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // For development, show a warning instead of crashing
  console.warn('⚠️ OPENAI_API_KEY environment variable is not set. Please set it in your .env file or environment variables.');
  return '';
};

/**
 * Retrieves the Gemini API key from environment variables
 * @returns {string} The Gemini API key
 */
const getGeminiKey = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // For development, show a warning instead of crashing
  console.warn('⚠️ GEMINI_API_KEY environment variable is not set. Please set it in your .env file or environment variables.');
  return '';
};

/**
 * Retrieves the Google AI API key from environment variables
 * @returns {string} The Google AI API key
 */
const getGoogleAIKey = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.GOOGLE_AI_API_KEY) {
    return process.env.GOOGLE_AI_API_KEY;
  }
  
  // For development, show a warning instead of crashing
  console.warn('⚠️ GOOGLE_AI_API_KEY environment variable is not set. Please set it in your .env file or environment variables.');
  return '';
};

/**
 * Get all API keys in a structured object
 * @returns {APIKeys} Object containing all API keys
 */
export const getAPIKeys = (): APIKeys => {
  return {
    openai: getOpenAIKey(),
    gemini: getGeminiKey(),
    googleAI: getGoogleAIKey()
  };
};

/**
 * Get a specific API key by name
 * @param keyName - The name of the API key to retrieve
 * @returns {string} The requested API key
 */
export const getAPIKey = (keyName: keyof APIKeys): string => {
  const keys = getAPIKeys();
  return keys[keyName];
};

/**
 * Get OpenAI API key specifically
 * @returns {string} The OpenAI API key
 */
export const getOpenAIAPIKey = (): string => getAPIKey('openai');

/**
 * Get Gemini API key specifically
 * @returns {string} The Gemini API key
 */
export const getGeminiAPIKey = (): string => getAPIKey('gemini');

/**
 * Get Google AI API key specifically
 * @returns {string} The Google AI API key
 */
export const getGoogleAIAPIKey = (): string => getAPIKey('googleAI'); 