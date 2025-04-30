import { UserInterface } from '../../interfaces/user.interface';

// This is the correct way to extend Express Request
declare global {
  namespace Express {
    // Extend the Request interface
    interface Request {
      user?: UserInterface;
      screening?: any;
      movieHall?: any;
      validatedSeats?: string[];
    }
  }
}

// This empty export is important
export {};
