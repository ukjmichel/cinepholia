import express from 'express';
import { setupSwagger } from './config/swagger';
import appRouter from './routes/app';

const app = express();
const port = 3000;

setupSwagger(app);

app.use('/', appRouter);

// Store the server instance so we can close it gracefully
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});


