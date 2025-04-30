import { Request, Response, NextFunction } from 'express';
import { ScreeningService } from '../services/screening.service';

// Define extended request interface
interface RequestWithScreening extends Request {
  screening?: any;
}

const screeningService = new ScreeningService();

/**
 * Get screeningId from request (body, params, query)
 * @param req Express request
 * @returns screeningId or undefined
 */
const getScreeningId = (req: Request): string | undefined => {
  return (
    req.body.screeningId ||
    req.params.screeningId ||
    req.query.screeningId?.toString()
  );
};

/**
 * Middleware to check if a screening exists
 * - Checks req.body.screeningId, req.params.screeningId, or req.query.screeningId
 * - Adds the screening to req.screening if found
 */
export const isScreeningExist = async (
  req: RequestWithScreening,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get screeningId from multiple possible sources
    const screeningId = getScreeningId(req);

    if (!screeningId) {
      res.status(400).json({
        message: 'Screening ID is required',
        details:
          'Please provide a screeningId in the request body, params, or query',
      });
      return;
    }

    const screening = await screeningService.getScreeningById(screeningId);

    if (!screening) {
      res.status(404).json({
        message: 'No screening with this ID found',
        screeningId,
      });
      return;
    }

    // Add screening to request for use in later middleware or controllers
    req.screening = screening;

    next();
  } catch (error) {
    next(error);
  }
};
