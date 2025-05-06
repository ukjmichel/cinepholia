export class NotAuthorizedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotAuthorizedError';
    this.statusCode = 403; // 403 Forbidden (common for "not authorized")

    // Important: Set the prototype explicitly for custom error classes
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}
