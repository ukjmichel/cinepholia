import { body, param, query } from 'express-validator';

// Validate screeningId param
export const validateScreeningIdParam = [
  param('screeningId')
    .trim()
    .notEmpty()
    .withMessage('screeningId is required')
    .isUUID()
    .withMessage('screeningId must be a valid UUID'),
];

// Validate search query
export const validateScreeningSearchQuery = [
  query('theaterId')
    .trim()
    .notEmpty()
    .withMessage('theaterId is required')
    .isString()
    .withMessage('theaterId must be a valid string'),
  query('movieId')
    .trim()
    .notEmpty()
    .withMessage('movieId is required')
    .isUUID()
    .withMessage('movieId must be a valid UUID'),
];

// Validate screening body (for create / update)
export const validateScreeningBody = [
  body('movieId')
    .optional()
    .isUUID()
    .withMessage('movieId must be a valid UUID'),
  body('theaterId')
    .optional()
    .isString()
    .withMessage('theaterId must be a valid string'),
  body('hallId')
    .optional()
    .isString()
    .withMessage('hallId must be a valid string'),
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('startTime must be a valid ISO8601 datetime'),
  body('durationTime')
    .optional()
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage(
      'durationTime must be a valid time in HH:mm:ss format (00-23 hours, 00-59 minutes/seconds)'
    ),
];
