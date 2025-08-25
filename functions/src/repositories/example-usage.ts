import { FirebaseRepository } from './firebase.repository';

// Example entity interfaces
interface User {
  id?: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface LinkedInProfile {
  id?: string;
  userId: string;
  profileUrl: string;
  analysis: string;
  suggestions: string[];
  score: number;
  createdAt?: any;
  updatedAt?: any;
}

interface Analysis {
  id?: string;
  profileId: string;
  analysis: string;
  suggestions: string[];
  score: number;
  confidence: number;
  createdAt?: any;
  updatedAt?: any;
}

interface Post {
  id?: string;
  title: string;
  content: string;
  likes: number;
  createdAt?: any;
  updatedAt?: any;
}

// Example usage functions
export class ExampleUsage {
  private userRepo: FirebaseRepository<User>;
  private profileRepo: FirebaseRepository<LinkedInProfile>;
  private analysisRepo: FirebaseRepository<Analysis>;
  private postRepo: FirebaseRepository<Post>;

  constructor() {
    this.userRepo = new FirebaseRepository<User>('users');
    this.profileRepo = new FirebaseRepository<LinkedInProfile>('profiles');
    this.analysisRepo = new FirebaseRepository<Analysis>('analyses');
    this.postRepo = new FirebaseRepository<Post>('posts');
  }

  // Example 1: Basic CRUD operations
  async basicCRUDExample() {
    console.log('=== Basic CRUD Example ===');

    // Create a new user
    const newUser = await this.userRepo.save({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true
    });
    console.log('Created user:', newUser);

    // Get user by ID
    const user = await this.userRepo.getById(newUser.id!);
    console.log('Retrieved user:', user);

    // Update user
    const updatedUser = await this.userRepo.update(newUser.id!, {
      age: 31,
      isActive: false
    });
    console.log('Updated user:', updatedUser);

    // Delete user
    await this.userRepo.delete(newUser.id!);
    console.log('User deleted');
  }

  // Example 2: Batch operations
  async batchOperationsExample() {
    console.log('=== Batch Operations Example ===');

    // Save multiple users
    const users = await this.userRepo.saveBatch([
      { name: 'Alice Smith', email: 'alice@example.com', age: 25, isActive: true },
      { name: 'Bob Johnson', email: 'bob@example.com', age: 35, isActive: true },
      { name: 'Carol Davis', email: 'carol@example.com', age: 28, isActive: false }
    ]);
    console.log('Created users:', users);

    // Get multiple users by IDs
    const userIds = users.map(u => u.id!);
    const retrievedUsers = await this.userRepo.getByIds(userIds);
    console.log('Retrieved users:', retrievedUsers);

    // Delete multiple users
    await this.userRepo.deleteBatch(userIds);
    console.log('Users deleted');
  }

  // Example 3: Querying with filters
  async queryExample() {
    console.log('=== Query Example ===');

    // Create some test data
    const users = await this.userRepo.saveBatch([
      { name: 'Alice', email: 'alice@example.com', age: 25, isActive: true },
      { name: 'Bob', email: 'bob@example.com', age: 35, isActive: true },
      { name: 'Carol', email: 'carol@example.com', age: 28, isActive: false },
      { name: 'David', email: 'david@example.com', age: 40, isActive: true }
    ]);

    // Query active users over 30
    const activeUsersOver30 = await this.userRepo.query({
      where: [
        { field: 'isActive', operator: '==', value: true },
        { field: 'age', operator: '>', value: 30 }
      ],
      orderBy: { field: 'name', direction: 'asc' }
    });
    console.log('Active users over 30:', activeUsersOver30);

    // Count active users
    const activeUserCount = await this.userRepo.count([
      { field: 'isActive', operator: '==', value: true }
    ]);
    console.log('Active user count:', activeUserCount);

    // Clean up
    const userIds = users.map(u => u.id!);
    await this.userRepo.deleteBatch(userIds);
  }

  // Example 4: Pagination
  async paginationExample() {
    console.log('=== Pagination Example ===');

    // Create many users
    const users = [];
    for (let i = 1; i <= 50; i++) {
      users.push({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 40),
        isActive: i % 2 === 0
      });
    }

    await this.userRepo.saveBatch(users);

    // Get first page
    const page1 = await this.userRepo.getPaginated(10, undefined, {
      field: 'name',
      direction: 'asc'
    });
    console.log('Page 1:', page1.data.map(u => u.name));

    // Get second page
    const page2 = await this.userRepo.getPaginated(10, page1.lastDoc, {
      field: 'name',
      direction: 'asc'
    });
    console.log('Page 2:', page2.data.map(u => u.name));

    // Clean up
    const allUsers = await this.userRepo.getAll();
    const userIds = allUsers.map(u => u.id!);
    await this.userRepo.deleteBatch(userIds);
  }

  // Example 5: Transactions
  async transactionExample() {
    console.log('=== Transaction Example ===');

    // Create a user and profile in a transaction
    await this.userRepo.runTransaction(async (transaction) => {
      // Create user
      const userRef = this.userRepo['db'].collection('users').doc();
      transaction.set(userRef, {
        name: 'Transaction User',
        email: 'transaction@example.com',
        age: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create profile for the same user
      const profileRef = this.userRepo['db'].collection('profiles').doc();
      transaction.set(profileRef, {
        userId: userRef.id,
        profileUrl: 'https://linkedin.com/in/transactionuser',
        analysis: 'Profile created in transaction',
        suggestions: ['Add more details'],
        score: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    console.log('Transaction completed');
  }

  // Example 6: LinkedIn Profile Analysis Workflow
  async linkedInAnalysisExample() {
    console.log('=== LinkedIn Analysis Example ===');

    // Create a user
    const user = await this.userRepo.save({
      name: 'LinkedIn User',
      email: 'linkedin@example.com',
      age: 30,
      isActive: true
    });

    // Create a LinkedIn profile
    const profile = await this.profileRepo.save({
      userId: user.id!,
      profileUrl: 'https://linkedin.com/in/linkedinuser',
      analysis: 'Strong technical background with 5+ years of experience',
      suggestions: ['Add more projects', 'Update skills section'],
      score: 85
    });

    // Create an analysis record
    const analysis = await this.analysisRepo.save({
      profileId: profile.id!,
      analysis: 'Comprehensive analysis of the LinkedIn profile',
      suggestions: ['Add certifications', 'Include volunteer work'],
      score: 85,
      confidence: 90
    });

    // Query user's profiles
    const userProfiles = await this.profileRepo.query({
      where: [{ field: 'userId', operator: '==', value: user.id }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });

    console.log('User profiles:', userProfiles);

    // Clean up
    await this.analysisRepo.delete(analysis.id!);
    await this.profileRepo.delete(profile.id!);
    await this.userRepo.delete(user.id!);
  }

  // Example 7: Posts
  async postsExample() {
    console.log('=== Posts Example ===');

    // Create a user
    const user = await this.userRepo.save({
      name: 'Posts User',
      email: 'posts@example.com',
      age: 25,
      isActive: true
    });

    // Create posts
    const posts = await this.postRepo.saveBatch([
      { title: 'First Post', content: 'Hello World', likes: 5 },
      { title: 'Second Post', content: 'Another post', likes: 10 },
      { title: 'Third Post', content: 'Yet another post', likes: 3 }
    ]);

    console.log('Created posts:', posts);

    // Get all posts
    const allPosts = await this.postRepo.getAll();
    console.log('All posts:', allPosts);

    // Clean up
    const postIds = posts.map(p => p.id!);
    await this.postRepo.deleteBatch(postIds);
    await this.userRepo.delete(user.id!);
  }

  // Run all examples
  async runAllExamples() {
    try {
      await this.basicCRUDExample();
      await this.batchOperationsExample();
      await this.queryExample();
      await this.paginationExample();
      await this.transactionExample();
      await this.linkedInAnalysisExample();
      await this.postsExample();
      
      console.log('All examples completed successfully!');
    } catch (error) {
      console.error('Error running examples:', error);
    }
  }
}

// Export for use in other files
export default ExampleUsage;


