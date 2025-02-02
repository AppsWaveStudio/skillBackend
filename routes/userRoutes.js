const express = require('express');
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require('../controller/userController');

const router = express.Router();

// Correct routes for user operations
router.post('/', createUser); // POST /users
router.get('/', getUsers); // GET /users
router.get('/:id', getUserById); // GET /users/:id
router.put('/:id', updateUser); // PUT /users/:id
router.delete('/:id', deleteUser); // DELETE /users/:id


module.exports = router;
