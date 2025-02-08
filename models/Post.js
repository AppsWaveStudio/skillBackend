const mongoose = require('mongoose');

// Post Schema
const CommentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  });
  
  const postSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    text: String,
    imageUrl: String,
    noimageUrl: String,
    tasks: [{ description: String, isChecked: Boolean }],
    createdAt: { type: Date, default: Date.now },
    accept: Boolean,
    acceptedUserId: String,
    username: String,
    exchangeWithPostId: String,
    price: Number,
    comments: [CommentSchema], // Add comments array
  });
  
const Post = mongoose.model('Post', postSchema);


module.exports = Post;
