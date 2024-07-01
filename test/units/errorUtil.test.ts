import { InternalServerError, NotAuth } from "../../src/shared/util/error.util";

describe('InternalServerError', () => {
  it('should create an instance with correct properties', () => {
    const error = new InternalServerError('Internal Server Error');
    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(500);
    expect(error.errorCode).toBe(-30);
    expect(error.isOperational).toBe(true);
  });

  it('should create an instance with custom error code', () => {
    const error = new InternalServerError('Internal Server Error', -50);
    expect(error.errorCode).toBe(-50);
  });
});

describe('NotAuth', () => {
  it('should create an instance with correct properties', () => {
    const error = new NotAuth('Not Authorized');
    expect(error.message).toBe('Not Authorized');
    expect(error.statusCode).toBe(401);
    expect(error.errorCode).toBe(-40);
    expect(error.isOperational).toBe(true);
  });

  it('should create an instance with custom error code', () => {
    const error = new NotAuth('Not Authorized', -60);
    expect(error.errorCode).toBe(-60);
  });
});