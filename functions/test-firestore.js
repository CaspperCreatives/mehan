const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  projectId: 'mehan-7640e',
  // You would need to add your service account key here
  // For now, we'll use the default credentials
};

admin.initializeApp({
  projectId: 'mehan-7640e'
});

const db = admin.firestore();

async function testCollectionCreation() {
  try {
    console.log('Testing Firestore collection creation...');
    
    // Test data
    const testData = {
      userId: 'test-user-123',
      profileId: 'test-profile-456',
      linkedinUrl: 'https://linkedin.com/in/test',
      profileData: { name: 'Test User' },
      optimizedContent: [],
      totalOptimizations: 0,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };
    
    // Try to create a document in the complete_user_objects collection
    const docRef = await db.collection('complete_user_objects').add(testData);
    console.log('✅ Successfully created document with ID:', docRef.id);
    
    // Verify the document was created
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Document exists:', doc.data());
    } else {
      console.log('❌ Document does not exist');
    }
    
    // List all collections
    const collections = await db.listCollections();
    console.log('📋 Available collections:');
    collections.forEach(collection => {
      console.log('  -', collection.id);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testCollectionCreation();
