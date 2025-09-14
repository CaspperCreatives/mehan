import * as admin from 'firebase-admin';

export interface IBaseEntity {
  id?: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export interface IQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: Array<{
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>;
}

export interface IQueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  lastDoc?: admin.firestore.DocumentSnapshot;
}

export class FirebaseRepository<T extends IBaseEntity> {
  private _db: admin.firestore.Firestore | null = null;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Lazy getter for Firestore instance
  protected get db(): admin.firestore.Firestore {
    if (!this._db) {
      this._db = admin.firestore();
    }
    return this._db;
  }

  /**
   * Save a new document to Firestore
   * @param data - The data to save
   * @returns Promise with the saved document including the generated ID
   */
  async save(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
        now = new Date();
      }
      const docData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await this.db.collection(this.collectionName).add(docData);
      const savedDoc = await docRef.get();
      
      return {
        id: docRef.id,
        ...savedDoc.data(),
      } as T;
    } catch (error) {
      throw new Error(`Failed to save document: ${error}`);
    }
  }

  /**
   * Save multiple documents in a batch
   * @param dataArray - Array of data to save
   * @returns Promise with array of saved documents
   */
  async saveBatch(dataArray: Array<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T[]> {
    try {
      const batch = this.db.batch();
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
        now = new Date();
      }
      const docRefs: admin.firestore.DocumentReference[] = [];

      dataArray.forEach((data) => {
        const docRef = this.db.collection(this.collectionName).doc();
        const docData = {
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(docRef, docData);
        docRefs.push(docRef);
      });

      await batch.commit();

      // Fetch the saved documents
      const savedDocs = await Promise.all(
        docRefs.map(async (docRef) => {
          const doc = await docRef.get();
          return {
            id: docRef.id,
            ...doc.data(),
          } as T;
        })
      );

      return savedDocs;
    } catch (error) {
      throw new Error(`Failed to save batch documents: ${error}`);
    }
  }

  /**
   * Get a document by its ID
   * @param id - The document ID
   * @returns Promise with the document or null if not found
   */
  async getById(id: string): Promise<T | null> {
    try {
      const doc = await this.db.collection(this.collectionName).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    } catch (error) {
      throw new Error(`Failed to get document by ID: ${error}`);
    }
  }

  /**
   * Get multiple documents by their IDs
   * @param ids - Array of document IDs
   * @returns Promise with array of documents (null for non-existent documents)
   */
  async getByIds(ids: string[]): Promise<(T | null)[]> {
    try {
      if (ids.length === 0) return [];

      // Firestore has a limit of 10 documents per get() call
      const batchSize = 10;
      const results: (T | null)[] = [];

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const docs = await this.db.collection(this.collectionName)
          .where(admin.firestore.FieldPath.documentId(), 'in', batch)
          .get();

        const docsMap = new Map();
        docs.forEach(doc => {
          docsMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
          } as T);
        });

        batch.forEach(id => {
          results.push(docsMap.get(id) || null);
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to get documents by IDs: ${error}`);
    }
  }

  /**
   * Update a document by its ID
   * @param id - The document ID
   * @param data - The data to update
   * @returns Promise with the updated document
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
        now = new Date();
      }
      
      const updateData = {
        ...data,
        updatedAt: now,
      };

      await this.db.collection(this.collectionName).doc(id).update(updateData);
      
      // Fetch the updated document
      const updatedDoc = await this.getById(id);
      if (!updatedDoc) {
        throw new Error(`Document with ID ${id} not found`);
      }

      return updatedDoc;
    } catch (error) {
      throw new Error(`Failed to update document: ${error}`);
    }
  }

  /**
   * Update or create a document (upsert)
   * @param id - The document ID
   * @param data - The data to save
   * @returns Promise with the saved document
   */
  async saveOrUpdate(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T> {
    try {
      // Fallback to regular Date if admin.firestore.Timestamp.now() is not available
      let now: any;
      try {
        now = admin.firestore.Timestamp.now();
      } catch (timestampError) {
        console.warn('🔍 [BACKEND DEBUG] admin.firestore.Timestamp.now() not available, using regular Date:', timestampError);
        now = new Date();
      }
      const docRef = this.db.collection(this.collectionName).doc(id);
      const doc = await docRef.get();

      if (doc.exists) {
        // Update existing document
        const updateData = {
          ...data,
          updatedAt: now,
        };
        await docRef.update(updateData);
      } else {
        // Create new document
        const saveData = {
          ...data,
          createdAt: now,
          updatedAt: now,
        };
        await docRef.set(saveData);
      }

      // Fetch the saved/updated document
      const savedDoc = await this.getById(id);
      if (!savedDoc) {
        throw new Error(`Failed to save/update document with ID ${id}`);
      }

      return savedDoc;
    } catch (error) {
      throw new Error(`Failed to save or update document: ${error}`);
    }
  }

  /**
   * Delete a document by its ID
   * @param id - The document ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: string): Promise<void> {
    try {
      await this.db.collection(this.collectionName).doc(id).delete();
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * Delete multiple documents by their IDs
   * @param ids - Array of document IDs
   * @returns Promise that resolves when deletion is complete
   */
  async deleteBatch(ids: string[]): Promise<void> {
    try {
      const batch = this.db.batch();
      
      ids.forEach(id => {
        const docRef = this.db.collection(this.collectionName).doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      throw new Error(`Failed to delete batch documents: ${error}`);
    }
  }

  /**
   * Query documents with various options
   * @param options - Query options including filters, ordering, and pagination
   * @returns Promise with query results
   */
  async query(options: IQueryOptions = {}): Promise<IQueryResult<T>> {
    try {
      let queryRef: admin.firestore.Query = this.db.collection(this.collectionName);

      // Apply where conditions
      if (options.where) {
        options.where.forEach(condition => {
          queryRef = queryRef.where(condition.field, condition.operator, condition.value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        queryRef = queryRef.orderBy(options.orderBy.field, options.orderBy.direction);
      }

      // Apply pagination
      if (options.limit) {
        queryRef = queryRef.limit(options.limit);
      }

      if (options.offset) {
        // Note: Firestore doesn't support offset directly, you might need to use cursor-based pagination
        // This is a simplified implementation
        const offsetQuery = await queryRef.get();
        const docs = offsetQuery.docs.slice(options.offset);
        return {
          data: docs.map(doc => ({ id: doc.id, ...doc.data() }) as T),
          total: docs.length,
          hasMore: false,
        };
      }

      const snapshot = await queryRef.get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        data,
        total: data.length,
        hasMore: false,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      throw new Error(`Failed to query documents: ${error}`);
    }
  }

  /**
   * Get all documents in the collection
   * @returns Promise with all documents
   */
  async getAll(): Promise<T[]> {
    try {
      const snapshot = await this.db.collection(this.collectionName).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      throw new Error(`Failed to get all documents: ${error}`);
    }
  }

  /**
   * Count documents in the collection
   * @param whereConditions - Optional where conditions for counting
   * @returns Promise with the count
   */
  async count(whereConditions?: Array<{
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
    value: any;
  }>): Promise<number> {
    try {
      let queryRef: admin.firestore.Query = this.db.collection(this.collectionName);

      if (whereConditions) {
        whereConditions.forEach(condition => {
          queryRef = queryRef.where(condition.field, condition.operator, condition.value);
        });
      }

      const snapshot = await queryRef.get();
      return snapshot.size;
    } catch (error) {
      throw new Error(`Failed to count documents: ${error}`);
    }
  }

  /**
   * Check if a document exists
   * @param id - The document ID
   * @returns Promise with boolean indicating existence
   */
  async exists(id: string): Promise<boolean> {
    try {
      const doc = await this.db.collection(this.collectionName).doc(id).get();
      return doc.exists;
    } catch (error) {
      throw new Error(`Failed to check document existence: ${error}`);
    }
  }

  /**
   * Get documents with pagination using cursor-based pagination
   * @param limit - Number of documents to fetch
   * @param lastDoc - Last document from previous page (for cursor-based pagination)
   * @param orderBy - Ordering configuration
   * @returns Promise with paginated results
   */
  async getPaginated(
    limit: number = 20,
    lastDoc?: admin.firestore.DocumentSnapshot,
    orderBy?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<IQueryResult<T>> {
    try {
      let queryRef: admin.firestore.Query = this.db.collection(this.collectionName);

      if (orderBy) {
        queryRef = queryRef.orderBy(orderBy.field, orderBy.direction);
      }

      if (lastDoc) {
        queryRef = queryRef.startAfter(lastDoc);
      }

      queryRef = queryRef.limit(limit + 1); // Get one extra to check if there are more

      const snapshot = await queryRef.get();
      const docs = snapshot.docs.slice(0, limit);
      const hasMore = snapshot.docs.length > limit;

      const data = docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      return {
        data,
        total: data.length,
        hasMore,
        lastDoc: docs[docs.length - 1],
      };
    } catch (error) {
      throw new Error(`Failed to get paginated documents: ${error}`);
    }
  }

  /**
   * Perform a transaction with multiple operations
   * @param operations - Function that performs operations within the transaction
   * @returns Promise with the transaction result
   */
  async runTransaction<R>(
    operations: (transaction: admin.firestore.Transaction) => Promise<R>
  ): Promise<R> {
    try {
      return await this.db.runTransaction(operations);
    } catch (error) {
      throw new Error(`Failed to run transaction: ${error}`);
    }
  }

  /**
   * Create a subcollection reference
   * @param parentId - Parent document ID
   * @param subcollectionName - Name of the subcollection
   * @returns New FirebaseRepository instance for the subcollection
   */
  getSubcollection(parentId: string, subcollectionName: string): FirebaseRepository<T> {
    const subcollectionPath = `${this.collectionName}/${parentId}/${subcollectionName}`;
    return new FirebaseRepository<T>(subcollectionPath);
  }
}

// Export specific repository classes for common collections
export class UserRepository extends FirebaseRepository<any> {
  constructor() {
    super('users');
  }
}

export class ProfileRepository extends FirebaseRepository<any> {
  constructor() {
    super('profiles');
  }
}

export class AnalysisRepository extends FirebaseRepository<any> {
  constructor() {
    super('analyses');
  }
}
