import { body, param, query } from 'express-validator';

export const validateCreateUser = [
  body('email').isEmail().withMessage('Email must be valid').normalizeEmail(),

  body('username')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage(
      'Username must only contain letters, numbers, hyphens or underscores'
    )
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),

  body('password')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/
    )
    .withMessage(
      'Password must include uppercase, lowercase, number, special character, and no spaces'
    ),
];

export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail()
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error('Password must not contain spaces');
      }
      return true;
    }),
];

export const validateUpdateUser = [
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Email must be valid')
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),

  body('name')
    .optional({ checkFalsy: true })
    .matches(/^[A-Za-z0-9\s_-]+$/)
    .withMessage(
      'Name must contain only letters, numbers, spaces, hyphens or underscores'
    )
    .isLength({ min: 3, max: 30 })
    .withMessage('Name must be between 3 and 30 characters'),
];

export const validatePassword = [
  body('password')
    .optional({ checkFalsy: true })
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/
    )
    .withMessage(
      'Password must include uppercase, lowercase, number, special character, and no spaces'
    )
    .isLength({ max: 100 })
    .withMessage('Password must be less than 100 characters'),
];

export const validatePublicSearch = [
  query('searchTerm')
    .notEmpty()
    .withMessage('Search term is required')
    .isString()
    .withMessage('Search term must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative number'),
];

/**
 * Validate :id param in routes
 */
export const validatePublicIdParam = [
  param('id')
    .notEmpty()
    .withMessage('ID parameter is required')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
];
