export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;

    // Important: Set the prototype explicitly for custom error classes
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
