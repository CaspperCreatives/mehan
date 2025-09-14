# User Management System

This document explains how to use the centralized user management system in the LinkedIn extension backend.

## Overview

The user management system provides a centralized way to store, access, and manage user objects throughout the entire backend without having to pass user data around or make repeated database calls.

## Components

### 1. UserManager Service (`user-manager.service.ts`)
- **Purpose**: Singleton service that stores and provides access to user objects
- **Features**: 
  - In-memory caching with TTL (30 minutes)
  - Current user context management
  - Cache statistics and management
  - Thread-safe operations

### 2. UserContext Service (`user-context.service.ts`)
- **Purpose**: Handles automatic user loading and context management for requests
- **Features**:
  - Load user context from database
  - Create new user contexts
  - Update current user context
  - Automatic caching

### 3. UserContext Middleware (`user-context.middleware.ts`)
- **Purpose**: Express middleware for automatic user context loading
- **Features**:
  - Automatic user context loading from request parameters
  - User context validation
  - Response enhancement with user context

## Usage Examples

### Basic Usage

```typescript
import { userManager } from './user-manager.service';
import { userContext } from './user-context.service';

// Get current user from anywhere in the backend
const currentUser = userManager.getCurrentUser();
if (currentUser) {
  console.log('Current user:', currentUser.userId);
  console.log('Profile data:', currentUser.profileData);
}

// Load user context by ID
const success = await userContext.ensureUserContext('user_123');
if (success) {
  const user = userManager.getCurrentUser();
  // User is now available throughout the backend
}
```

### In Services

```typescript
export class MyService {
  // Access current user from anywhere
  getCurrentUser() {
    return userManager.getCurrentUser();
  }

  // Get user's profile data
  getCurrentUserProfileData() {
    const user = userManager.getCurrentUser();
    return user?.profileData || null;
  }

  // Update current user
  async updateUser(updates: any) {
    return await userContext.updateCurrentUserContext(updates);
  }
}
```

### In Controllers

```typescript
export class MyController {
  async myEndpoint(req: Request, res: Response) {
    // User context is automatically loaded by middleware
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser) {
      return res.status(400).json({ error: 'User context required' });
    }

    // Use current user data
    const profileData = currentUser.profileData;
    // ... rest of your logic
  }
}
```

### Using Middleware

```typescript
import { loadUserContext, requireUserContext } from './middleware/user-context.middleware';

// In your Express app or Firebase function
app.use(loadUserContext); // Automatically loads user context
app.use(requireUserContext); // Requires user context for protected routes
```

## API Reference

### UserManager Service

```typescript
// Get current user
userManager.getCurrentUser(): ICompleteUserObject | null

// Get user by ID from cache
userManager.getUserById(userId: string): ICompleteUserObject | null

// Set current user
userManager.setCurrentUser(user: ICompleteUserObject): void

// Cache a user
userManager.cacheUser(user: ICompleteUserObject): void

// Update cached user
userManager.updateCachedUser(userId: string, updates: Partial<ICompleteUserObject>): void

// Remove user from cache
userManager.removeUserFromCache(userId: string): void

// Clear all cache
userManager.clearAllCache(): void

// Get cache statistics
userManager.getCacheStats(): object

// Check if user exists in cache
userManager.hasUserInCache(userId: string): boolean

// Check if current user is set
userManager.hasCurrentUser(): boolean

// Get current user ID
userManager.getCurrentUserId(): string | null
```

### UserContext Service

```typescript
// Load user context by ID
userContext.loadUserContext(userId: string, linkedinUrl?: string): Promise<ICompleteUserObject | null>

// Create and load new user context
userContext.createAndLoadUserContext(profileData: any, linkedinUrl: string): Promise<ICompleteUserObject>

// Update current user context
userContext.updateCurrentUserContext(updates: Partial<ICompleteUserObject>): Promise<ICompleteUserObject | null>

// Clear current user context
userContext.clearCurrentUserContext(): void

// Get current user context
userContext.getCurrentUserContext(): ICompleteUserObject | null

// Check if user context is loaded
userContext.hasUserContext(): boolean

// Ensure user context is loaded
userContext.ensureUserContext(userId: string, linkedinUrl?: string): Promise<boolean>
```

## Data Structure

The user object follows this structure:

```typescript
interface ICompleteUserObject {
  id?: string;
  userId: string;
  profileId?: string;
  linkedinUrl?: string;
  profileData?: any; // Complete LinkedIn profile data
  optimizedContent?: Array<{
    section: string;
    originalContent: string;
    optimizedContent: string;
    sectionType?: string;
    metadata?: {
      wordCount?: number;
      characterCount?: number;
      optimizationScore?: number;
      language?: string;
    };
    optimizedAt: string;
  }>;
  totalOptimizations?: number;
  lastOptimizedAt?: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}
```

## Benefits

1. **No More Data Passing**: Access user data from anywhere without passing it around
2. **Performance**: In-memory caching reduces database calls
3. **Consistency**: Single source of truth for user data
4. **Automatic Management**: Middleware handles user context loading
5. **Thread Safety**: Singleton pattern ensures consistent state
6. **Cache Management**: Automatic TTL and cache invalidation
7. **Debugging**: Built-in logging and statistics

## Best Practices

1. **Always check for user context**: Use `userManager.hasCurrentUser()` before accessing user data
2. **Use middleware**: Let the middleware handle user context loading automatically
3. **Update through UserContext**: Use `userContext.updateCurrentUserContext()` to ensure database sync
4. **Handle errors gracefully**: User context might not always be available
5. **Clear context when needed**: Use `userContext.clearCurrentUserContext()` for cleanup

## Migration Guide

### Before (Old Way)
```typescript
// Had to pass user data around
async myFunction(userData: any, profileData: any) {
  // Use userData and profileData
}

// Had to make database calls repeatedly
const user = await this.userService.getUser(userId);
```

### After (New Way)
```typescript
// User data is available globally
async myFunction() {
  const user = userManager.getCurrentUser();
  const profileData = user?.profileData;
  // Use user data directly
}

// No need for repeated database calls
const user = userManager.getCurrentUser(); // From cache
```

## Troubleshooting

### User Context Not Available
- Check if middleware is properly applied
- Verify userId is provided in request
- Check if user exists in database

### Cache Issues
- Check cache TTL (30 minutes default)
- Use `userManager.getCacheStats()` for debugging
- Clear cache with `userManager.clearAllCache()` if needed

### Performance Issues
- Monitor cache hit rates
- Adjust cache TTL if needed
- Check for memory leaks in long-running processes
