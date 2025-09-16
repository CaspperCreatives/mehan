// Firebase configuration for browser extension
// Browser extensions cannot access process.env variables directly
// This file contains the Firebase configuration values


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
