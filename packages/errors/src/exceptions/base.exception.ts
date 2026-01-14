export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    error: string,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      error: this.error,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}
