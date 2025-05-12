// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public name: string = 'AppError'
  ) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}
