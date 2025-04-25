import { authenticate } from '../../middlewares/auth.middleware';
import * as authService from '../../services/auth.service';
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../../interfaces/user.interface';

describe('authenticate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    req = { headers: {} };
    res = {
      status: statusMock,
      json: jsonMock,
    };
    next = jest.fn();
  });

  it('should return 401 if Authorization header is missing', () => {
    authenticate(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Missing or invalid Authorization header.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is malformed', () => {
    req.headers = { authorization: 'Token something' };

    authenticate(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Missing or invalid Authorization header.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    req.headers = { authorization: 'Bearer invalid.token' };
    jest.spyOn(authService, 'verifyToken').mockReturnValue(null);

    authenticate(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Invalid or expired token.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() and set req.user if token is valid', () => {
    req.headers = { authorization: 'Bearer valid.token' };

    const decodedUser: UserPayload = {
      id: 'uuid-123',
      name: 'John Doe',
      email: 'john@example.com',
    };

    jest.spyOn(authService, 'verifyToken').mockReturnValue(decodedUser);

    authenticate(req as Request, res as Response, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });
});
