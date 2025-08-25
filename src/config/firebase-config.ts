// Firebase configuration for browser extension
// Browser extensions cannot access process.env variables directly
// This file contains the Firebase configuration values

// Debug: Log environment variables to see what's available
console.log('🔍 Environment variables check:', {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY ? '✅ Set' : '❌ Undefined',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Undefined',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Undefined',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Undefined',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Undefined',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID ? '✅ Set' : '❌ Undefined',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Undefined',
  NODE_ENV: process.env.NODE_ENV || 'development'
});

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Development mode flag
export const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Emulator configuration
export const emulatorConfig = {
  functions: {
    host: 'localhost',
    port: 5001
  }
};
