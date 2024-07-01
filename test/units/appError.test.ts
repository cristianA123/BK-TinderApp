import AppError from "../../src/shared/errors/app.error";

describe('AppError class', () => {
  it('should create an AppError instance with default values', () => {
    const error = new AppError('Test message');

    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(500);
    expect(error.errorCode).toBe(-11);
    expect(error.isOperational).toBe(true);
  });

  it('should create an AppError instance with custom values', () => {
    const error = new AppError('Test message', 404, 123, false);

    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(404);
    expect(error.errorCode).toBe(123);
    expect(error.isOperational).toBe(false);
  });

  it('should have stack trace captured', () => {
    const error = new AppError('Test message');

    expect(error.stack).toBeDefined();
  });
});
