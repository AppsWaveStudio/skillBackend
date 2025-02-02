const { connectToDatabase } = require('../db');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');



// Create a new user
async function createUser(req, res) {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const user = req.body;
        const { email } = user;

        // Check if the email already exists in the database
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Insert the new user into the database if email doesn't exist
        const result = await usersCollection.insertOne(user);

        console.log(result);

        res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
}


async function login(req, res) {
    try {
        console.log('Request body:', req.body); // Debugging statement

        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const { email, password } = req.body;

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to login', error: error.message || error });
    }
}


async function getAuth(req, res) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Connect to the database
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        // Find user by ID
        const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user data (excluding sensitive information like password)
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name,
        };

        res.status(200).json(userData);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Failed to authenticate', error: error.message });
    }
}


// Get all users
async function getUsers(req, res) {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
}

// Get a user by ID
async function getUserById(req, res) {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const userId = req.params.id;
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
}

// Update a user by ID
async function updateUser(req, res) {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const userId = req.params.id;
        const updates = req.body;

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
}

// Delete a user by ID
async function deleteUser(req, res) {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection('users');

        const userId = req.params.id;
        const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAuth,
    login
};
