import { UserInterface } from '../interfaces/user.interface';
import { UserModel } from '../models/user.model';
import { Op } from 'sequelize';

/**
 * Creates a new user and adds it to the database.
 * The password will be hashed by the model's BeforeCreate hook.
 * @param name The full name of the user.
 * @param email The user's email address.
 * @param password The user's password (will be hashed by model hooks).
 * @returns The newly created user.
 */
export const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<Omit<UserInterface, 'password'>> => {
  // Create user in database using Sequelize
  // Password hashing is handled by the model's BeforeCreate hook
  const newUser = await UserModel.create({
    name,
    email,
    password,
  });

  // Return user data without password
  const userData = newUser.get({ plain: true }) as UserInterface;
  const { password: _, ...userWithoutPassword } = userData;

  return userWithoutPassword;
};

/**
 * Checks if the provided email is already used by another user.
 * @param email The email to check.
 * @returns True if the email is available, false if it already exists.
 */
export const isEmailUnique = async (email: string): Promise<boolean> => {
  const existingUser = await UserModel.findOne({ where: { email } });
  return !existingUser;
};

/**
 * Finds a user by their ID.
 * @param id The user's ID.
 * @returns The user (without password) or null if not found.
 */
export const getUserById = async (
  id: string
): Promise<Omit<UserInterface, 'password'> | null> => {
  const user = await UserModel.findByPk(id);
  if (!user) return null;

  // Return data without password
  const userData = user.get({ plain: true }) as UserInterface;
  const { password: _, ...userWithoutPassword } = userData;

  return userWithoutPassword;
};

/**
 * Updates a user's information.
 * @param id The user's ID.
 * @param userData The data to update (name, email).
 * @returns The updated user (without password) or null if not found.
 */
export const updateUser = async (
  id: string,
  userData: Partial<UserInterface>
): Promise<Omit<UserInterface, 'password'> | null> => {
  // Extract password from update data to prevent updating it directly
  const { password: _, ...updateData } = userData;

  const [updatedCount] = await UserModel.update(updateData, {
    where: { id },
  });

  if (updatedCount === 0) return null;

  return getUserById(id);
};

/**
 * Changes a user's password.
 * @param id The user's ID.
 * @param currentPassword The current password for verification.
 * @param newPassword The new password to set.
 * @returns True if password was changed successfully, false otherwise.
 */
export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = await UserModel.findByPk(id);
  if (!user) return false;

  // Verify current password
  const isValid = await user.validatePassword(currentPassword);
  if (!isValid) return false;

  // Update password (will be hashed by BeforeUpdate hook)
  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Deletes a user from the database.
 * @param id The user's ID.
 * @returns True if user was deleted, false if not found.
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  const deletedCount = await UserModel.destroy({
    where: { id },
  });

  return deletedCount > 0;
};

/**
 * Finds users matching search criteria.
 * @param searchTerm The search term to match against name or email.
 * @param limit Optional limit on number of results.
 * @param offset Optional offset for pagination.
 * @returns Array of users (without passwords) matching criteria.
 */
export const searchUsers = async (
  searchTerm: string,
  limit: number = 10,
  offset: number = 0
): Promise<Omit<UserInterface, 'password'>[]> => {
  const users = await UserModel.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${searchTerm}%` } },
        { email: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    limit,
    offset,
    attributes: { exclude: ['password'] }, // Don't return passwords
  });

  return users.map((user) => {
    const userData = user.get({ plain: true }) as UserInterface;
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  });
};
