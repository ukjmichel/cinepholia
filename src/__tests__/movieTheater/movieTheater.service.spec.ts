import { MovieTheaterService } from '../../services/movieTheater.service';
import { MovieTheaterModel } from '../../models/movietheater.model';
import { NotFoundError } from '../../errors/NotFoundError';

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

      const result =
        await movieTheaterService.getMovieTheaterById('theater123');

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('theater123');
      expect(result).toEqual(mockMovieTheater);
    });

    it('should throw NotFoundError if movie theater not found', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        movieTheaterService.getMovieTheaterById('nonexistent')
      ).rejects.toThrow(NotFoundError);
      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('nonexistent');
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

    it('should throw NotFoundError if movie theater not found', async () => {
      (MovieTheaterModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        movieTheaterService.updateMovieTheater('nonexistent', {
          city: 'New City',
        })
      ).rejects.toThrow(NotFoundError);

      expect(MovieTheaterModel.findByPk).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('deleteMovieTheater', () => {
    it('should delete the movie theater successfully', async () => {
      (MovieTheaterModel.destroy as jest.Mock).mockResolvedValue(1);

      await expect(
        movieTheaterService.deleteMovieTheater('theater123')
      ).resolves.toBeUndefined();

      expect(MovieTheaterModel.destroy).toHaveBeenCalledWith({
        where: { theaterId: 'theater123' },
      });
    });

    it('should throw NotFoundError if no movie theater was deleted', async () => {
      (MovieTheaterModel.destroy as jest.Mock).mockResolvedValue(0);

      await expect(
        movieTheaterService.deleteMovieTheater('nonexistent')
      ).rejects.toThrow(NotFoundError);

      expect(MovieTheaterModel.destroy).toHaveBeenCalledWith({
        where: { theaterId: 'nonexistent' },
      });
    });
  });
});
