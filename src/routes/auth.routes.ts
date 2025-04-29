import express from 'express';
import {
  handleLogin,
  handleVerifyToken,
  handleRefreshToken,
} from '../controllers/auth.controller';
import { validateLogin } from '../validators/user.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';

const authRouter = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Authenticates a user with email and password (no spaces allowed) and generates a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (must be a valid email)
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (no spaces allowed)
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 user:
 *                   type: object
 *                   description: User information
 *       400:
 *         description: Missing or invalid data
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
authRouter.post('/login', validateLogin, handleValidationErrors, handleLogin);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify a JWT token
 *     description: Verifies a JWT token and returns the user data if valid
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: JWT token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token is valid
 *                 user:
 *                   type: object
 *                   description: User data from token
 *       400:
 *         description: Token is missing
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
authRouter.post('/verify', handleVerifyToken);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh a JWT token
 *     description: Generates a new JWT token for a valid user ID
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to refresh token for
 *     responses:
 *       200:
 *         description: Token refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed
 *                 token:
 *                   type: string
 *                   description: New JWT token
 *                 user:
 *                   type: object
 *                   description: User information
 *       400:
 *         description: User ID is missing
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
authRouter.post('/refresh', handleRefreshToken);

export default authRouter;
