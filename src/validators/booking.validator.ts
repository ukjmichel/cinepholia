import { NextFunction, Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';

// Validate request body middleware
export const validateBookingRequest = [
  // screeningId validation
  body('screeningId')
    .exists()
    .withMessage('screeningId is required')
    .isString()
    .withMessage('screeningId must be a string')
    .isUUID()
    .withMessage('screeningId must be a valid UUID'),

  // bookingDate validation
  body('bookingDate')
    .exists()
    .withMessage('bookingDate is required')
    .isISO8601()
    .withMessage('bookingDate must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('bookingDate must be in the future');
      }
      return true;
    }),

  // seatsNumber validation
  body('seatsNumber')
    .exists()
    .withMessage('seatsNumber is required')
    .isInt({ min: 1 })
    .withMessage('seatsNumber must be a positive integer'),

  // seatId validation
  body('seatId')
    .exists()
    .withMessage('seatId is required')
    .isArray({ min: 1 })
    .withMessage('seatId array cannot be empty')
    .custom((value, { req }) => {
      if (value.length !== req.body.seatsNumber) {
        throw new Error('seatId array length must match seatsNumber');
      }
      return true;
    }),

  // Each seat ID in the array
  body('seatId.*').isString().withMessage('Each seat ID must be a string'),

  // Custom validation middleware that checks express-validator results
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation error',
        errors: errors.array(),
      });
      return;
    }
    next();
  },
];
