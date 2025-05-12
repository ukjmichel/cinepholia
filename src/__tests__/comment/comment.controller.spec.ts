import { Request, Response, NextFunction } from 'express';
import {
  handleCreateComment,
  handleGetCommentByBooking,
  handleListComments,
  handleConfirmComment,
  handleDeleteComment,
} from '../../controllers/comment.controller';
import { CommentService } from '../../services/comment.service';
import { CommentDocument } from '../../models/comment.model';
import mongoose from 'mongoose';

jest.mock('../../services/comment.service');


const mockComment = {
  id: new mongoose.Types.ObjectId(),
  bookingId: 'booking-uuid',
  comment: 'Mock comment',
  rating: 5,
  status: 'pending',
  toJSON: () => ({
    _id: 'mock-id',
    bookingId: 'booking-uuid',
    comment: 'Mock comment',
    rating: 5,
    status: 'pending',
  }),
};
  
  
  



describe('Comment Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(function (this: any) {
      return this;
    });
    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('handleCreateComment', () => {
    it('should create a comment successfully', async () => {
      (CommentService.prototype.createComment as jest.Mock).mockResolvedValue(
        mockComment
      );
      req.body = {
        bookingId: 'booking123',
        comment: 'Amazing movie!',
        rating: 5,
      };

      await handleCreateComment(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockComment);
    });

    it('should call next with error', async () => {
      const error = new Error('Failed to create');
      (CommentService.prototype.createComment as jest.Mock).mockRejectedValue(
        error
      );
      req.body = {
        bookingId: 'booking123',
        comment: 'Amazing movie!',
        rating: 5,
      };

      await handleCreateComment(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleGetCommentByBooking', () => {
    it('should return a comment by bookingId', async () => {
      (
        CommentService.prototype.getCommentByBooking as jest.Mock
      ).mockResolvedValue(mockComment);
      req.params = { bookingId: 'booking123' };

      await handleGetCommentByBooking(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockComment);
    });

    it('should call next if comment not found', async () => {
      const error = new Error('Not found');
      (
        CommentService.prototype.getCommentByBooking as jest.Mock
      ).mockRejectedValue(error);
      req.params = { bookingId: 'booking123' };

      await handleGetCommentByBooking(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('handleConfirmComment', () => {
    it('should confirm a comment successfully', async () => {
      (CommentService.prototype.confirmComment as jest.Mock).mockResolvedValue({
        ...mockComment,
        status: 'confirmed',
      });
      req.params = { id: 'abc123' };

      await handleConfirmComment(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        ...mockComment,
        status: 'confirmed',
      });
    });
  });

  describe('handleDeleteComment', () => {
    it('should delete a comment successfully', async () => {
      (CommentService.prototype.deleteComment as jest.Mock).mockResolvedValue(
        mockComment
      );
      req.params = { id: 'abc123' };

      await handleDeleteComment(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockComment);
    });
  });

  describe('handleListComments', () => {
    it('should list all comments', async () => {
      // Since CommentService.listComments is a static method, mock it directly
      // Make sure to use the correct way to mock static methods
      const mockStatic = jest.fn().mockResolvedValue([mockComment]);
      CommentService.listComments = mockStatic;

      req.query = {}; // Add query params if needed for your test

      await handleListComments(req as Request, res as Response, next);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([mockComment]);
    });
  });
});
