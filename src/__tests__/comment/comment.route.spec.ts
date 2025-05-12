import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { UserPayload } from '../../interfaces/user.interface';

// ✅ Mock controller handlers
const mockHandleCreateComment = jest.fn((req: Request, res: Response) =>
  res.status(201).json({
    id: 'comment-uuid',
    bookingId: req.body.bookingId,
    comment: req.body.comment,
    rating: req.body.rating,
    status: 'pending',
  })
);

const mockHandleGetCommentByBooking = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    id: 'comment-uuid',
    bookingId: req.params.bookingId,
    comment: 'Great experience!',
    rating: 5,
    status: 'pending',
  })
);

const mockHandleConfirmComment = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    id: req.params.id,
    status: 'confirmed',
  })
);

const mockHandleDeleteComment = jest.fn((req: Request, res: Response) =>
  res.status(200).json({
    id: req.params.id,
    message: 'Comment deleted',
  })
);

const mockHandleListComments = jest.fn((req: Request, res: Response) =>
  res.status(200).json([
    {
      id: 'comment-uuid',
      bookingId: 'booking-uuid',
      comment: 'Great experience!',
      rating: 5,
      status: 'pending',
    },
  ])
);

const mockHandleGetCommentsByMovieId = jest.fn((req: Request, res: Response) =>
  res.status(200).json([
    {
      id: 'comment-uuid',
      bookingId: 'booking-uuid',
      comment: 'Great experience!',
      rating: 5,
      status: req.params.status || 'pending',
    },
  ])
);

// ✅ Mock controller module with factory method
jest.mock('../../controllers/comment.controller', () => ({
  handleCreateComment: mockHandleCreateComment,
  handleGetCommentByBooking: mockHandleGetCommentByBooking,
  handleConfirmComment: mockHandleConfirmComment,
  handleDeleteComment: mockHandleDeleteComment,
  handleListComments: mockHandleListComments,
  handleGetCommentsByMovieId: (status: string) =>
    mockHandleGetCommentsByMovieId,
}));

// ✅ Mock express-validator middlewares to skip validation
jest.mock('../../validators/comment.validator', () => ({
  validateCreateComment: (req: Request, res: Response, next: NextFunction) =>
    next(),
  validateBookingIdParam: (req: Request, res: Response, next: NextFunction) =>
    next(),
  validateCommentIdParam: (req: Request, res: Response, next: NextFunction) =>
    next(),
  validateStatusQuery: (req: Request, res: Response, next: NextFunction) =>
    next(),
  validateMovieIdParam: (req: Request, res: Response, next: NextFunction) =>
    next(),
}));

jest.mock(
  '../../middlewares/handleValidationErrors.middleware',
  () => (req: Request, res: Response, next: NextFunction) => next()
);

// ✅ Mock auth middleware
jest.mock('../../middlewares/auth.middleware', () => ({
  authenticateJwt: (req: Request, res: Response, next: NextFunction) => {
    req.user = {
      id: 'user-id',
      email: 'test@example.com',
    } as UserPayload;
    next();
  },
}));

// ✅ Mock authorization middleware
jest.mock('../../middlewares/authorization.middleware', () => ({
  Permission: {
    isNotStaff: () => (req: Request, res: Response, next: NextFunction) =>
      next(),
    isBookingOwnerOrStaff:
      () => (req: Request, res: Response, next: NextFunction) =>
        next(),
    authorize: () => (req: Request, res: Response, next: NextFunction) =>
      next(),
  },
}));

import commentRouter from '../../routes/comment.route';

describe('Comment Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/comments', commentRouter);
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      res
        .status(err.statusCode || 500)
        .json({ message: err.message || 'Internal Server Error' });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/comments - should create a comment', async () => {
    const res = await request(app).post('/api/comments').send({
      bookingId: 'booking-uuid',
      comment: 'Great experience!',
      rating: 5,
    });

    expect(res.status).toBe(201);
    expect(res.body.bookingId).toBe('booking-uuid');
    expect(mockHandleCreateComment).toHaveBeenCalled();
  });

  it('GET /api/comments/:bookingId - should return comment by booking', async () => {
    const res = await request(app).get('/api/comments/booking-uuid');

    expect(res.status).toBe(200);
    expect(res.body.bookingId).toBe('booking-uuid');
    expect(mockHandleGetCommentByBooking).toHaveBeenCalled();
  });

  it('PATCH /api/comments/:id/confirm - should confirm a comment', async () => {
    const res = await request(app).patch('/api/comments/comment-uuid/confirm');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
    expect(mockHandleConfirmComment).toHaveBeenCalled();
  });

  it('DELETE /api/comments/:id - should delete a comment', async () => {
    const res = await request(app).delete('/api/comments/comment-uuid');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Comment deleted');
    expect(mockHandleDeleteComment).toHaveBeenCalled();
  });

  it('GET /api/comments - should list all comments', async () => {
    const res = await request(app).get('/api/comments');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleListComments).toHaveBeenCalled();
  });

  it('GET /api/comments?status=pending - should list pending comments', async () => {
    const res = await request(app).get('/api/comments?status=pending');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleListComments).toHaveBeenCalled();
  });

  // ✅ New tests for movieId + status route

  it('GET /api/comments/movie/:movieId/pending - should return pending comments', async () => {
    const res = await request(app).get(
      '/api/comments/movie/movie-uuid/pending'
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleGetCommentsByMovieId).toHaveBeenCalled();
  });

  it('GET /api/comments/movie/:movieId/confirmed - should return confirmed comments', async () => {
    const res = await request(app).get(
      '/api/comments/movie/movie-uuid/confirmed'
    );

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleGetCommentsByMovieId).toHaveBeenCalled();
  });

  it('GET /api/comments/movie/:movieId/all - should return all comments', async () => {
    const res = await request(app).get('/api/comments/movie/movie-uuid/all');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockHandleGetCommentsByMovieId).toHaveBeenCalled();
  });
});
