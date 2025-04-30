import { Request, Response, NextFunction } from 'express';
import { isScreeningExist } from '../../middlewares/screening.middleware';
import { ScreeningService } from '../../services/screening.service';
import { ScreeningModel } from '../../models/screening.model';

jest.mock('../../services/screening.service');

describe('isScreeningExist middleware', () => {
  let req: Partial<Request> & { screening?: any };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  const mockScreening = {
    screeningId: 'screening123',
    movieId: 'movie123',
    theaterId: 'theater123',
    hallId: 'hall123',
    startTime: new Date(),
    durationTime: new Date(),
    movie: {} as any,
    theater: {} as any,
    hall: {} as any,
  } as unknown as ScreeningModel;

  it('should return 400 if screeningId is missing', async () => {
    req.body = {};
    req.params = {};
    req.query = {};

    await isScreeningExist(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Screening ID is required',
      details:
        'Please provide a screeningId in the request body, params, or query',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 if screening not found', async () => {
    req.body = { screeningId: 'missing-id' };

    const mockService =
      ScreeningService.prototype as jest.Mocked<ScreeningService>;
    mockService.getScreeningById.mockResolvedValueOnce(null);

    await isScreeningExist(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No screening with this ID found',
      screeningId: 'missing-id',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach screening to req and call next if found', async () => {
    req.body = { screeningId: 'screening123' };

    const mockService =
      ScreeningService.prototype as jest.Mocked<ScreeningService>;
    mockService.getScreeningById.mockResolvedValueOnce(mockScreening);

    await isScreeningExist(req as Request, res as Response, next);

    expect(req.screening).toEqual(mockScreening);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next with error if thrown', async () => {
    const error = new Error('Database error');
    req.body = { screeningId: 'screening123' };

    const mockService =
      ScreeningService.prototype as jest.Mocked<ScreeningService>;
    mockService.getScreeningById.mockRejectedValueOnce(error);

    await isScreeningExist(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
