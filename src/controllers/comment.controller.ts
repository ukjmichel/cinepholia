import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';

const service = new CommentService();

export const handleCreateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { bookingId, comment, rating } = req.body;
    const created = await service.createComment({ bookingId, comment, rating });
    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const handleGetCommentByBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { bookingId } = req.params;
    const comment = await service.getCommentByBooking(bookingId);
    return res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const handleListComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { status } = req.query;
    const comments = await CommentService.listComments(
      status as 'pending' | 'confirmed'
    );
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const handleConfirmComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const updated = await service.confirmComment(id);
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const handleDeleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const deleted = await service.deleteComment(id);
    return res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};

export const handleGetCommentsByMovieId =
  (status: 'pending' | 'confirmed' | 'all') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { movieId } = req.params;

      const comments = await service.getCommentsByMovieId(movieId, status);

      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  };
