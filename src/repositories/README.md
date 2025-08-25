# Firebase Repository - Data Access Layer

This repository serves as a general data access layer for communicating with Firebase Cloud Functions. It provides generic methods that can handle any function calls without being tied to specific business logic.

## Features

- **Generic Function Calls**: Call any Firebase Cloud Function with `callMethod()`
- **Type Safety**: Use `callMethodWithType<T>()` for typed responses
- **Error Handling**: Built-in retry logic and timeout handling
- **Development Support**: Automatic emulator connection in development mode
- **Health Checks**: Built-in health check and API test methods

## Usage Examples

### Basic Function Call

```typescript
import { firebaseRepository } from './firebase-repository';

// Call any Firebase function
const result = await firebaseRepository.callMethod('scrapeLinkedInProfile', {
  url: 'https://linkedin.com/in/example'
});

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

### Typed Function Call

```typescript
interface ProfileData {
  name: string;
  headline: string;
  // ... other properties
}

const result = await firebaseRepository.callMethodWithType<ProfileData>(
  'scrapeLinkedInProfile',
  { url: 'https://linkedin.com/in/example' }
);

if (result.success) {
  const profileData: ProfileData = result.data;
  console.log('Profile name:', profileData.name);
}
```

### Function Call with Options

```typescript
const result = await firebaseRepository.callMethod(
  'scrapeLinkedInProfile',
  { url: 'https://linkedin.com/in/example' },
  {
    timeout: 60000,    // 60 seconds
    retries: 5,        // 5 retry attempts
    retryDelay: 2000   // 2 seconds between retries
  }
);
```

### Health Check

```typescript
const health = await firebaseRepository.healthCheck();
if (health.success) {
  console.log('Firebase connection is healthy');
} else {
  console.error('Firebase connection failed:', health.error);
}
```

### Test API

```typescript
const test = await firebaseRepository.testApi();
if (test.success) {
  console.log('API is working:', test.data);
}
```

## Configuration

The repository automatically connects to Firebase using environment variables:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

In development mode, it automatically connects to the Firebase emulator on `localhost:5001`.

## Error Handling

The repository includes built-in error handling:

- **Timeout**: Configurable timeout for function calls
- **Retries**: Automatic retry with exponential backoff
- **Error Types**: Proper error categorization and messaging
- **Logging**: Detailed error logging for debugging

## Response Format

All methods return a consistent `ApiResponse<T>` format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Best Practices

1. **Use Typed Calls**: Use `callMethodWithType<T>()` when you know the response type
2. **Handle Errors**: Always check `result.success` before accessing `result.data`
3. **Configure Timeouts**: Set appropriate timeouts for long-running operations
4. **Use Retries**: Configure retry logic for network-sensitive operations
5. **Environment Variables**: Use environment variables for Firebase configuration

## Testing

The repository can be easily tested by mocking the Firebase functions:

```typescript
import { FirebaseRepository } from './firebase-repository';

// Create a test instance
const testRepo = new FirebaseRepository();

// Mock the functions
jest.spyOn(testRepo, 'callMethod').mockResolvedValue({
  success: true,
  data: { test: 'data' }
});
```
