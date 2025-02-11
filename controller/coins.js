const express = require('express');
const routerCoin = express.Router();
const User = require('../models/user');

routerCoin.post('/update-coins', async (req, res) => {
    try {
        const { emails, coins } = req.body;

        // Check for invalid data
        if (!emails || typeof coins !== 'number') {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        console.log('Updating coins for user:', emails);

        // Find the user by email
        const user = await User.findOne({ email: emails });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the coins field directly
        user.coins = coins;

        // Save the updated user document
        await user.save();

        console.log('User after update:', user);

        res.json({ message: 'Coins updated successfully', user });
    } catch (error) {
        console.error('Error updating coins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// GET request to retrieve coins for a user by email
routerCoin.get('/get-coins', async (req, res) => {
    try {
        const { email } = req.query;  // Get email from query parameters

        // Check for invalid email
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log('Retrieving coins for user:', email);

        // Find the user by email
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send the coins as a response
        res.json({ message: 'Coins retrieved successfully', coins: user.coins });
    } catch (error) {
        console.error('Error retrieving coins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Deduct Coins
routerCoin.post('/deduct-coins', async (req, res) => {
    try {
        const { email, amount } = req.body;

        // Validate amount to ensure it's exactly 10 coins
        if (amount !== 10) {
            return res.status(400).json({ error: 'Invalid deduction amount' });
        }

        const user = await User.findOne({ email: email });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.coins < amount) {
            return res.status(400).json({ error: 'Not enough coins' });
        }

        // Deduct exactly 10 coins
        user.coins -= 10;
        await user.save();

        res.json({ message: 'Coins deducted successfully', remainingCoins: user.coins });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = routerCoin;
