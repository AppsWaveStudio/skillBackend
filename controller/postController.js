const Post = require('../models/Post');
const path = require('path');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { text, tasks } = req.body;
        console.log("Incoming request body:", req.body);

        const taskList = tasks ? JSON.parse(tasks) : [];
        console.log("Parsed tasks:", taskList);

        if (!text && taskList.length === 0 && !req.file) {
            return res.status(400).json({ error: 'Please provide text, tasks, or an image.' });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
            console.log("Image URL:", imageUrl);
        }

        const newPost = new Post({
            text: text || null,
            imageUrl,
            tasks: taskList.map(task => ({
                description: task.description,
                isChecked: task.isChecked || false,
            })),
            createdAt: new Date(),
        });

        console.log("New Post to save:", newPost);

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
};



module.exports = { createPost };
