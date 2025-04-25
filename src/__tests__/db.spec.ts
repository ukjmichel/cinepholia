// First, mock the imported sequelize instance
jest.mock('../config/db', () => ({
  sequelize: {
    sync: jest.fn().mockResolvedValue('Database synced!'),
    authenticate: jest.fn().mockResolvedValue('Database connected!'),
  },
}));

// Import the mocked sequelize instance
import { sequelize } from '../config/db';

// Add proper typing for the mocked methods
const mockedSequelize = sequelize as unknown as {
  sync: jest.MockedFunction<typeof sequelize.sync>;
  authenticate: jest.MockedFunction<typeof sequelize.authenticate>;
};

// Mock the Sequelize constructor and related components if needed elsewhere
jest.mock('sequelize', () => {
  const mockSequelize = jest.fn().mockImplementation(() => ({
    sync: jest.fn().mockResolvedValue('Database synced!'),
    authenticate: jest.fn().mockResolvedValue('Database connected!'),
  }));

  return {
    Sequelize: mockSequelize,
    DataTypes: {
      STRING: 'STRING',
      INTEGER: 'INTEGER',
      // Add other types as needed
    },
  };
});

jest.mock('sequelize-typescript', () => ({
  Sequelize: jest.fn(),
  Model: class {},
  Column: jest.fn(),
  DataType: {
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    // Add other types as needed
  },
  Table: jest.fn(),
  PrimaryKey: jest.fn(),
  Default: jest.fn(),
  HasMany: jest.fn(),
}));

describe('Sequelize Database Sync', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should sync the database successfully', async () => {
    // Act
    const result = await sequelize.sync();

    // Assert
    expect(mockedSequelize.sync).toHaveBeenCalled();
    expect(mockedSequelize.sync).toHaveBeenCalledTimes(1);
    expect(result).toBe('Database synced!');
  });

  it('should handle errors during sync', async () => {
    // Arrange
    const error = new Error('DB error');
    mockedSequelize.sync.mockRejectedValueOnce(error);

    // Act & Assert
    await expect(sequelize.sync()).rejects.toThrow('DB error');
    expect(mockedSequelize.sync).toHaveBeenCalledTimes(1);
  });

  it('should authenticate database connection', async () => {
    // Act
    const result = await sequelize.authenticate();

    // Assert
    expect(mockedSequelize.authenticate).toHaveBeenCalled();
    expect(result).toBe('Database connected!');
  });
});
