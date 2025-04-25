// src/routes/user.routes.ts
import { Router } from 'express';
import {
  handleCreateUser,
  handleGetUser,
  handleUpdateUser,
  handleChangePassword,
  handleDeleteUser,
  handleSearchUsers,
} from '../controllers/user.controller';

const userRouter = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user in the system with the provided name, email, and password.
 *     operationId: createUser
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name
 *                 example: Alice
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 description: The user's password
 *                 example: Secure123!
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The unique ID of the newly created user
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       description: The user's name
 *                       example: Alice
 *                     email:
 *                       type: string
 *                       description: The user's email
 *                       example: alice@example.com
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *       400:
 *         description: Bad request, validation failed
 *       500:
 *         description: Internal server error
 */
userRouter.post('/', handleCreateUser);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Searches for users by name or email with pagination.
 *     operationId: searchUsers
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         required: true
 *         description: The term to search for in user names and emails
 *         schema:
 *           type: string
 *         example: alice
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Maximum number of results to return (default 10)
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: offset
 *         required: false
 *         description: Number of results to skip (for pagination, default 0)
 *         schema:
 *           type: integer
 *         example: 0
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 123e4567-e89b-12d3-a456-426614174000
 *                       name:
 *                         type: string
 *                         example: Alice Smith
 *                       email:
 *                         type: string
 *                         example: alice.smith@example.com
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     count:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Bad request, missing search term
 *       500:
 *         description: Internal server error
 */
userRouter.get('/search', handleSearchUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user's information by their unique ID.
 *     operationId: getUserById
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to retrieve
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The unique ID of the user
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   description: The user's name
 *                   example: Alice
 *                 email:
 *                   type: string
 *                   description: The user's email
 *                   example: alice@example.com
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.get('/:id', handleGetUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     description: Updates a user's name and/or email.
 *     operationId: updateUser
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to update
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated user name
 *                 example: Alice Smith
 *               email:
 *                 type: string
 *                 description: The updated email address
 *                 example: alice.smith@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     name:
 *                       type: string
 *                       example: Alice Smith
 *                     email:
 *                       type: string
 *                       example: alice.smith@example.com
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.put('/:id', handleUpdateUser);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: Change user password
 *     description: Changes a user's password after verifying the current password.
 *     operationId: changePassword
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password for verification
 *                 example: Secure123!
 *               newPassword:
 *                 type: string
 *                 description: The new password to set
 *                 example: EvenMoreSecure456!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Bad request, invalid current password or missing fields
 *       500:
 *         description: Internal server error
 */
userRouter.put('/:id/password', handleChangePassword);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user from the system.
 *     operationId: deleteUser
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user to delete
 *         schema:
 *           type: string
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.delete('/:id', handleDeleteUser);

export default userRouter;
