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
exports.AnalysisRepository = exports.ProfileRepository = exports.UserRepository = exports.FirebaseRepository = void 0;
const admin = __importStar(require("firebase-admin"));
class FirebaseRepository {
    constructor(collectionName) {
        this._db = null;
        this.collectionName = collectionName;
    }
    // Lazy getter for Firestore instance
    get db() {
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
    async save(data) {
        try {
            const now = admin.firestore.Timestamp.now();
            const docData = Object.assign(Object.assign({}, data), { createdAt: now, updatedAt: now });
            const docRef = await this.db.collection(this.collectionName).add(docData);
            const savedDoc = await docRef.get();
            return Object.assign({ id: docRef.id }, savedDoc.data());
        }
        catch (error) {
            throw new Error(`Failed to save document: ${error}`);
        }
    }
    /**
     * Save multiple documents in a batch
     * @param dataArray - Array of data to save
     * @returns Promise with array of saved documents
     */
    async saveBatch(dataArray) {
        try {
            const batch = this.db.batch();
            const now = admin.firestore.Timestamp.now();
            const docRefs = [];
            dataArray.forEach((data) => {
                const docRef = this.db.collection(this.collectionName).doc();
                const docData = Object.assign(Object.assign({}, data), { createdAt: now, updatedAt: now });
                batch.set(docRef, docData);
                docRefs.push(docRef);
            });
            await batch.commit();
            // Fetch the saved documents
            const savedDocs = await Promise.all(docRefs.map(async (docRef) => {
                const doc = await docRef.get();
                return Object.assign({ id: docRef.id }, doc.data());
            }));
            return savedDocs;
        }
        catch (error) {
            throw new Error(`Failed to save batch documents: ${error}`);
        }
    }
    /**
     * Get a document by its ID
     * @param id - The document ID
     * @returns Promise with the document or null if not found
     */
    async getById(id) {
        try {
            const doc = await this.db.collection(this.collectionName).doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return Object.assign({ id: doc.id }, doc.data());
        }
        catch (error) {
            throw new Error(`Failed to get document by ID: ${error}`);
        }
    }
    /**
     * Get multiple documents by their IDs
     * @param ids - Array of document IDs
     * @returns Promise with array of documents (null for non-existent documents)
     */
    async getByIds(ids) {
        try {
            if (ids.length === 0)
                return [];
            // Firestore has a limit of 10 documents per get() call
            const batchSize = 10;
            const results = [];
            for (let i = 0; i < ids.length; i += batchSize) {
                const batch = ids.slice(i, i + batchSize);
                const docs = await this.db.collection(this.collectionName)
                    .where(admin.firestore.FieldPath.documentId(), 'in', batch)
                    .get();
                const docsMap = new Map();
                docs.forEach(doc => {
                    docsMap.set(doc.id, Object.assign({ id: doc.id }, doc.data()));
                });
                batch.forEach(id => {
                    results.push(docsMap.get(id) || null);
                });
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to get documents by IDs: ${error}`);
        }
    }
    /**
     * Update a document by its ID
     * @param id - The document ID
     * @param data - The data to update
     * @returns Promise with the updated document
     */
    async update(id, data) {
        try {
            const updateData = Object.assign(Object.assign({}, data), { updatedAt: admin.firestore.Timestamp.now() });
            await this.db.collection(this.collectionName).doc(id).update(updateData);
            // Fetch the updated document
            const updatedDoc = await this.getById(id);
            if (!updatedDoc) {
                throw new Error(`Document with ID ${id} not found`);
            }
            return updatedDoc;
        }
        catch (error) {
            throw new Error(`Failed to update document: ${error}`);
        }
    }
    /**
     * Update or create a document (upsert)
     * @param id - The document ID
     * @param data - The data to save
     * @returns Promise with the saved document
     */
    async saveOrUpdate(id, data) {
        try {
            const now = admin.firestore.Timestamp.now();
            const docRef = this.db.collection(this.collectionName).doc(id);
            const doc = await docRef.get();
            if (doc.exists) {
                // Update existing document
                const updateData = Object.assign(Object.assign({}, data), { updatedAt: now });
                await docRef.update(updateData);
            }
            else {
                // Create new document
                const saveData = Object.assign(Object.assign({}, data), { createdAt: now, updatedAt: now });
                await docRef.set(saveData);
            }
            // Fetch the saved/updated document
            const savedDoc = await this.getById(id);
            if (!savedDoc) {
                throw new Error(`Failed to save/update document with ID ${id}`);
            }
            return savedDoc;
        }
        catch (error) {
            throw new Error(`Failed to save or update document: ${error}`);
        }
    }
    /**
     * Delete a document by its ID
     * @param id - The document ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        try {
            await this.db.collection(this.collectionName).doc(id).delete();
        }
        catch (error) {
            throw new Error(`Failed to delete document: ${error}`);
        }
    }
    /**
     * Delete multiple documents by their IDs
     * @param ids - Array of document IDs
     * @returns Promise that resolves when deletion is complete
     */
    async deleteBatch(ids) {
        try {
            const batch = this.db.batch();
            ids.forEach(id => {
                const docRef = this.db.collection(this.collectionName).doc(id);
                batch.delete(docRef);
            });
            await batch.commit();
        }
        catch (error) {
            throw new Error(`Failed to delete batch documents: ${error}`);
        }
    }
    /**
     * Query documents with various options
     * @param options - Query options including filters, ordering, and pagination
     * @returns Promise with query results
     */
    async query(options = {}) {
        try {
            let queryRef = this.db.collection(this.collectionName);
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
                    data: docs.map(doc => (Object.assign({ id: doc.id }, doc.data()))),
                    total: docs.length,
                    hasMore: false,
                };
            }
            const snapshot = await queryRef.get();
            const data = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            return {
                data,
                total: data.length,
                hasMore: false,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
            };
        }
        catch (error) {
            throw new Error(`Failed to query documents: ${error}`);
        }
    }
    /**
     * Get all documents in the collection
     * @returns Promise with all documents
     */
    async getAll() {
        try {
            const snapshot = await this.db.collection(this.collectionName).get();
            return snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        }
        catch (error) {
            throw new Error(`Failed to get all documents: ${error}`);
        }
    }
    /**
     * Count documents in the collection
     * @param whereConditions - Optional where conditions for counting
     * @returns Promise with the count
     */
    async count(whereConditions) {
        try {
            let queryRef = this.db.collection(this.collectionName);
            if (whereConditions) {
                whereConditions.forEach(condition => {
                    queryRef = queryRef.where(condition.field, condition.operator, condition.value);
                });
            }
            const snapshot = await queryRef.get();
            return snapshot.size;
        }
        catch (error) {
            throw new Error(`Failed to count documents: ${error}`);
        }
    }
    /**
     * Check if a document exists
     * @param id - The document ID
     * @returns Promise with boolean indicating existence
     */
    async exists(id) {
        try {
            const doc = await this.db.collection(this.collectionName).doc(id).get();
            return doc.exists;
        }
        catch (error) {
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
    async getPaginated(limit = 20, lastDoc, orderBy) {
        try {
            let queryRef = this.db.collection(this.collectionName);
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
            const data = docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
            return {
                data,
                total: data.length,
                hasMore,
                lastDoc: docs[docs.length - 1],
            };
        }
        catch (error) {
            throw new Error(`Failed to get paginated documents: ${error}`);
        }
    }
    /**
     * Perform a transaction with multiple operations
     * @param operations - Function that performs operations within the transaction
     * @returns Promise with the transaction result
     */
    async runTransaction(operations) {
        try {
            return await this.db.runTransaction(operations);
        }
        catch (error) {
            throw new Error(`Failed to run transaction: ${error}`);
        }
    }
    /**
     * Create a subcollection reference
     * @param parentId - Parent document ID
     * @param subcollectionName - Name of the subcollection
     * @returns New FirebaseRepository instance for the subcollection
     */
    getSubcollection(parentId, subcollectionName) {
        const subcollectionPath = `${this.collectionName}/${parentId}/${subcollectionName}`;
        return new FirebaseRepository(subcollectionPath);
    }
}
exports.FirebaseRepository = FirebaseRepository;
// Export specific repository classes for common collections
class UserRepository extends FirebaseRepository {
    constructor() {
        super('users');
    }
}
exports.UserRepository = UserRepository;
class ProfileRepository extends FirebaseRepository {
    constructor() {
        super('profiles');
    }
}
exports.ProfileRepository = ProfileRepository;
class AnalysisRepository extends FirebaseRepository {
    constructor() {
        super('analyses');
    }
}
exports.AnalysisRepository = AnalysisRepository;
//# sourceMappingURL=firebase.repository.js.map