import { AuthorizationModel, Role } from '../models/authorization.model';

/**
 * Service to manage user authorization and roles.
 */
export class AuthorizationService {
  /**
   * Retrieve the role of a user.
   * @param userId - The ID of the user
   * @returns Promise<Role | null> - The user's role or null if not found
   */
  async getRole(userId: string): Promise<Role | null> {
    const authorization = await AuthorizationModel.findByPk(userId);
    return authorization ? authorization.role : null;
  }

  /**
   * Set or update the role of a user.
   * @param userId - The ID of the user
   * @param newRole - The new role to assign
   * @returns Promise<boolean> - True if the role was updated, false if the user was not found
   */
  async setRole(userId: string, newRole: Role): Promise<boolean> {
    let authorization = await AuthorizationModel.findByPk(userId);

    if (!authorization) {
      // Create a new record if it doesn't exist
      authorization = await AuthorizationModel.create({
        userId,
        role: newRole,
      });
      return true;
    }

    authorization.role = newRole;
    await authorization.save();

    return true;
  }

  /**
   * Check if a user has the required role or higher.
   * @param userId - The ID of the user
   * @param requiredRole - The minimum role required
   * @returns Promise<boolean> - True if the user has permission, false otherwise
   */
  async hasPermission(userId: string, requiredRole: Role): Promise<boolean> {
    const role = await this.getRole(userId);
    if (!role) return false;

    const roleHierarchy: Record<Role, number> = {
      administrateur: 3,
      employé: 2,
      utilisateur: 1,
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  }
}
