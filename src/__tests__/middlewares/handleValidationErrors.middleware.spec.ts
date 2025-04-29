import { Request, Response, NextFunction } from 'express';
import handleValidationErrors from '../../middlewares/handleValidationErrors.middleware';
import { validationResult } from 'express-validator';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

describe('handleValidationErrors middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    (validationResult as unknown as jest.Mock).mockClear();
    (mockRes.status as jest.Mock).mockClear();
    (mockRes.json as jest.Mock).mockClear();
    mockNext.mockClear();
  });

  it('should call next() if there are no validation errors', () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => true,
    });

    handleValidationErrors(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should return 400 with errors if validation errors exist', () => {
    (validationResult as unknown as jest.Mock).mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Invalid field', param: 'email', location: 'body' }],
    });

    handleValidationErrors(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction
    );

    expect(validationResult).toHaveBeenCalledWith(mockReq);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: [{ msg: 'Invalid field', param: 'email', location: 'body' }],
    });
  });
});
