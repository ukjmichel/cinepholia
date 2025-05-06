import { UserInterface } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';
import { Op } from 'sequelize';

/**
 * Service class for managing users.
 */
export default class UserService {
  /**
   * Creates a new user in the database.
   * Ensures the email is unique before creating.
   * Password hashing is automatically handled by Sequelize hooks.
   *
   * @param name - The user's full name.
   * @param email - The user's email address.
   * @param password - The user's plain password (will be hashed).
   * @returns The newly created user without the password field.
   * @throws BadRequestError if the email is already registered.
   */
  async createUser(
    name: string,
    email: string,
    password: string
  ): Promise<Omit<UserInterface, 'password'>> {
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestError('Email is already registered.');
    }

    const newUser = await UserModel.create({ name, email, password });
    return this.excludePassword(newUser);
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The user's ID.
   * @returns The user without the password field.
   * @throws NotFoundError if the user is not found.
   */
  async getUserById(id: string): Promise<Omit<UserInterface, 'password'>> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
    return this.excludePassword(user);
  }

  /**
   * Retrieves a user by their email address.
   *
   * @param email - The user's email address.
   * @returns The user without the password field.
   * @throws NotFoundError if the user is not found.
   */
  async getUserByEmail(
    email: string
  ): Promise<Omit<UserInterface, 'password'>> {
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found.`);
    }
    return this.excludePassword(user);
  }

  /**
   * Updates a user's name and/or email.
   *
   * @param id - The user's ID.
   * @param userData - Partial user data (name and/or email).
   * @returns The updated user without the password field.
   * @throws NotFoundError if the user is not found.
   */
  async updateUser(
    id: string,
    userData: Partial<Omit<UserInterface, 'id' | 'password'>>
  ): Promise<Omit<UserInterface, 'password'>> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }

    await user.update(userData);
    return this.excludePassword(user);
  }

  /**
   * Changes a user's password after verifying the current password.
   *
   * @param id - The user's ID.
   * @param currentPassword - The user's current password for verification.
   * @param newPassword - The new password to set.
   * @returns Promise<void>
   * @throws NotFoundError if the user is not found.
   * @throws BadRequestError if the current password is incorrect.
   */
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * Deletes a user by their ID.
   *
   * @param id - The user's ID.
   * @returns Promise<void>
   * @throws NotFoundError if the user is not found.
   */
  async deleteUser(id: string): Promise<void> {
    const deletedCount = await UserModel.destroy({ where: { id } });
    if (deletedCount === 0) {
      throw new NotFoundError(`User with ID ${id} not found.`);
    }
  }

  /**
   * Searches for users by name or email.
   *
   * @param searchTerm - The text to search for in names and emails.
   * @param limit - Maximum number of results to return (default 10).
   * @param offset - Number of results to skip (for pagination, default 0).
   * @returns A list of users without password fields.
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

    return users.map(
      (user) => user.get({ plain: true }) as Omit<UserInterface, 'password'>
    );
  }

  /**
   * Helper method to exclude the password field from a user instance.
   *
   * @param user - The UserModel instance.
   * @returns User data without the password field.
   */
  private excludePassword(user: UserModel): Omit<UserInterface, 'password'> {
    const { password, ...userWithoutPassword } = user.get({
      plain: true,
    }) as UserInterface;
    return userWithoutPassword;
  }
}
