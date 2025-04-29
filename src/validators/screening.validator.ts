import { Router } from 'express';
import { param, query } from 'express-validator';

export const screeningRouter = Router();

// --- Validation Middlewares using express-validator ---

// Validate and sanitize screeningId in URL params
export const validateScreeningIdParam = [
  param('screeningId')
    .trim()
    .notEmpty()
    .withMessage('screeningId is required')
    .isUUID()
    .withMessage('screeningId must be a valid UUID'),
];

// Validate and sanitize search query params
export const validateScreeningSearchQuery = [
  query('theaterId')
    .trim()
    .notEmpty()
    .withMessage('theaterId is required')
    .isUUID()
    .withMessage('theaterId must be a valid UUID'),
  query('movieId')
    .trim()
    .notEmpty()
    .withMessage('movieId is required')
    .isUUID()
    .withMessage('movieId must be a valid UUID'),
];
