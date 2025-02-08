const { MongoClient, ObjectId } = require('mongodb');

const express = require('express');
const path = require('path');
const cors = require('cors');
const upload = require('./middleware/upload');
const userRoutes = require('./routes/userRoutes');
const routerAuth = require('./routes/auth');
const routerPrivacy = require('./routes/privacyRoutes');
const routerUserHistory = require('./routes/userHistory');
const { updateTasks } = require('./controller/updatetasks');
const routerUpdateTask = require('./routes/updatetask');
const Coin = require('./models/coin'); // Adjust path if needed
const routerCoins = require('./controller/coins'); // Ensure correct path
const { connectToDatabase } = require('./db');



require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

app.use(express.json()); // Required for parsing JSON request bodies

// // MongoDB connection
// const uri = process.env.MONGO_URI;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// let db; // Store the database instance

// const connectToDatabase = async () => {
//   if (db) {
//     console.log('✅ Using existing database connection');
//     return db;
//   }

//   try {
//     console.log('⏳ Connecting to MongoDB...');
//     await client.connect();
//     db = client.db('test'); // Set the database instance
//     console.log('✅ MongoDB connected successfully');

//     return db;
//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
//     process.exit(1); // Stop the server if DB connection fails
//   }
// };

// -------------------------
// ✅ POST: Create Post
// -------------------------
app.post('/posts', upload.single('image'), async (req, res) => {
  try {
    const { text, tasks, userId, username } = req.body;
    const taskList = tasks ? JSON.parse(tasks) : [];

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!text && taskList.length === 0 && !req.file) {
      return res.status(400).json({ error: 'Please provide text, tasks, or an image.' });
    }

    let imageUrl = null;
    let noimageUrl = 'https://static.vecteezy.com/system/resources/previews/002/534/006/non_2x/social-media-chatting-online-blank-profile-picture-head-and-body-icon-people-standing-icon-grey-background-free-vector.jpg';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      noimageUrl = null;
    }

    const newPost = {
      userId,
      text: text || null,
      imageUrl,
      noimageUrl,
      tasks: taskList.map(task => ({
        description: task.description,
        isChecked: task.isChecked || false,
      })),
      createdAt: new Date().toISOString(),
      accept: false,
      acceptedUserId: null,
      username: username || 'Unknown User',
    };

    const db = await connectToDatabase();
    const postsCollection = db.collection('posts');
    const result = await postsCollection.insertOne(newPost);

    if (result.acknowledged) {
      res.status(201).json({ message: 'Post created successfully', post: newPost });
    } else {
      res.status(500).json({ error: 'Failed to save post to database' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post', details: error.message });
  }
});

// -------------------------
// ✅ PUT: Update User Profile
// -------------------------
app.put('/users/:userId', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const objectId = new ObjectId(userId);
    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne({ _id: objectId }, { $set: updates });

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'User profile updated successfully', updatedFields: updates });
    } else {
      res.status(404).json({ error: 'User not found or no changes made' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile', details: error.message });
  }
});

// -------------------------
// ✅ GET: Fetch User Data
// -------------------------
app.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const objectId = new ObjectId(userId);
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
});

// -------------------------
// ✅ GET: Fetch Posts (with Pagination)
// -------------------------
app.get('/posts', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
      return res.status(400).json({ error: 'Invalid page or limit parameters' });
    }

    const db = await connectToDatabase();
    const postsCollection = db.collection('posts');
    const query = userId ? { userId } : {};

    const posts = await postsCollection
      .find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .toArray();

    const totalPosts = await postsCollection.countDocuments(query);

    res.status(200).json({
      posts,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalPosts / limitNumber),
        totalPosts,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});


app.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const db = await connectToDatabase();
    const postsCollection = db.collection('posts');

    // Find the post by its postId
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post', details: error.message });
  }
});



app.post('/post/:id/comment', async (req, res) => {
  try {
    const { userId, username, text } = req.body;

    if (!userId || !username || !text) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = await connectToDatabase();
    const postsCollection = db.collection('posts');

    // Convert post ID to ObjectId
    const postId = new ObjectId(req.params.id);

    // Find the post
    const post = await postsCollection.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // New comment object
    const newComment = { userId, username, text, createdAt: new Date() };

    // Update the post in MongoDB by pushing the comment
    const updateResult = await postsCollection.updateOne(
      { _id: postId },
      { $push: { comments: newComment } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: 'Failed to add comment' });
    }

    console.log('Comment added to post:', newComment);
    res.json({ message: 'Comment added successfully', comment: newComment });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/post/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid Post ID format' });
    }

    const db = await connectToDatabase();
    const postsCollection = db.collection('posts');

    // Convert to ObjectId
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ comments: post.comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

connectToDatabase();




// -------------------------
// ✅ Start the Server
// -------------------------


// Middleware

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', routerAuth);
app.use('/api', routerPrivacy);
app.use('/api', routerUserHistory);
app.use('/api', routerUpdateTask);
app.use('/api', routerCoins); // Make sure your routes are loaded after DB connection

// Start the server after MongoDB connection is established
app.listen(port, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
