import { body, param } from 'express-validator';

// Only allow: letters, numbers, dash
const safeIdRegex = /^[A-Za-z0-9-]+$/;

// Validate path parameters
export const validateMovieHallParams = [
  param('theaterId')
    .trim()
    .notEmpty()
    .withMessage('theaterId is required')
    .custom((value) => {
      if (!safeIdRegex.test(value)) {
        throw new Error(
          'theaterId must contain only letters, numbers, and dashes'
        );
      }
      return true;
    }),

  param('hallId')
    .trim()
    .notEmpty()
    .withMessage('hallId is required')
    .custom((value) => {
      if (!safeIdRegex.test(value)) {
        throw new Error(
          'hallId must contain only letters, numbers, and dashes'
        );
      }
      return true;
    }),
];

// Validate body for creating a movie hall
export const validateCreateMovieHall = [
  body('theaterId')
    .exists()
    .withMessage('theaterId is required')
    .trim()
    .notEmpty()
    .withMessage('theaterId cannot be empty')
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error('theaterId must be a string');
      }
      if (!safeIdRegex.test(value)) {
        throw new Error(
          'theaterId must contain only letters, numbers, and dashes'
        );
      }
      return true;
    }),

  body('hallId')
    .exists()
    .withMessage('hallId is required')
    .trim()
    .notEmpty()
    .withMessage('hallId cannot be empty')
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error('hallId must be a string');
      }
      if (!safeIdRegex.test(value)) {
        throw new Error(
          'hallId must contain only letters, numbers, and dashes'
        );
      }
      return true;
    }),

  body('seatsLayout')
    .exists()
    .withMessage('seatsLayout is required')
    .isArray({ min: 1 })
    .withMessage('seatsLayout must be a non-empty array')
    .custom((layout) => {
      if (!Array.isArray(layout)) {
        throw new Error('seatsLayout must be a 2D array');
      }
      const valid = layout.every(
        (row) =>
          Array.isArray(row) &&
          row.every(
            (seat) =>
              typeof seat === 'number' ||
              (typeof seat === 'string' && /^[\w-]+$/.test(seat))
          )
      );
      if (!valid) {
        throw new Error(
          'seatsLayout must be a 2D array of numbers or safe strings'
        );
      }
      return true;
    }),
];

// Validate body for updating seats layout
export const validateUpdateSeatsLayout = [
  ...validateMovieHallParams,
  body('seatsLayout')
    .exists()
    .withMessage('seatsLayout is required')
    .isArray({ min: 1 })
    .withMessage('seatsLayout must be a non-empty array')
    .custom((layout) => {
      if (!Array.isArray(layout)) {
        throw new Error('seatsLayout must be a 2D array');
      }
      const valid = layout.every(
        (row) =>
          Array.isArray(row) &&
          row.every(
            (seat) =>
              typeof seat === 'number' ||
              (typeof seat === 'string' && /^[\w-]+$/.test(seat))
          )
      );
      if (!valid) {
        throw new Error(
          'seatsLayout must be a 2D array of numbers or safe strings'
        );
      }
      return true;
    }),
];
