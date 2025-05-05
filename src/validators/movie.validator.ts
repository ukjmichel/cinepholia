import { body, param, query } from 'express-validator';

/**
 * Validator for creating a movie (all fields required).
 */
export const validateCreateMovie = [
  body('title')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),

  body('description')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),

  body('ageRating')
    .trim()
    .notEmpty()
    .withMessage('Age rating is required')
    .matches(/^\d+\+?$/)
    .withMessage('Age rating must be like "13+"')
    .isLength({ max: 10 })
    .withMessage('Age rating must be at most 10 characters'),

  body('genre')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Genre is required')
    .isLength({ max: 100 })
    .withMessage('Genre must be at most 100 characters'),

  body('releaseDate')
    .notEmpty()
    .withMessage('Release date is required')
    .isISO8601()
    .withMessage('Release date must be a valid ISO8601 date')
    .toDate(),

  body('director')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Director is required')
    .isLength({ max: 255 })
    .withMessage('Director must be at most 255 characters'),

  body('durationMinutes')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('posterUrl')
    .optional()
    .isURL()
    .withMessage('Poster URL must be a valid URL'),
];

/**
 * Validator for updating a movie (all fields optional, but validated if present).
 */
export const validateUpdateMovie = [
  body('title')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),

  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),

  body('ageRating')
    .optional()
    .trim()
    .matches(/^\d+\+?$/)
    .withMessage('Age rating must be like "13+"')
    .isLength({ max: 10 })
    .withMessage('Age rating must be at most 10 characters'),

  body('genre')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('Genre must be at most 100 characters'),

  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid ISO8601 date')
    .toDate(),

  body('director')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 255 })
    .withMessage('Director must be at most 255 characters'),

  body('durationMinutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('posterUrl')
    .optional()
    .isURL()
    .withMessage('Poster URL must be a valid URL'),
];

/**
 * Validator for movieId param (UUID format assumed).
 */
export const validateMovieIdParam = [
  param('movieId')
    .notEmpty()
    .withMessage('movieId param is required')
    .isString()
    .withMessage('movieId must be a string'),
];

/**
 * Validator for search queries (optional but if provided, validated).
 */
export const validateSearchQuery = [
  query('title')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title query must be at most 255 characters'),

  query('genre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Genre query must be at most 100 characters'),

  query('director')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Director query must be at most 255 characters'),

  query('ageRating')
    .optional()
    .trim()
    .matches(/^\d+\+?$/)
    .withMessage('Age rating must be like "13+"'),
];
