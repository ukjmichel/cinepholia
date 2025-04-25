import { AuthorizationService } from '../../services/authorization.service';
import { AuthorizationModel } from '../../models/authorization.model';
import { Role } from '../../models/authorization.model';

// Mock AuthorizationModel
jest.mock('../../models/authorization.model');

describe('AuthorizationService', () => {
  let authorizationService: AuthorizationService;
  let mockFindByPk: jest.Mock;
  let mockSave: jest.Mock;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    // Clear previous mocks
    jest.clearAllMocks();

    authorizationService = new AuthorizationService();

    // Setup mocks
    mockFindByPk = jest.fn();
    mockSave = jest.fn();
    mockCreate = jest.fn();

    (AuthorizationModel.findByPk as jest.Mock) = mockFindByPk;
    (AuthorizationModel.create as jest.Mock) = mockCreate;
  });

  describe('setRole', () => {
    it('should update role if user already exists', async () => {
      const existingUser = {
        userId: 'user123',
        role: 'utilisateur',
        save: mockSave,
      };

      // Mock user found
      mockFindByPk.mockResolvedValue(existingUser);

      const result = await authorizationService.setRole('user123', 'employé');

      expect(mockFindByPk).toHaveBeenCalledWith('user123');
      expect(existingUser.role).toBe('employé');
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should create new record if user does not exist', async () => {
      // Mock no user found
      mockFindByPk.mockResolvedValue(null);

      // Mock create
      mockCreate.mockResolvedValue({
        userId: 'user456',
        role: 'administrateur',
      });

      const result = await authorizationService.setRole(
        'user456',
        'administrateur'
      );

      expect(mockFindByPk).toHaveBeenCalledWith('user456');
      expect(mockCreate).toHaveBeenCalledWith({
        userId: 'user456',
        role: 'administrateur',
      });
      expect(result).toBe(true);
    });
  });

  describe('getRole', () => {
    it('should return role if user exists', async () => {
      const user = { role: 'employé' };
      mockFindByPk.mockResolvedValue(user);

      const role = await authorizationService.getRole('user789');

      expect(mockFindByPk).toHaveBeenCalledWith('user789');
      expect(role).toBe('employé');
    });

    it('should return null if user does not exist', async () => {
      mockFindByPk.mockResolvedValue(null);

      const role = await authorizationService.getRole('user000');

      expect(mockFindByPk).toHaveBeenCalledWith('user000');
      expect(role).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has required permission', async () => {
      const user = { role: 'administrateur' };
      mockFindByPk.mockResolvedValue(user);

      const hasPermission = await authorizationService.hasPermission(
        'user123',
        'employé'
      );

      expect(hasPermission).toBe(true);
    });

    it('should return false if user has lower permission', async () => {
      const user = { role: 'utilisateur' };
      mockFindByPk.mockResolvedValue(user);

      const hasPermission = await authorizationService.hasPermission(
        'user123',
        'employé'
      );

      expect(hasPermission).toBe(false);
    });

    it('should return false if user does not exist', async () => {
      mockFindByPk.mockResolvedValue(null);

      const hasPermission = await authorizationService.hasPermission(
        'user123',
        'employé'
      );

      expect(hasPermission).toBe(false);
    });
  });
});
