// src/models/__tests__/movieTheater.model.test.ts
import { Sequelize } from 'sequelize-typescript';
import { MovieTheaterModel } from '../../models/movietheater.model';

describe('MovieTheaterModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:', // In-memory DB
      logging: false,
      models: [MovieTheaterModel],
    });

    await sequelize.sync({ force: true }); // Clean schema
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    // Clear all records before each test
    await MovieTheaterModel.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
    jest.clearAllMocks();
  });

  it('should create a movie theater with valid attributes', async () => {
    const theaterData = {
      theaterId: 'theater123',
      address: '123 Main St',
      postalCode: '12345',
      city: 'Sample City',
      phone: '123-456-7890',
      email: 'test@example.com',
    };

    const theater = await MovieTheaterModel.create(theaterData);

    expect(theater).toBeDefined();
    expect(theater.theaterId).toBe(theaterData.theaterId);
    expect(theater.address).toBe(theaterData.address);
    expect(theater.postalCode).toBe(theaterData.postalCode);
    expect(theater.city).toBe(theaterData.city);
    expect(theater.phone).toBe(theaterData.phone);
    expect(theater.email).toBe(theaterData.email);
  });

  it('should fail to create a movie theater without required fields', async () => {
    const invalidData = {
      theaterId: 'theater124',
      // Missing address, postalCode, city, phone, email
    };

    await expect(
      MovieTheaterModel.create(invalidData as any)
    ).rejects.toThrow();
  });

  it('should fail to create a movie theater with invalid email', async () => {
    const invalidEmailData = {
      theaterId: 'theater125',
      address: '456 Another St',
      postalCode: '67890',
      city: 'Another City',
      phone: '987-654-3210',
      email: 'invalid-email', // Bad email format
    };

    await expect(MovieTheaterModel.create(invalidEmailData)).rejects.toThrow();
  });

  it('should enforce unique theaterId constraint', async () => {
    const theaterData = {
      theaterId: 'theater126',
      address: '789 Another Ave',
      postalCode: '54321',
      city: 'City Name',
      phone: '555-555-5555',
      email: 'unique@example.com',
    };

    await MovieTheaterModel.create(theaterData);

    await expect(MovieTheaterModel.create(theaterData)).rejects.toThrow();
  });
});
