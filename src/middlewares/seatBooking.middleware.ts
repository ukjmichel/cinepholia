import { Request, Response, NextFunction } from 'express';
import { SeatBookingService } from '../services/seatBooking.service';
import { MovieHallService } from '../services/movieHall.service';
import { ScreeningService } from '../services/screening.service';

// Define extended request interface to include all our custom properties
interface ExtendedRequest extends Request {
  screening?: any;
  movieHall?: any;
  validatedSeats?: string[];
}

const movieHallService = new MovieHallService();
const screeningService = new ScreeningService();
const seatBookingService = new SeatBookingService();

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
 * Get seatIds from request in various formats
 * @param req Express request
 * @returns Array of seat IDs
 */
const getSeatIds = (req: Request): string[] => {
  if (req.body.seatId && Array.isArray(req.body.seatId)) {
    return req.body.seatId;
  }
  if (req.body.seatIds && Array.isArray(req.body.seatIds)) {
    return req.body.seatIds;
  }
  if (req.query.seatId) {
    return String(req.query.seatId).split(',');
  }
  if (req.params.seatId) {
    return [req.params.seatId];
  }
  return [];
};

/**
 * Middleware to check if seats exist in a movie hall's layout
 */
export const isValidSeat = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get screening info - either from previous middleware or by fetching it
    let screening = req.screening;
    if (!screening) {
      const screeningId = getScreeningId(req);
      if (!screeningId) {
        res.status(400).json({ message: 'Screening ID is required' });
        return;
      }

      screening = await screeningService.getScreeningById(screeningId);
      if (!screening) {
        res.status(404).json({
          message: 'Screening not found',
          screeningId,
        });
        return;
      }

      // Attach to request for later middleware
      req.screening = screening;
    }

    // Get movie hall using theaterId and hallId from screening
    const movieHall = await movieHallService.getMovieHall(
      screening.theaterId,
      screening.hallId
    );

    if (!movieHall) {
      res.status(404).json({
        message: 'Movie hall not found for this screening',
        theaterId: screening.theaterId,
        hallId: screening.hallId,
      });
      return;
    }

    // Get seatIds from request - support multiple formats
    const seatIds = getSeatIds(req);

    if (seatIds.length === 0) {
      res.status(400).json({ message: 'Seat ID(s) are required' });
      return;
    }

    // Create a set of valid seat IDs from the hall's layout
    const seatsLayout = movieHall.seatsLayout;
    const validSeats = new Set();

    for (let row = 0; row < seatsLayout.length; row++) {
      for (let col = 0; col < seatsLayout[row].length; col++) {
        // Assuming 0 or null/undefined represents a non-seat
        const seatValue = seatsLayout[row][col];
        if (seatValue && seatValue !== 0) {
          validSeats.add(seatValue.toString());
        }
      }
    }

    // Check each requested seat against the set of valid seats
    for (const seatId of seatIds) {
      if (!validSeats.has(seatId)) {
        res.status(400).json({
          message: 'Invalid seat ID',
          seatId: seatId,
          theaterId: screening.theaterId,
          hallId: screening.hallId,
          details: 'This seat does not exist in the movie hall layout',
        });
        return;
      }
    }

    // Add validated data to the request object for the next middleware
    req.validatedSeats = seatIds;
    req.movieHall = movieHall;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if seats are available (not already booked)
 */
export const isSeatAvailable = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get screeningId - try from previous middleware first, then from request
    let screeningId: string | undefined;

    if (req.screening) {
      screeningId = req.screening.id || req.screening.screeningId;
    }

    if (!screeningId) {
      screeningId = getScreeningId(req);
    }

    if (!screeningId) {
      res.status(400).json({ message: 'Screening ID is required' });
      return;
    }

    // Get seatIds - use helper function
    const seatIds = getSeatIds(req);

    // If no seatIds found, try to use previously validated seats
    const finalSeatIds =
      seatIds.length > 0 ? seatIds : req.validatedSeats || [];

    if (finalSeatIds.length === 0) {
      res.status(400).json({ message: 'Seat ID(s) are required' });
      return;
    }

    // Check each seat's availability
    for (const seatId of finalSeatIds) {
      const existingBooking =
        await seatBookingService.getSeatBookingByScreeningIdAndSeatId(
          screeningId,
          seatId
        );

      if (existingBooking) {
        res.status(409).json({
          message: 'Seat already booked',
          screeningId,
          seatId,
          details: 'This seat has already been booked for this screening',
        });
        return;
      }
    }

    // Set validated seats if not already set
    if (!req.validatedSeats) {
      req.validatedSeats = finalSeatIds;
    }

    next();
  } catch (error) {
    next(error);
  }
};
