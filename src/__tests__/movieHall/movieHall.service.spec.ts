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
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    await MovieHallModel.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a new movie hall', async () => {
    const data = {
      theaterId: 'theater1',
      hallId: 'hallA',
      seatsLayout: [[1, 2, 3, '', 4, 5]],
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
      hallId: 'hallB',
      seatsLayout: [[1, '', 2, 3]],
    };

    await movieHallService.createMovieHall(data);

    const found = await movieHallService.getMovieHall('theater2', 'hallB');

    expect(found).toBeDefined();
    expect(found?.theaterId).toBe('theater2');
    expect(found?.hallId).toBe('hallB');
  });

  it('should retrieve all movie halls', async () => {
    await movieHallService.createMovieHall({
      theaterId: 'theater3',
      hallId: 'hallC',
      seatsLayout: [[1, 2, 3]],
    });

    await movieHallService.createMovieHall({
      theaterId: 'theater4',
      hallId: 'hallD',
      seatsLayout: [[4, 5, 6]],
    });

    const halls = await movieHallService.getAllMovieHalls();
    expect(halls.length).toBe(2);
  });

  it('should update the seats layout of a movie hall', async () => {
    const initialData = {
      theaterId: 'theater5',
      hallId: 'hallE',
      seatsLayout: [[1, 2, 3]],
    };

    await movieHallService.createMovieHall(initialData);

    const updatedLayout = [[7, 8, 9, '', 10]];
    const updatedHall = await movieHallService.updateSeatsLayout(
      'theater5',
      'hallE',
      updatedLayout
    );

    expect(updatedHall).toBeDefined();
    expect(updatedHall?.seatsLayout).toEqual(updatedLayout);
  });

  it('should return null when updating a non-existing movie hall', async () => {
    const updated = await movieHallService.updateSeatsLayout(
      'fakeTheater',
      'fakeHall',
      [[1, 2]]
    );
    expect(updated).toBeNull();
  });

  it('should delete a movie hall by theaterId and hallId', async () => {
    await movieHallService.createMovieHall({
      theaterId: 'theater6',
      hallId: 'hallF',
      seatsLayout: [[1, 2, 3]],
    });

    const deleted = await movieHallService.deleteMovieHall('theater6', 'hallF');

    expect(deleted).toBe(true);

    const found = await movieHallService.getMovieHall('theater6', 'hallF');
    expect(found).toBeNull();
  });

  it('should return false when deleting a non-existing movie hall', async () => {
    const deleted = await movieHallService.deleteMovieHall(
      'unknownTheater',
      'unknownHall'
    );
    expect(deleted).toBe(false);
  });
});
