// src/app.ts
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { sequelize } from './config/db';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import movieTheaterRouter from './routes/movieTheater.routes';
import movieHallRouter from './routes/movieHall.routes';
import movieRouter from './routes/movie.routes';
import screeningRouter from './routes/screening.routes';
import bookingRouter from './routes/booking.routes';
import seatBookingRouter from './routes/seatBooking.routes';
import emailRouter from './routes/email.route';
import commentRouter from './routes/comment.route';

const app = express();

// ─────── Middleware ─────────────────────────────────────────
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// ─────── Swagger Setup ──────────────────────────────────────
setupSwagger(app);

// ─────── Health Check Endpoint ──────────────────────────────
app.get('/health/db', async (req: Request, res: Response): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    res.status(500).json({
      status: 'error',
      message: 'MONGODB_URI is not defined in environment variables',
    });
    return;
  }

  const results = await Promise.allSettled([
    sequelize.authenticate(),
    mongoose.connection.readyState === 1
      ? Promise.resolve() // Already connected
      : mongoose.connect(mongoUri),
  ]);

  const mysqlStatus = results[0].status === 'fulfilled' ? 'ok' : 'error';
  const mongoStatus = results[1].status === 'fulfilled' ? 'ok' : 'error';

  const overallStatus =
    mysqlStatus === 'ok' && mongoStatus === 'ok' ? 'ok' : 'error';

  res.status(overallStatus === 'ok' ? 200 : 500).json({
    status: overallStatus,
    services: {
      mysql: mysqlStatus,
      mongodb: mongoStatus,
    },
    message:
      overallStatus === 'ok'
        ? 'Database connections are healthy'
        : 'One or more database connections failed',
  });
});

// ─────── Root Endpoint ──────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

// ─────── Main API Routes ─────────────────────────────────────
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/movie-theater', movieTheaterRouter);
app.use('/api/movie-hall', movieHallRouter);
app.use('/api/movie', movieRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/seat-bookings', seatBookingRouter);
app.use('/api/email', emailRouter);
app.use('/api/comment', commentRouter);

// ─────── Error Handling ──────────────────────────────────────
app.use(errorHandler);

export default app;
