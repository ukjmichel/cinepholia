import { Request, Response } from 'express';
import { validateBookingRequest } from '../../validators/booking.validator';

// Express validator error type
interface ValidationError {
  param: string;
  msg: string;
  location: string;
  value?: any;
}

describe('Booking Validator', () => {
  // Create helper for testing validators
  const testValidation = async (
    body: any,
    expectedStatus: number,
    expectedErrorMsg?: string
  ): Promise<void> => {
    // Create mock request
    const req = { body } as Request;

    // Create mock response with proper typing for Jest mocks
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn().mockReturnThis();

    const res = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response;

    // Create mock next function
    const next = jest.fn();

    // Run all validator middleware functions
    let stopExecution = false;

    for (const validatorFn of validateBookingRequest) {
      if (stopExecution) break;

      await new Promise<void>((resolve) => {
        // Create a custom next function that resolves the promise
        const nextWrapper = (): void => {
          next();
          resolve();
        };

        // Run the validator
        validatorFn(req, res, nextWrapper);

        // If status was called, stop execution and resolve
        if ((mockStatus as jest.Mock).mock.calls.length > 0) {
          stopExecution = true;
          resolve();
        }
      });
    }

    if (expectedStatus === 200) {
      // Validation should have passed
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
    } else {
      // Validation should have failed
      expect(mockStatus).toHaveBeenCalledWith(expectedStatus);

      if (expectedErrorMsg) {
        expect(mockJson).toHaveBeenCalled();

        // Get the JSON response
        const jsonResponse = (mockJson as jest.Mock).mock.calls[0][0];
        expect(jsonResponse).toBeDefined();
        expect(jsonResponse.message).toBe('Validation error');

        if (jsonResponse.errors && Array.isArray(jsonResponse.errors)) {
          // Check if any error message includes the expected text
          const errorMessages = jsonResponse.errors.map(
            (e: ValidationError) => e.msg
          );

          const errorFound = errorMessages.some(
            (msg: string) => msg === expectedErrorMsg
          );
          expect(errorFound).toBe(true);
        }
      }
    }
  };

  it('should pass validation with valid data', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 2,
        seatId: ['A1', 'A2'],
      },
      200
    );
  });

  it('should return 400 for invalid UUID', async () => {
    await testValidation(
      {
        screeningId: 'invalid-uuid',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 1,
        seatId: ['A1'],
      },
      400,
      'screeningId must be a valid UUID'
    );
  });

  it('should return 400 for booking date in the past', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() - 3600000).toISOString(),
        seatsNumber: 1,
        seatId: ['A1'],
      },
      400,
      'bookingDate must be in the future'
    );
  });

  it('should return 400 for missing screeningId', async () => {
    await testValidation(
      {
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 1,
        seatId: ['A1'],
      },
      400,
      'screeningId is required'
    );
  });

  it('should return 400 for missing bookingDate', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        seatsNumber: 1,
        seatId: ['A1'],
      },
      400,
      'bookingDate is required'
    );
  });

  it('should return 400 for invalid bookingDate format', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: 'not-a-date',
        seatsNumber: 1,
        seatId: ['A1'],
      },
      400,
      'bookingDate must be a valid date'
    );
  });

  it('should return 400 for missing seatsNumber', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatId: ['A1'],
      },
      400,
      'seatsNumber is required'
    );
  });

  it('should return 400 for invalid seatsNumber', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 0,
        seatId: ['A1'],
      },
      400,
      'seatsNumber must be a positive integer'
    );
  });

  it('should return 400 for missing seatId', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 1,
      },
      400,
      'seatId is required'
    );
  });

  it('should return 400 for empty seatId array', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 1,
        seatId: [],
      },
      400,
      'seatId array cannot be empty'
    );
  });

  it('should return 400 when seatId array length does not match seatsNumber', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 2,
        seatId: ['A1'],
      },
      400,
      'seatId array length must match seatsNumber'
    );
  });

  it('should return 400 for non-string seat IDs', async () => {
    await testValidation(
      {
        screeningId: '123e4567-e89b-12d3-a456-426614174000',
        bookingDate: new Date(Date.now() + 3600000).toISOString(),
        seatsNumber: 1,
        seatId: [123], // Number instead of string
      },
      400,
      'Each seat ID must be a string'
    );
  });
});
