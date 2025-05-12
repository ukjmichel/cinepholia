import express, { Request, Response } from 'express';
import request from 'supertest';
import { validateBookingRequest } from '../../validators/booking.validator';

const app = express();
app.use(express.json());

app.post(
  '/test-booking',
  validateBookingRequest,
  (req: Request, res: Response) => {
    res.status(200).json({ message: 'Validation passed' });
  }
);

describe('validateBookingRequest', () => {
  it('should pass validation for valid input', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({
        screeningId: '11111111-1111-1111-1111-111111111111',
        seatsNumber: 2,
        seatIds: [
          '354bb419-57aa-4043-aed2-a93c651f329a',
          '91aceb3d-6fa4-4597-aa26-06d4ad2d234a',
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Validation passed');
  });

  it('should fail if screeningId is missing', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({
        seatsNumber: 2,
        seatIds: ['A1', 'A2'],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'screeningId', // <-- Changed from param to path
          msg: 'screeningId is required',
        }),
      ])
    );
  });

  it('should fail if seatsNumber is not a positive integer', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({
        screeningId: '11111111-1111-1111-1111-111111111111',
        seatsNumber: 0,
        seatIds: [
          '354bb419-57aa-4043-aed2-a93c651f329a',
          '91aceb3d-6fa4-4597-aa26-06d4ad2d234a',
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'seatsNumber' }),
        expect.objectContaining({
          msg: 'seatIds length must match seatsNumber',
        }),
      ])
    );
  });

  it('should fail if seatIds array is missing', async () => {
    const res = await request(app).post('/test-booking').send({
      screeningId: '11111111-1111-1111-1111-111111111111',
      seatsNumber: 2,
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'seatIds',
          msg: 'seatIds is required',
        }),
      ])
    );
  });

  it('should fail if seatIds length doesn’t match seatsNumber', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({
        screeningId: '11111111-1111-1111-1111-111111111111',
        seatsNumber: 3,
        seatIds: [
          '354bb419-57aa-4043-aed2-a93c651f329a',
          '91aceb3d-6fa4-4597-aa26-06d4ad2d234a',
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'seatIds length must match seatsNumber',
        }),
      ])
    );
  });

  it('should fail if a seatId is not a string or UUID', async () => {
    const res = await request(app)
      .post('/test-booking')
      .send({
        screeningId: '11111111-1111-1111-1111-111111111111',
        seatsNumber: 2,
        seatIds: ['354bb419-57aa-4043-aed2-a93c651f329a', 123],
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringMatching(/^seatIds\[\d+\]$/),
          msg: 'Each seat ID must be a string',
        }),
      ])
    );
  });
});
