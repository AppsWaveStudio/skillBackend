const jwt = require('jsonwebtoken');

// Function to generate JWT token
function generateToken(userId) {
    // Create the payload
    const payload = {
        userId: userId,
    };

    // Define the secret key (it should be a secure, private key in a real application)
    const secretKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZmI1ZGQ1Yy1hZTMyLTQwY2YtYjYzYy1jMmNkNzgwZmY3NzAiLCJpYXQiOjE2MzQyMzg0NjYsImV4cCI6MTYzNDIzMjA2Nn0.P9KdO5kQHE4NDoPx8efswCHfHFcFSZ2tGsJ91nXHjS8';

    // Set the token expiration (optional)
    const options = { expiresIn: '1h' }; // token expires in 1 hour

    // Generate and sign the token
    const token = jwt.sign(payload, secretKey, options);

    return token;
}
