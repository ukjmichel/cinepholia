import { body, param } from 'express-validator';

/**
 * Validator for creating a movie hall
 */
export const validateCreateMovieHall = [
  body('theaterId')
    .notEmpty()
    .withMessage('Theater ID is required')
    .isString()
    .withMessage('Theater ID must be a string')
    .matches(/^[\w\- ]+$/)
    .withMessage('Theater ID must be alphanumeric, dashes or spaces'),

  body('hallId')
    .notEmpty()
    .withMessage('Hall ID is required')
    .isString()
    .withMessage('Hall ID must be a string')
    .matches(/^[\w\- ]+$/)
    .withMessage('Hall ID must be alphanumeric, dashes or spaces'),

  body('seatsLayout')
    .isArray({ min: 1 })
    .withMessage('Seats layout must be a non-empty array')
    .custom((layout) => {
      if (!Array.isArray(layout)) return false;
      for (const row of layout) {
        if (!Array.isArray(row)) return false;
        for (const seat of row) {
          if (
            typeof seat !== 'string' ||
            seat.trim() === '' ||
            seat.length > 10
          ) {
            return false;
          }
        }
      }
      return true;
    })
    .withMessage(
      'Seats layout must be a 2D array of non-empty strings (numbers as strings, "x" for empty seats)'
    ),
];

/**
 * Validator for movie hall params
 */
export const validateMovieHallParams = [
  param('theaterId')
    .notEmpty()
    .withMessage('Theater ID is required')
    .isString()
    .withMessage('Theater ID must be a string')
    .matches(/^[\w\- ]+$/)
    .withMessage('Theater ID must be alphanumeric, dashes or spaces'),

  param('hallId')
    .notEmpty()
    .withMessage('Hall ID is required')
    .isString()
    .withMessage('Hall ID must be a string')
    .matches(/^[\w\- ]+$/)
    .withMessage('Hall ID must be alphanumeric, dashes or spaces'),
];

/**
 * Validator for updating seats layout
 */
export const validateUpdateSeatsLayout = [
  ...validateMovieHallParams,
  body('seatsLayout')
    .isArray({ min: 1 })
    .withMessage('Seats layout must be a non-empty array')
    .custom((layout) => {
      if (!Array.isArray(layout)) return false;
      for (const row of layout) {
        if (!Array.isArray(row)) return false;
        for (const seat of row) {
          if (typeof seat !== 'string') {
            return false;
          }
          if (seat.trim() === '') {
            return false;
          }
          if (seat.length > 10) {
            return false;
          }
        }
      }
      return true;
    })
    .withMessage(
      'Seats layout must be a 2D array of non-empty strings (numbers as strings, "x" for empty seats)'
    ),
];
