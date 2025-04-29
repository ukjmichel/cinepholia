// validators/userValidator.ts
import { body } from 'express-validator';

export const validateCreateUser = [
  body('email').isEmail().withMessage('Email must be valid'),

  body('username')
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage(
      'Username must contain only letters and numbers (no spaces or special characters)'
    )
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),

  body('password')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/
    )
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces'
    ),
];

export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail() // stop if empty
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .bail() // stop if empty
    .custom((value) => {
      if (/\s/.test(value)) {
        throw new Error('Password must not contain spaces');
      }
      return true;
    }),
];
