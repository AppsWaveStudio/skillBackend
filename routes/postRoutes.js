const express = require('express');
const { createPost } = require('../controller/postController');
const upload = require('../middleware/upload');

const routerPost = express.Router();

// Correct routes for user operations
routerPost.post('/', upload.single('image'), createPost);



module.exports = routerPost;
