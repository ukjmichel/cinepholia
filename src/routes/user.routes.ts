import { Router } from 'express';
import {
  handleCreateUser,
  handleGetUser,
  handleUpdateUser,
  handleChangePassword,
  handleDeleteUser,
  handleSearchUsers,
} from '../controllers/user.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import {
  validateCreateUser,
  validatePassword,
  validateUpdateUser,
} from '../validators/user.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';

const userRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (CRUD, search, authentication)
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with name, email, and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: Secure123!
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
userRouter.post(
  '/',
  validateCreateUser,
  handleValidationErrors,
  handleCreateUser('utilisateur')
);

/**
 * @swagger
 * /users/employee:
 *   post:
 *     summary: Create a new employee user (admin only)
 *     description: Only administrators can create employee accounts.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bob
 *               email:
 *                 type: string
 *                 example: bob@example.com
 *               password:
 *                 type: string
 *                 example: Secure456!
 *     responses:
 *       201:
 *         description: Employee user created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
userRouter.post(
  '/employee',
  authenticateJwt,
  Permission.authorize('administrateur'),
  validateCreateUser,
  handleValidationErrors,
  handleCreateUser('employé')
);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Search for users by name or email (requires employee permission).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: searchTerm
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing search term
 *       500:
 *         description: Internal server error
 */
userRouter.get(
  '/search',
  authenticateJwt,
  Permission.authorize('employé'),
  handleSearchUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user by ID (self or staff only).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.get(
  '/:id',
  authenticateJwt,
  Permission.selfOrStaff(),
  handleGetUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user information
 *     description: Update user name or email (self or admin only).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.put(
  '/:id',
  validateUpdateUser,
  handleValidationErrors,
  authenticateJwt,
  Permission.selfOrAdmin(),
  handleUpdateUser
);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: Change user password
 *     description: Allows a user to change their password (self or admin).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
userRouter.put(
  '/:id/password',
  validatePassword,
  handleValidationErrors,
  authenticateJwt,
  Permission.selfOrAdmin(),
  handleChangePassword
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user account (self or admin only).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.delete(
  '/:id',
  authenticateJwt,
  Permission.selfOrAdmin(),
  handleDeleteUser
);

export default userRouter;
