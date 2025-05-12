// src/routes/comment.route.ts
import express from 'express';
import {
  handleCreateComment,
  handleGetCommentByBooking,
  handleListComments,
  handleConfirmComment,
  handleDeleteComment,
  handleGetCommentsByMovieId,
} from '../controllers/comment.controller';
import {
  validateCreateComment,
  validateBookingIdParam,
  validateCommentIdParam,
  validateStatusQuery,
} from '../validators/comment.validator';
import handleValidationErrors from '../middlewares/handleValidationErrors.middleware';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { Permission } from '../middlewares/authorization.middleware';
import { validateMovieIdParam } from '../validators/movie.validator';

const router = express.Router();

/**
 * @route POST /api/comments
 */
router.post(
  '/',
  authenticateJwt,
  Permission.isNotStaff(),
  validateCreateComment,
  handleValidationErrors,
  handleCreateComment
);

/**
 * @route GET /api/comments/:bookingId
 */
router.get(
  '/:bookingId',
  authenticateJwt,
  Permission.isBookingOwnerOrStaff(),
  validateBookingIdParam,
  handleValidationErrors,
  handleGetCommentByBooking
);

/**
 * @route PATCH /api/comments/:id/confirm
 */
router.patch(
  '/:id/confirm',
  authenticateJwt,
  Permission.authorize("employé"),
  validateCommentIdParam,
  handleValidationErrors,
  handleConfirmComment
);

/**
 * @route DELETE /api/comments/:id
 */
router.delete(
  '/:id',
  authenticateJwt,
  Permission.authorize("employé"),
  validateCommentIdParam,
  handleValidationErrors,
  handleDeleteComment
);

/**
 * @route GET /api/comments?status=pending
 */
router.get(
  '/',
  authenticateJwt,
  Permission.authorize('employé'),
  validateStatusQuery,
  handleValidationErrors,
  handleListComments
);
/**
 * @route GET /api/comments/movie/:movieId/pending
 */
router.get(
  '/movie/:movieId/pending',
  authenticateJwt,
  Permission.authorize('employé'),
  validateMovieIdParam,
  handleValidationErrors,
  handleGetCommentsByMovieId('pending')
);

/**
 * @route GET /api/comments/movie/:movieId/confirmed
 */
router.get(
  '/movie/:movieId/confirmed',
  authenticateJwt,
  Permission.authorize('employé'),
  validateMovieIdParam,
  handleValidationErrors,
  handleGetCommentsByMovieId('confirmed')
);

/**
 * @route GET /api/comments/movie/:movieId/all
 */
router.get(
  '/movie/:movieId/all',
  authenticateJwt,
  Permission.authorize('employé'),
  validateMovieIdParam,
  handleValidationErrors,
  handleGetCommentsByMovieId('all')
);



export default router;
