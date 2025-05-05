import { Sequelize } from 'sequelize-typescript';
import { MovieHallModel } from '../../models/movieHall.model';
import { MovieHallService } from '../../services/movieHall.service';

describe('MovieHallService', () => {
  let sequelize: Sequelize;
  let movieHallService: MovieHallService;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      models: [MovieHallModel],
    });

    await sequelize.sync({ force: true });
    movieHallService = new MovieHallService();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a new movie hall', async () => {
    const data = {
      theaterId: 'theater1',
      hallId: 'hall1',
      seatsLayout: [[1, 2, 3]],
    };

    const movieHall = await movieHallService.createMovieHall(data);

    expect(movieHall).toBeDefined();
    expect(movieHall.theaterId).toBe(data.theaterId);
    expect(movieHall.hallId).toBe(data.hallId);
    expect(movieHall.seatsLayout).toEqual(data.seatsLayout);
  });

  it('should retrieve a movie hall by theaterId and hallId', async () => {
    const data = {
      theaterId: 'theater2',
      hallId: 'hall2',
      seatsLayout: [[1, 2]],
    };

    await movieHallService.createMovieHall(data);

    const movieHall = await movieHallService.getMovieHall('theater2', 'hall2');

    expect(movieHall).toBeDefined();
    expect(movieHall?.theaterId).toBe('theater2');
    expect(movieHall?.hallId).toBe('hall2');
  });

  it('should throw NotFoundError if movie hall is not found', async () => {
    await expect(
      movieHallService.getMovieHall('unknownTheater', 'unknownHall')
    ).rejects.toThrow(
      'Movie hall with theaterId unknownTheater and hallId unknownHall not found.'
    );
  });

  it('should retrieve all movie halls', async () => {
    await movieHallService.createMovieHall({
      theaterId: 'theater3',
      hallId: 'hall3',
      seatsLayout: [[1]],
    });

    await movieHallService.createMovieHall({
      theaterId: 'theater4',
      hallId: 'hall4',
      seatsLayout: [[2]],
    });

    const halls = await movieHallService.getAllMovieHalls();

    expect(Array.isArray(halls)).toBe(true);
    expect(halls.length).toBeGreaterThanOrEqual(2);
  });

  it('should update seats layout', async () => {
    await movieHallService.createMovieHall({
      theaterId: 'theater5',
      hallId: 'hall5',
      seatsLayout: [[1, 2]],
    });

    const updatedSeats = [[7, 8, 9]];
    const updatedHall = await movieHallService.updateSeatsLayout(
      'theater5',
      'hall5',
      updatedSeats
    );

    expect(updatedHall).toBeDefined();
    expect(updatedHall?.seatsLayout).toEqual(updatedSeats);
  });

  it('should throw NotFoundError when updating a non-existing hall', async () => {
    await expect(
      movieHallService.updateSeatsLayout('nonexistent', 'nonexistent', [[1]])
    ).rejects.toThrow(
      'Movie hall with theaterId nonexistent and hallId nonexistent not found.'
    );
  });

  it('should delete a movie hall', async () => {
    await movieHallService.createMovieHall({
      theaterId: 'theater6',
      hallId: 'hall6',
      seatsLayout: [[1]],
    });

    const deleted = await movieHallService.deleteMovieHall('theater6', 'hall6');

    expect(deleted).toBeUndefined(); // successful deletion, no return value

    await expect(
      movieHallService.getMovieHall('theater6', 'hall6')
    ).rejects.toThrow(
      'Movie hall with theaterId theater6 and hallId hall6 not found.'
    );
  });

  it('should throw NotFoundError when deleting a non-existing hall', async () => {
    await expect(
      movieHallService.deleteMovieHall('unknown', 'unknown')
    ).rejects.toThrow(
      'Movie hall with theaterId unknown and hallId unknown not found.'
    );
  });
});
