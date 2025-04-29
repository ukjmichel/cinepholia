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
import { validateCreateUser } from '../validators/user.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';

const userRouter = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with name, email, and password.
 *     tags:
 *       - Users
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
 *     description: Creates an employee account. Only administrators can access.
 *     tags:
 *       - Users
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
 *     description: Search users by name or email (requires employee permission).
 *     tags:
 *       - Users
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
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: offset
 *         in: query
 *         required: false
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
 *     tags:
 *       - Users
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
 *     tags:
 *       - Users
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
  authenticateJwt,
  Permission.selfOrAdmin(),
  handleUpdateUser
);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: Change user password
 *     description: Allows a user to change their password.
 *     tags:
 *       - Users
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
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
userRouter.put(
  '/:id/password',
  authenticateJwt,
  Permission.selfOrAdmin(),
  handleChangePassword
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Deletes a user (self or admin only).
 *     tags:
 *       - Users
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
