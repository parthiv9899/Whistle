const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://strider:strider123%3F%3F@ct.l2yrumi.mongodb.net/whistle?retryWrites=true&w=majority&appName=ct';

async function clearPostsData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Delete all posts
    console.log('\nDeleting all posts...');
    const postsResult = await db.collection('posts').deleteMany({});
    console.log(`✓ Deleted ${postsResult.deletedCount} posts`);

    // Delete all comments
    console.log('\nDeleting all comments...');
    const commentsResult = await db.collection('comments').deleteMany({});
    console.log(`✓ Deleted ${commentsResult.deletedCount} comments`);

    // Clear posts array from all communities
    console.log('\nClearing posts from communities...');
    const communitiesResult = await db.collection('communities').updateMany(
      {},
      { $set: { posts: [] } }
    );
    console.log(`✓ Updated ${communitiesResult.modifiedCount} communities`);

    // Delete all veil transactions related to posts
    console.log('\nDeleting post-related transactions...');
    const transactionsResult = await db.collection('veiltransactions').deleteMany({
      relatedPostId: { $exists: true, $ne: null }
    });
    console.log(`✓ Deleted ${transactionsResult.deletedCount} post-related transactions`);

    console.log('\n✅ All post data cleared successfully!');

  } catch (error) {
    console.error('Error clearing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

clearPostsData();
