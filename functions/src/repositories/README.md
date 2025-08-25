# Firebase Repository Data Access Layer

This module provides a comprehensive data access layer for Firebase Firestore with general CRUD operations and advanced querying capabilities.

## Features

- **Generic Repository Pattern**: Type-safe operations with TypeScript generics
- **CRUD Operations**: Create, Read, Update, Delete operations
- **Batch Operations**: Save and delete multiple documents efficiently
- **Advanced Querying**: Filtering, ordering, and pagination
- **Transaction Support**: Atomic operations across multiple documents
- **Subcollections**: Support for nested collections
- **Error Handling**: Comprehensive error handling with meaningful messages

## Basic Usage

### 1. Create a Repository Instance

```typescript
import { FirebaseRepository } from './firebase.repository';

// Define your entity interface
interface User {
  id?: string;
  name: string;
  email: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

// Create repository instance
const userRepo = new FirebaseRepository<User>('users');
```

### 2. Basic CRUD Operations

```typescript
// Save a new document
const newUser = await userRepo.save({
  name: 'John Doe',
  email: 'john@example.com'
});

// Get by ID
const user = await userRepo.getById('document-id');

// Update a document
const updatedUser = await userRepo.update('document-id', {
  name: 'Jane Doe'
});

// Delete a document
await userRepo.delete('document-id');
```

### 3. Batch Operations

```typescript
// Save multiple documents
const users = await userRepo.saveBatch([
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' }
]);

// Delete multiple documents
await userRepo.deleteBatch(['id1', 'id2', 'id3']);
```

### 4. Querying with Filters

```typescript
// Query with conditions
const results = await userRepo.query({
  where: [
    { field: 'email', operator: '==', value: 'john@example.com' },
    { field: 'name', operator: '>=', value: 'A' }
  ],
  orderBy: { field: 'name', direction: 'asc' },
  limit: 10
});
```

### 5. Pagination

```typescript
// Get paginated results
const page1 = await userRepo.getPaginated(20, undefined, {
  field: 'createdAt',
  direction: 'desc'
});

// Get next page
const page2 = await userRepo.getPaginated(20, page1.lastDoc, {
  field: 'createdAt',
  direction: 'desc'
});
```

### 6. Transactions

```typescript
// Perform atomic operations
await userRepo.runTransaction(async (transaction) => {
  // Your transaction logic here
  const userDoc = await transaction.get(userRef);
  const profileDoc = await transaction.get(profileRef);
  
  // Update both documents atomically
  transaction.update(userRef, { lastLogin: new Date() });
  transaction.update(profileRef, { loginCount: profileDoc.data().loginCount + 1 });
});
```

### 7. Subcollections

```typescript
// Access subcollections
const userPostsRepo = userRepo.getSubcollection('user-id', 'posts');
const posts = await userPostsRepo.getAll();
```

## Available Methods

### Core CRUD Methods
- `save(data)` - Create a new document
- `saveBatch(dataArray)` - Create multiple documents
- `getById(id)` - Get a document by ID
- `getByIds(ids)` - Get multiple documents by IDs
- `update(id, data)` - Update a document
- `saveOrUpdate(id, data)` - Create or update a document
- `delete(id)` - Delete a document
- `deleteBatch(ids)` - Delete multiple documents

### Query Methods
- `query(options)` - Query with filters, ordering, and pagination
- `getAll()` - Get all documents in collection
- `count(whereConditions)` - Count documents with optional filters
- `exists(id)` - Check if document exists
- `getPaginated(limit, lastDoc, orderBy)` - Get paginated results

### Advanced Methods
- `runTransaction(operations)` - Perform atomic operations
- `getSubcollection(parentId, subcollectionName)` - Access subcollections

## Query Options

```typescript
interface IQueryOptions {
  limit?: number;           // Maximum number of documents
  offset?: number;          // Number of documents to skip
  orderBy?: {              // Ordering configuration
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: Array<{          // Filter conditions
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>;
}
```

## Error Handling

All methods include comprehensive error handling with meaningful error messages. Errors are wrapped with context about the operation that failed.

## Type Safety

The repository is fully type-safe with TypeScript generics. Define your entity interfaces to get full type checking and IntelliSense support.

## Performance Considerations

- Use batch operations for multiple writes
- Implement proper indexing for your query patterns
- Use pagination for large collections
- Consider using transactions for related operations
- Use subcollections for hierarchical data

## Example: LinkedIn Profile Analysis

```typescript
interface LinkedInProfile {
  id?: string;
  userId: string;
  profileUrl: string;
  analysis: string;
  suggestions: string[];
  score: number;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

const profileRepo = new FirebaseRepository<LinkedInProfile>('profiles');

// Save analysis result
const analysis = await profileRepo.save({
  userId: 'user123',
  profileUrl: 'https://linkedin.com/in/johndoe',
  analysis: 'Strong technical background...',
  suggestions: ['Add more projects', 'Update skills'],
  score: 85
});

// Get user's analyses
const userAnalyses = await profileRepo.query({
  where: [{ field: 'userId', operator: '==', value: 'user123' }],
  orderBy: { field: 'createdAt', direction: 'desc' }
});
```
