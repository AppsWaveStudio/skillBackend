const { connectToDatabase } = require('../db');
const { ObjectId } = require('mongodb'); // Import ObjectId

// Update tasks in a post
const updateTasks = async (req, res) => {
    try {
        const db = await connectToDatabase(); // Ensure db is connected
        const { id } = req.params;
        const { tasks } = req.body;

        if (!tasks || !Array.isArray(tasks)) {
            return res.status(400).json({ error: 'Invalid or missing tasks array.' });
        }

        const updatedPost = await db.collection('posts').findOneAndUpdate(
            { _id: new ObjectId(id) }, // Convert id to ObjectId
            { $set: { tasks: tasks.map(task => ({
                description: task.description,
                isChecked: task.isChecked || false
            })) }},
            { returnNewDocument: true, upsert: false }
        );
        
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({ message: 'Tasks updated successfully', post: updatedPost });
    } catch (error) {
        console.error("❌ Error updating tasks:", error.message);
        res.status(500).json({ error: 'Failed to update tasks', details: error.message });
    }
};

module.exports = { updateTasks };
