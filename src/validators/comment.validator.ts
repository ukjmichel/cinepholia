import { body, query, param } from 'express-validator';

export const validateCreateComment = [
  body('bookingId')
    .isUUID()
    .withMessage('bookingId must be a valid UUID')
    .notEmpty()
    .withMessage('bookingId is required'),

  body('comment')
    .isString()
    .withMessage('Comment must be a string')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),

  body('rating')
    .isInt({ min: 0, max: 5 })
    .withMessage('Rating must be an integer between 0 and 5'),
];

export const validateBookingIdParam = [
  param('bookingId').isUUID().withMessage('bookingId must be a valid UUID'),
];

export const validateCommentIdParam = [
  param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId'),
];

export const validateStatusQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed'])
    .withMessage('Invalid status filter'),
];
