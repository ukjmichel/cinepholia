import { Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware to validate the incoming booking creation request.
 */
export const validateBookingRequest: RequestHandler[] = [
  // Validate screeningId
  body('screeningId')
    .exists({ checkNull: true })
    .withMessage('screeningId is required')
    .bail()
    .isUUID()
    .withMessage('screeningId must be a valid UUID'),

  // Validate seatsNumber
  body('seatsNumber')
    .exists({ checkNull: true })
    .withMessage('seatsNumber is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('seatsNumber must be a positive integer'),

  // Validate seatIds
  body('seatIds')
    .exists({ checkNull: true })
    .withMessage('seatIds is required')
    .bail()
    .isArray({ min: 1 })
    .withMessage('seatIds must be a non-empty array')
    .bail()
    .custom((value, { req }) => {
      if (!Array.isArray(value)) throw new Error('seatIds must be an array');
      if (value.length !== req.body.seatsNumber) {
        throw new Error('seatIds length must match seatsNumber');
      }
      return true;
    }),

  // Validate each seatId in the array
  body('seatIds.*')
    .isString()
    .withMessage('Each seat ID must be a string')
    .bail()
    .isUUID()
    .withMessage('Each seat ID must be a valid UUID'),

  // Handle validation result
  (req: Request, res: Response, next: NextFunction): void => {
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
