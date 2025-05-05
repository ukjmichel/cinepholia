export class ConflictError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;

    // Ensure the prototype chain is correctly set
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
