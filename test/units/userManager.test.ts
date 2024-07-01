import { Request, Response, NextFunction } from 'express';
import UserManager from '../../src/manager/user.manager';
import SecurityMiddleware from '../../src/middleware/security.middleware';
import { textResponses } from '../../src/shared/util/constants.util';
import {expect, jest} from '@jest/globals';
import { prismaMock } from '../prisma/singleton';
import { user1, user2} from '../mocks/userManagerMocks';
import { InternalServerError } from '../../src/shared/util/error.util';
import { enumUtil } from '../../src/shared/util/enum.util';
import AppError from '../../src/shared/errors/app.error';

jest.mock('../../src/middleware/security.middleware'); 
const mockSecurityMiddleware = SecurityMiddleware as jest.MockedClass<typeof SecurityMiddleware>;

describe('UserManager', () => {
    let userManager:UserManager;

    beforeEach(() => {
        userManager = new UserManager(prismaMock);
    });

    describe('login', () => {
        it('should return a token undefined because you send invalid credentials', async () => {
            prismaMock.user.create.mockResolvedValue(user2);
    
            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();
    
            await userManager.login(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: { },
            });
        });

        it('should return a valid token  because you send correct credentials', async () => {

            mockSecurityMiddleware.prototype.createToken.mockImplementation(() => 'mockToken');
    
            prismaMock.user.findUnique.mockResolvedValue(user1)
    
            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
    
            const next: NextFunction = jest.fn();
    
            await userManager.login(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'ok',
                message: textResponses.success,
                data: { token: 'mockToken', uuid: user1.uuid},
            });
        });

        it('should throw InternalServerError if email or password is missing', async () => {
            const req = {
                body: { email: '', password: '' },
            } as Request;
        
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
        
            const next: NextFunction = jest.fn();
        
            await userManager.login(req, res, next);
        
            expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: textResponses.badParameters,
                errorCode: enumUtil.badParametersInput,
            }));
        });

        it('should handle unknown error types and call next with an AppError', async () => {
            prismaMock.user.findUnique.mockRejectedValue(new AppError('Unknown error'));
        
            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;
        
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
        
            const next: NextFunction = jest.fn();
        
            await userManager.login(req, res, next);
        
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle generic instance of Error and call next with an AppError', async () => {
            const errorMessage = 'Generic error';
            prismaMock.user.findUnique.mockRejectedValue(new AppError(errorMessage));

            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.login(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle instance of AppError and call next with the same AppError', async () => {
            const appError = new AppError('Unknown error occurred', 400, enumUtil.functionalError);
            prismaMock.user.findUnique.mockRejectedValue(appError);

            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.login(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle non-error instance and call next with an AppError with "Unknown error"', async () => {
            prismaMock.user.findUnique.mockRejectedValue({ not: 'an error instance' });

            const req = {
                body: { email: user1.email, password: user1.password },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.login(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
        
    })

    describe('getProfile', () => {
        it('should return a fail response because you send invalid credentials', async () => {
            prismaMock.user.create.mockResolvedValue(user2);
    
            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();
    
            await userManager.getProfile(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: { },
            });
        });

        it('should return a valid token  because you send correct credentials', async () => {

            mockSecurityMiddleware.prototype.createToken.mockImplementation(() => 'mockToken');
    
            prismaMock.user.findUnique.mockResolvedValue(user1)
    
            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
    
            const next: NextFunction = jest.fn();
    
            await userManager.getProfile(req, res, next);
            // console.log(res.send.mock.calls[0][0]);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'ok',
                message: textResponses.success,
                data: { user: user1},
            });
        });

        it('should handle unknown error types and call next with an AppError', async () => {
            prismaMock.user.findUnique.mockRejectedValue(new AppError('Unknown error'));
        
            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
        
            const next: NextFunction = jest.fn();
        
            await userManager.getProfile(req, res, next);
        
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle generic instance of Error and call next with an AppError', async () => {
            const errorMessage = 'Generic error';
            prismaMock.user.findUnique.mockRejectedValue(new AppError(errorMessage));

            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.getProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle instance of AppError and call next with the same AppError', async () => {
            const appError = new AppError('Unknown error occurred', 400, enumUtil.functionalError);
            prismaMock.user.findUnique.mockRejectedValue(appError);

            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.getProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle instance of AppError and call next with the same Error', async () => {
            const appError = new Error('Unknown error occurred');
            prismaMock.user.findUnique.mockRejectedValue(appError);

            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.getProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle non-error instance and call next with an AppError with "Unknown error"', async () => {
            prismaMock.user.findUnique.mockRejectedValue({ not: 'an error instance' });

            const req = {
                body: { uuid: user1.uuid },
            } as Request;

            req.params = {email: user1.email}

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.getProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    })

    describe('deleteUser', () => {
        it('should delete user  because you send correct credentials', async () => {    
            prismaMock.user.delete.mockResolvedValue(user1)
    
            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
    
            const next: NextFunction = jest.fn();
    
            await userManager.deleteUser(req, res, next);
            // console.log(res.send.mock.calls[0][0]);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'ok',
                message: textResponses.deleteResponse,
                data: {}
            });
        });

        it('should return an error message could not delete user', async () => {
            prismaMock.user.create.mockResolvedValue(user2);
    
            const req = {
                params: { email: user1.email },
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();
    
            await userManager.deleteUser(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: { },
            });
        });

        it('should handle generic instance of Error and call next with an AppError', async () => {
            const errorMessage = 'Generic error';
            prismaMock.user.delete.mockRejectedValue(new AppError(errorMessage));

            const req = {} as Request;
            req.params = { email: user1.email };

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle instance of AppError and call next with the same AppError', async () => {
            const appError = new AppError('Unknown error occurred', 400, enumUtil.functionalError);
            prismaMock.user.delete.mockRejectedValue(appError);

            const req = {} as Request;
            req.params = { email: user1.email };

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle non-error instance and call next with an AppError with "Unknown error"', async () => {
            prismaMock.user.delete.mockRejectedValue({ not: 'an error instance' });

            const req = {} as Request;
            req.params = { email: user1.email };

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.deleteUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

    })

    describe('updateUser', () => {
        it('should updateUser user  because you send correct credentials', async () => {    
            prismaMock.user.update.mockResolvedValue(user1)
    
            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
    
            const next: NextFunction = jest.fn();
    
            await userManager.updateUser(req, res, next);
            // console.log(res.send.mock.calls[0][0]);
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'ok',
                message: textResponses.updatedResponse,
                data: {
                    user: {
                    email: user1.email,
                    firstName: user1.firstName,
                    lastName: user1.lastName,
                }}
            });
        });

        it('should return an error when required fields are missing', async () => {
            const req = {
                body: { email: '', password: '', uuid: '', lastName: '' },
            } as Request;
        
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
        
            const next: NextFunction = jest.fn();
        
            await userManager.updateUser(req, res, next);
        
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: textResponses.badParameters,
                errorCode: enumUtil.badParametersInput,
            }));
        });

        it('should return an error message could not find user', async () => {
            prismaMock.user.create.mockResolvedValue(user2);
    
            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();
    
            await userManager.updateUser(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: { },
            });
        });

        it('should handle generic instance of Error and call next with an AppError', async () => {
            const errorMessage = 'Generic error';
            prismaMock.user.update.mockRejectedValue(new AppError(errorMessage));

            const req = {
                body: { uuid: user1.uuid, email: user1.email, firstName: user1.firstName, lastName: user1.lastName },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle instance of AppError and call next with the same AppError', async () => {
            const appError = new AppError('Unknown error occurred', 400, enumUtil.functionalError);
            prismaMock.user.update.mockRejectedValue(appError);

            const req = {
                body: { uuid: user1.uuid, email: user1.email, firstName: user1.firstName, lastName: user1.lastName },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle non-error instance and call next with an AppError with "Unknown error"', async () => {
            prismaMock.user.update.mockRejectedValue({ not: 'an error instance' });

            const req = {
                body: { uuid: user1.uuid, email: user1.email, firstName: user1.firstName, lastName: user1.lastName },
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    })

    describe('createUser', () => {
        it('should createUser user because you send correct credentials', async () => {    
            prismaMock.user.create.mockResolvedValue(user1)
    
            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.createUser(req, res, next);

            
            
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'ok',
                message: textResponses.createdResponse,
                data: {
                    user: {
                        email: user1.email,
                        firstName: user1.firstName,
                        lastName: user1.lastName,
                        uuid: expect.any(String)
                    }
                }
            })
        });

        it('should return an error message could not create user', async () => {
    
            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as unknown as Request;
    
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();
    
            await userManager.createUser(req, res, next);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: { },
            });
        });
        
        it('should return an error when you have incorrect parameter input', async () => {
            const req = {
                body: { email: '', password: '', uuid: '', lastName: '' },
            } as Request;
        
            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;
        
            const next: NextFunction = jest.fn();
        
            await userManager.createUser(req, res, next);
        
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next).toHaveBeenCalledWith(expect.objectContaining({
                message: textResponses.badParameters,
                errorCode: enumUtil.badParametersInput,
            }));
        });

        it('should handle unknown error types and call next with an AppError', async () => {
            prismaMock.user.findUnique.mockRejectedValue(new AppError('Unknown error'));

            const req = {
                body: { uuid: user1.uuid },
                params: { email: user1.email },
            } as unknown as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle generic instance of Error and call next with an AppError', async () => {
            const errorMessage = 'Generic error';
            prismaMock.user.create.mockRejectedValue(new AppError(errorMessage));

            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });

        it('should handle instance of AppError and call next with the same AppError', async () => {
            const appError = new AppError('Unknown error occurred', 400, enumUtil.functionalError);
            prismaMock.user.create.mockRejectedValue(appError);

            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(appError);
        });

        it('should handle non-error instance and call next with an AppError with "Unknown error"', async () => {
            prismaMock.user.create.mockRejectedValue({ not: 'an error instance' });

            const req = {
                body: { email: user1.email, firstName: user1.firstName, lastName: user1.lastName, uuid: user1.uuid }
            } as Request;

            const res: Response = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            } as unknown as Response;

            const next: NextFunction = jest.fn();

            await userManager.createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    })
})
