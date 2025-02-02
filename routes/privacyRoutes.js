const express = require('express');
const { connectToDatabase } = require('../db'); // Assuming you have a separate DB connection file
const Privacy = require('../models/Privacy');
const routerPrivacy = express.Router();
const mongoose = require('mongoose');

// Ensure Mongoose is properly connected before querying
routerPrivacy.get('/privacy', async (req, res) => {
  try {
    const db = await connectToDatabase(); // Use your custom DB connection function
    console.log('🔍 Fetching privacy data from database...');
    
    // Query the 'privacy' collection directly and get the first document
    const privacy = await db.collection('privacy').findOne({});

    if (!privacy) {
      console.log('⚠️ No privacy data found');
      return res.status(404).json({ message: 'Privacy data not found' });
    }

    console.log('✅ Privacy data found:', privacy);
    res.json({ privacy });  // Send the privacy data as the response

  } catch (error) {
    console.error('❌ Error fetching privacy data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = routerPrivacy;
