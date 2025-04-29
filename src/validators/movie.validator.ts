import { body } from 'express-validator';

const validateCreateMovie = [
  body('title')
    .trim()
    .escape() // 🛡️ protect against special characters
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be at most 255 characters'),

  body('description')
    .trim()
    .escape() // 🛡️ protect
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),

  body('ageRating')
    .trim()
    .escape() // 🛡️ protect
    .notEmpty()
    .withMessage('Age rating is required')
    .isLength({ max: 10 })
    .withMessage('Age rating must be at most 10 characters'),

  body('genre')
    .trim()
    .escape() // 🛡️ protect
    .notEmpty()
    .withMessage('Genre is required')
    .isLength({ max: 100 })
    .withMessage('Genre must be at most 100 characters'),

  body('releaseDate')
    .notEmpty()
    .withMessage('Release date is required')
    .isISO8601()
    .withMessage('Release date must be a valid ISO8601 date')
    .toDate(), // 📅 parsing string to real Date

  body('director')
    .trim()
    .escape() // 🛡️ protect
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
    .withMessage('Poster URL must be a valid URL'), // validate URL (not escape)
];

export default validateCreateMovie;
