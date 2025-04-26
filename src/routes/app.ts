// src/server.ts
import express from 'express';
import { sequelize } from '../config/db';
import { setupSwagger } from '../config/swagger';
import userRouter from './user.routes';
import authRouter from './auth.routes';
import movieTheatherRouter from './movieTheater.routes';
import movieHallRouter from "./movieHall.routes"
import movieRouter from "./movie.routes"

const app = express();
const port = process.env.PORT || 3000;

setupSwagger(app);
app.use(express.json());

app.get('/health/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res
      .status(200)
      .json({ status: 'ok', message: 'Database connection is healthy' });
  } catch (error) {
    console.error('Database connection error:', error);
    res
      .status(500)
      .json({ status: 'error', message: 'Database connection failed', error });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

app.use('/api/users', userRouter);

app.use('/api/auth', authRouter);

app.use(
  '/api/movie-theater',
  movieTheatherRouter
);
app.use('/api/movie-hall', movieHallRouter);

app.use('/api/movie', movieRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
