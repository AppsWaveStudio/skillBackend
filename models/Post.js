const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    text: { type: String, default: null },
    imageUrl: { type: String, default: null },
    tasks: [{
        description: { type: String },
        isChecked: { type: Boolean, default: false },
    }],
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
