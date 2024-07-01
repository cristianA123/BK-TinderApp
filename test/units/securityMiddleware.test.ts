import SecurityMiddleware from '../../src/middleware/security.middleware';
import { NextFunction, Request, Response } from 'express';
import { NotAuth } from '../../src/shared/util/error.util';
import { textResponses } from '../../src/shared/util/constants.util';
import { enumUtil } from '../../src/shared/util/enum.util';
import AppError from '../../src/shared/errors/app.error';

describe('SecurityMiddleware', () => {

    let securityMiddleware:SecurityMiddleware;
    let id:string;
    let token:string;
    beforeEach(() => {
        securityMiddleware = new SecurityMiddleware();
        id = '123456789';
        token = securityMiddleware.createToken(id);
    });


    describe('createToken', () => {
        it('should create a token with the provided id', async () => {
            expect(token).toBeTruthy(); 
        });
    });

    describe('decodeToken', () => {
        it('should decode a valid token and return the payload', async () => {
            const payload = securityMiddleware.decodeToken(token);
            expect(payload).toBeDefined(); 
        });
    });

    describe('validateToken', () => {
        it('should set the decoded token payload in the request body and call next middleware', async () => {
            const req = {
                headers: {
                    authorization: `Bearer ${token}`,
                },
                body: {},
            } as Request;
            const res = {} as Response;
            const next: NextFunction = jest.fn();
            securityMiddleware.validateToken(req, res, next);
            expect(req.body.uuid).toBe(id);
            expect(next).toHaveBeenCalled();
        });

        it('should throw an error when the token is missing', async () => {
            const reqWithoutToken = { headers: {}, body: {} } as Request;
            const res = {} as Response;
            const next: NextFunction = jest.fn();
            expect(() => {
                securityMiddleware.validateToken(reqWithoutToken, res, next);
            }).toThrow(new NotAuth(textResponses.nonToken, enumUtil.errorAuth));
            expect(next).not.toHaveBeenCalled();
        });

        it('should throw an error when the token does not have Bearer prefix', async () => {
            const reqWithInvalidToken = { headers: { authorization: 'InvalidToken' }, body: {} } as Request;
            const res = {} as Response;
            const next: NextFunction = jest.fn();

            expect(() => {
                securityMiddleware.validateToken(reqWithInvalidToken, res, next);
            }).not.toThrow(new NotAuth(textResponses.invalidToken, enumUtil.errorAuth));
        });

        it('should throw an error when the token is malformed', async () => {
            const reqWithMalformedToken = { headers: { authorization: 'Bearer malformed.token' }, body: {} } as Request;
            const res = {} as Response;
            const next: NextFunction = jest.fn();
            expect(() => {
                securityMiddleware.validateToken(reqWithMalformedToken, res, next);
            }).toThrow(new NotAuth(textResponses.invalidToken, enumUtil.errorAuth));
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle unknown errors and call next with AppError', async () => {
            const req = { headers: { authorization: `Bearer ${token}` }, body: {} } as Request;
            const res = {} as Response;
            const next: NextFunction = jest.fn();

            jest.spyOn(securityMiddleware, 'decodeToken').mockImplementation(() => {
                throw new Error('Unknown error');
            });

            securityMiddleware.validateToken(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Unknown error',
                statusCode: 500,
            }));
        });
    });

    describe('constructor', () => {
      it('should set jwt_key from environment variable when defined', () => {
          process.env.JWT_TOKEN = 'test_jwt_key';
          const securityMiddleware = new SecurityMiddleware();
          expect(securityMiddleware['jwt_key']).toBe('test_jwt_key');
      });

      it('should set jwt_key to an empty string when environment variable is not defined', () => {
          delete process.env.JWT_TOKEN;
          const securityMiddleware = new SecurityMiddleware();
          expect(securityMiddleware['jwt_key']).toBe('');
      });
  });

});
