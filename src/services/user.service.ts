import { UserInterface } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';
import { Op } from 'sequelize';

/**
 * Service class for managing users.
 */
export default class UserService {
  /**
   * Creates a new user in the database.
   * Password hashing is automatically handled by Sequelize hooks.
   *
   * @param name - The user's full name.
   * @param email - The user's email address.
   * @param password - The user's plain password (will be hashed).
   * @returns The newly created user without the password field.
   */
  async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<Omit<UserInterface, 'password'>> {
    const newUser = await UserModel.create({ name, email, password });

    const userData = newUser.get({ plain: true }) as UserInterface;
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  /**
   * Checks if an email address is already registered.
   *
   * @param email - Email to check.
   * @returns True if the email is unique, false if already taken.
   */
  async isEmailUnique(email: string): Promise<boolean> {
    const existingUser = await UserModel.findOne({ where: { email } });
    return !existingUser;
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The user's ID.
   * @returns The user data without password, or null if not found.
   */
  async getUserById(
    id: string
  ): Promise<Omit<UserInterface, 'password'> | null> {
    const user = await UserModel.findByPk(id);
    if (!user) return null;

    const userData = user.get({ plain: true }) as UserInterface;
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  /**
   * Retrieves a user by their email.
   *
   * @param email - The user's email address.
   * @returns The user data without password, or null if not found.
   */
  async getUserByEmail(
    email: string
  ): Promise<Omit<UserInterface, 'password'> | null> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) return null;

    const userData = user.get({ plain: true }) as UserInterface;
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  /**
   * Updates a user's name and/or email.
   *
   * @param id - The user's ID.
   * @param userData - Fields to update (name and/or email).
   * @returns The updated user without password, or null if not found.
   */
  async updateUser(
    id: string,
    userData: Partial<UserInterface>
  ): Promise<Omit<UserInterface, 'password'> | null> {
    const { password: _, ...updateData } = userData;

    const [updatedCount] = await UserModel.update(updateData, {
      where: { id },
    });

    if (updatedCount === 0) return null;

    return this.getUserById(id);
  }

  /**
   * Changes the user's password.
   * Verifies the current password before applying the new one.
   *
   * @param id - The user's ID.
   * @param currentPassword - The current password for verification.
   * @param newPassword - The new password to set.
   * @returns True if the password was changed, false otherwise.
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await UserModel.findByPk(id);
    if (!user) return false;

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) return false;

    user.password = newPassword;
    await user.save();
    return true;
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The user's ID.
   * @returns True if the user was deleted, false otherwise.
   */
  async deleteUser(id: string): Promise<boolean> {
    const deletedCount = await UserModel.destroy({ where: { id } });
    return deletedCount > 0;
  }

  /**
   * Searches users by name or email.
   *
   * @param searchTerm - Text to search in name or email.
   * @param limit - Maximum number of results to return.
   * @param offset - How many results to skip (for pagination).
   * @returns An array of users without password fields.
   */
  async searchUsers(
    searchTerm: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Omit<UserInterface, 'password'>[]> {
    const users = await UserModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { email: { [Op.like]: `%${searchTerm}%` } },
        ],
      },
      limit,
      offset,
      attributes: { exclude: ['password'] },
    });

    return users.map((user) => {
      const userData = user.get({ plain: true }) as UserInterface;
      const { password: _, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    });
  }
}
