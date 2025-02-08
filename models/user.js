const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: '' },

    // App Performance Scores
    appHighest: { type: Number, default: 0 },
    appBasic: { type: Number, default: 0 },
    appAverage: { type: Number, default: 0 },

    // Website Performance Scores
    websiteHighest: { type: Number, default: 0 },
    websiteBasic: { type: Number, default: 0 },
    websiteAverage: { type: Number, default: 0 },

    // Coins for rewards system
    coins: { type: Number, default: 0 }
}, { 
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { 
        virtuals: true, 
        transform: function (doc, ret) {
            ret.id = ret._id;  // Add "id" field
            delete ret._id;  // Remove the default "_id"
            delete ret.__v;  // Remove version key
        } 
    } 
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
