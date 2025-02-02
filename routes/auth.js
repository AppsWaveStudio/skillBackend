const express = require('express');
const { login, createUser, getAuth } = require('../controller/userController');

const routerAuth = express.Router();

// Login Route
routerAuth.post('/login', login);

routerAuth.post('/signup', createUser);
// Authentication Check Route
routerAuth.get('/check-auth', getAuth);

module.exports = routerAuth;
