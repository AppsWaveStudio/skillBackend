const express = require('express');
const { connectToDatabase } = require('../db');
const ObjectId = require('mongodb').ObjectId; // To handle ObjectId conversion
const routeruserHistory = express.Router();

// Route to accept a post
// Route to accept a post
routeruserHistory.post('/acceptPost', async (req, res) => {
  try {
    const { userId, postId, exchangeWithPostId } = req.body;  // Now including exchangeWithPostId
    
    // Validate input
    if (!userId || !postId) {
      return res.status(400).json({ error: 'userId and postId are required' });
    }

    // Convert postId and exchangeWithPostId to ObjectId if provided
    const postObjectId = new ObjectId(postId);
    const exchangePostObjectId = exchangeWithPostId ? new ObjectId(exchangeWithPostId) : null;

    // Connect to the database
    const db = await connectToDatabase();

    // 1. Check if the post already has an acceptedUserId
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ _id: postObjectId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.acceptedUserId) {
      return res.status(400).json({ error: 'Post already accepted by another user' });
    }

    // 2. Add the user_id and post_id to the user_history collection
    const userHistoryCollection = db.collection('user_history');
    const userHistoryData = {
      user_id: userId,
      post_id: postObjectId,
      acceptedAt: new Date().toISOString(),  // Timestamp when the post was accepted
    };

    if (exchangePostObjectId) {
      userHistoryData.exchange_with_post_id = exchangePostObjectId;  // Add exchange information if provided
    }

    const userHistoryResult = await userHistoryCollection.insertOne(userHistoryData);

    if (!userHistoryResult.acknowledged) {
      return res.status(500).json({ error: 'Failed to record user history' });
    }

    // 3. Update the post in the posts collection to set accepted: true, acceptedUserId, and exchangeWithPostId
    const updateResult = await postsCollection.updateOne(
      { _id: postObjectId },
      { 
        $set: { 
          accept: true,
          acceptedUserId: userId,  // Add the userId of the person accepting the post
          exchangeWithPostId: exchangePostObjectId || null,  // Include the exchangeWithPostId if provided
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to accept post' });
    }

    // Return success response
    res.status(200).json({ message: 'Post accepted and user history updated successfully' });

  } catch (error) {
    console.error('Error accepting post:', error);
    res.status(500).json({ error: 'Failed to accept post', details: error.message });
  }
});


// Route to accept a post with pricing and exchangeWithPostId
routeruserHistory.post('/acceptPostWithPrice', async (req, res) => {
  try {
    const { userId, postId, price, exchangeWithPostId } = req.body;
    
    // Validate input
    if (!userId || !postId || price === undefined || exchangeWithPostId === undefined) {
      return res.status(400).json({ error: 'userId, postId, price, and exchangeWithPostId are required' });
    }

    // Convert IDs to ObjectId
    const postObjectId = new ObjectId(postId);
    const exchangePostObjectId = exchangeWithPostId ? new ObjectId(exchangeWithPostId) : null;
    
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the post already has an acceptedUserId
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ _id: postObjectId });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.acceptedUserId) {
      return res.status(400).json({ error: 'Post already accepted by another user' });
    }

    // Add the user_id and post_id to the user_history collection
    const userHistoryCollection = db.collection('user_history');
    const userHistoryResult = await userHistoryCollection.insertOne({
      user_id: userId,
      post_id: postObjectId,
      acceptedAt: new Date().toISOString(),
      price: price,
      exchange_with_post_id: exchangePostObjectId
    });

    if (!userHistoryResult.acknowledged) {
      return res.status(500).json({ error: 'Failed to record user history' });
    }

    // Update the post in the posts collection
    const updateResult = await postsCollection.updateOne(
      { _id: postObjectId },
      { 
        $set: { 
          accept: true,
          acceptedUserId: userId,
          price: price,
          exchangeWithPostId: exchangePostObjectId
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to accept post' });
    }

    // Return success response
    res.status(200).json({ message: 'Post accepted with price and exchange information successfully' });

  } catch (error) {
    console.error('Error accepting post:', error);
    res.status(500).json({ error: 'Failed to accept post', details: error.message });
  }
});


// Route to update post acceptance status
routeruserHistory.patch('/updatePostAcceptStatus', async (req, res) => {
  try {
    const { postId, accept } = req.body;

    // Validate input
    if (!postId || accept === undefined) {
      return res.status(400).json({ error: 'postId and accept are required' });
    }

    // Validate and Convert postId to ObjectId
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid postId format' });
    }

    const postObjectId = new ObjectId(postId);

    // Connect to the database
    const db = await connectToDatabase();
    
    // Find the post in the collection
    const postsCollection = db.collection('posts');
    const post = await postsCollection.findOne({ _id: postObjectId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log("Post found:", post); // Log post data for debugging

    // Update the post's accept status
    const updateResult = await postsCollection.updateOne(
      { _id: postObjectId },
      { 
        $set: { 
          accept: accept,  // Set the accept status
        }
      }
    );

    console.log("Update result:", updateResult); // Log update result for debugging

    // Check if the document was updated
    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to update post acceptance' });
    }

    // Return success response
    res.status(200).json({ message: 'Post acceptance updated successfully' });

  } catch (error) {
    console.error('Error updating post acceptance:', error);
    res.status(500).json({ error: 'Failed to update post acceptance', details: error.message });
  }
});




module.exports = routeruserHistory;
