const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; // Load the connection string from the .env file
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 400000, // 100 seconds timeout
});


const connectToDatabase = async (retryCount = 5) => {
    try {
        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }
        console.log('Connected to MongoDB successfully');
        return client.db();
    } catch (error) {
        if (retryCount === 0) {
            console.error('Failed to connect to MongoDB after several attempts');
            throw error;
        }
        console.log('Retrying connection...');
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
        return connectToDatabase(retryCount - 1);
    }
};


module.exports = { connectToDatabase };
