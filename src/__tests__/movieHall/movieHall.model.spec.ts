import { Sequelize } from 'sequelize-typescript';
import { MovieHallModel } from '../../models/movieHall.model';

describe('MovieHallModel', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [MovieHallModel],
    });

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a movie hall with valid attributes', async () => {
    const hallData = {
      theaterId: 'theater123',
      hallId: 'hall456',
      seatsLayout: [
        [1, 2, 3, 4, '', 5, 6, 7],
        [8, 9, 10, 11, '', 12, 13, 14],
      ],
    };

    const movieHall = await MovieHallModel.create(hallData);

    expect(movieHall).toBeDefined();
    expect(movieHall.theaterId).toBe(hallData.theaterId);
    expect(movieHall.hallId).toBe(hallData.hallId);
    expect(movieHall.seatsLayout).toEqual(hallData.seatsLayout);
  });

  it('should not allow creating a movie hall without a theaterId', async () => {
    const invalidData = {
      hallId: 'hall456',
      seatsLayout: [[1, 2, 3, 4]],
    };

    await expect(MovieHallModel.create(invalidData as any)).rejects.toThrow();
  });

  it('should not allow creating a movie hall without a hallId', async () => {
    const invalidData = {
      theaterId: 'theater123',
      seatsLayout: [[1, 2, 3, 4]],
    };

    await expect(MovieHallModel.create(invalidData as any)).rejects.toThrow();
  });

  it('should not allow creating a movie hall without seatsLayout', async () => {
    const invalidData = {
      theaterId: 'theater123',
      hallId: 'hall456',
    };

    await expect(MovieHallModel.create(invalidData as any)).rejects.toThrow();
  });

  it('should retrieve the correct movie hall', async () => {
    const hallData = {
      theaterId: 'theater789',
      hallId: 'hall101',
      seatsLayout: [
        [1, '', 2, 3],
        [4, 5, '', 6],
      ],
    };

    await MovieHallModel.create(hallData);

    const foundHall = await MovieHallModel.findOne({
      where: { theaterId: 'theater789', hallId: 'hall101' },
    });

    expect(foundHall).toBeDefined();
    expect(foundHall?.theaterId).toBe('theater789');
    expect(foundHall?.hallId).toBe('hall101');
    expect(foundHall?.seatsLayout).toEqual(hallData.seatsLayout);
  });
});
