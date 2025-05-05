import { body } from 'express-validator';

export const createMovieTheaterValidator = [
  body('theaterId').notEmpty().withMessage('theaterId is required').isString(),
  body('address').notEmpty().withMessage('address is required').isString(),
  body('postalCode')
    .notEmpty()
    .withMessage('postalCode is required')
    .isString(),
  body('city').notEmpty().withMessage('city is required').isString(),
  body('phone').notEmpty().withMessage('phone is required').isString(),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('email must be valid'),
];

export const updateMovieTheaterValidator = [
  body('address').optional().isString(),
  body('postalCode').optional().isString(),
  body('city').optional().isString(),
  body('phone').optional().isString(),
  body('email').optional().isEmail().withMessage('email must be valid'),
];
