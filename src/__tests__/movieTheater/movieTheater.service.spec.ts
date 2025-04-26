import { MovieTheaterService } from '../../services/movieTheater.service';
import { MovieTheaterModel } from '../../models/movietheater.model';

// Mock the MovieTheaterModel
jest.mock('../../models/movietheater.model', () => ({
  MovieTheaterModel: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const movieTheaterService = new MovieTheaterService();

describe('MovieTheaterService', () => {
  const mockMovieTheater = {
    theaterId: 'theater123',
    address: '123 Main St',
    postalCode: '12345',
    city: 'Sample City',
    phone: '123-456-7890',
    email: 'test@example.com',
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovieTheater', () => {
    it('should create a movie theater', async () => {
      (MovieTheaterModel.create as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      const result = await movieTheaterService.createMovieTheater(
        mockMovieTheater as any
      );

      expect(MovieTheaterModel.create).toHaveBeenCalledWith(mockMovieTheater);
      expect(result).toEqual(mockMovieTheater);
    });
  });

  describe('getMovieTheaterById', () => {
    it('should return a movie theater if found', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      const result = await movieTheaterService.getMovieTheaterById(
        'theater123'
      );

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('theater123');
      expect(result).toEqual(mockMovieTheater);
    });

    it('should return null if movie theater not found', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await movieTheaterService.getMovieTheaterById(
        'nonexistent'
      );

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getAllMovieTheaters', () => {
    it('should return all movie theaters', async () => {
      (MovieTheaterModel.findAll as jest.Mock).mockResolvedValue([
        mockMovieTheater,
      ]);

      const result = await movieTheaterService.getAllMovieTheaters();

      expect(MovieTheaterModel.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockMovieTheater]);
    });
  });

  describe('updateMovieTheater', () => {
    it('should update and return the movie theater', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(
        mockMovieTheater
      );

      const updateData = { city: 'New City' };
      const result = await movieTheaterService.updateMovieTheater(
        'theater123',
        updateData
      );

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('theater123');
      expect(mockMovieTheater.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual(mockMovieTheater);
    });

    it('should return null if movie theater not found', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await movieTheaterService.updateMovieTheater(
        'nonexistent',
        { city: 'New City' }
      );

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('deleteMovieTheater', () => {
    it('should return true if deletion was successful', async () => {
      (MovieTheaterModel.destroy as jest.Mock).mockResolvedValue(1);

      const result = await movieTheaterService.deleteMovieTheater('theater123');

      expect(MovieTheaterModel.destroy).toHaveBeenCalledWith({
        where: { theaterId: 'theater123' },
      });
      expect(result).toBe(true);
    });

    it('should return false if no movie theater was deleted', async () => {
      (MovieTheaterModel.destroy as jest.Mock).mockResolvedValue(0);

      const result = await movieTheaterService.deleteMovieTheater(
        'nonexistent'
      );

      expect(MovieTheaterModel.destroy).toHaveBeenCalledWith({
        where: { theaterId: 'nonexistent' },
      });
      expect(result).toBe(false);
    });
  });
});
