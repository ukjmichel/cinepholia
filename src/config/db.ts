import { Sequelize } from 'sequelize-typescript'; // Use sequelize-typescript
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model'; // Import your models
import { AuthorizationModel } from '../models/authorization.model';

dotenv.config(); // Load environment variables

// Initialize Sequelize with sequelize-typescript
export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  models: [UserModel,AuthorizationModel], // Register all models here
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Ensure the models are synchronized
sequelize
  .sync()
  .then(() => console.log('Database synced!'))
  .catch((err) => console.error('Error syncing database:', err));
