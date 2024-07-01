import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../src/handler/error.handler';
import AppError from '../../src/shared/errors/app.error';

describe('errorHandler middleware', () => {
  it('should send error response with status code 500 for non-operational errors', () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const mockNext = jest.fn() as NextFunction;

    const nonOperationalError = new AppError("Test error", 500, -11,false);

    errorHandler(nonOperationalError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
      errorCode: -11,
    });
  });

  it('should send error response with status code 500 and log internal server error for operational errors', () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    const mockNext = jest.fn() as NextFunction;

    const operationalError = new AppError('Test error', 500, -11, false);

    const consoleErrorSpy = jest.spyOn(console, 'error');

    errorHandler(operationalError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.send).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error',
      errorCode: -11,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('INTERNAL SERVER ERROR:', operationalError);
  });

  it('should send error response with default status code 500 when statusCode is not defined', () => {
      const mockRequest = {} as Request;
      const mockResponse = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      const errorWithoutStatusCode = new AppError('Test error', undefined, undefined, true);

      errorHandler(errorWithoutStatusCode, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
          status: 'fail',
          message: 'Test error',
          errorCode: -11,
      });
  });

  it('should send error response with default errorCode -11 when errorCode is not defined', () => {
      const mockRequest = {} as Request;
      const mockResponse = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      const errorWithoutErrorCode = new AppError('Test error', 400, undefined, true);

      errorHandler(errorWithoutErrorCode, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
          status: 'fail',
          message: 'Test error',
          errorCode: -11,
      });
  });

  it('should send error response with default status code 500 and default errorCode -11 when both are not defined', () => {
      const mockRequest = {} as Request;
      const mockResponse = {
          status: jest.fn().mockReturnThis(),
          send: jest.fn(),
      } as unknown as Response;
      const mockNext = jest.fn() as NextFunction;

      const errorWithoutStatusCodeAndErrorCode = new AppError('Test error', undefined, undefined, true);

      errorHandler(errorWithoutStatusCodeAndErrorCode, mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
          status: 'fail',
          message: 'Test error',
          errorCode: -11,
      });
  });
});
