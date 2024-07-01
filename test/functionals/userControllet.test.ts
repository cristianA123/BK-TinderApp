import request from 'supertest';
import {createServer} from '../../src/server';
import { user1, user2 } from '../mocks/userManagerMocks';
import SecurityMiddleware from '../../src/middleware/security.middleware';
import { prismaMock } from '../prisma/singleton';
import { textResponses } from '../../src/shared/util/constants.util';
import {expect, jest} from '@jest/globals';


jest.mock('../../src/middleware/security.middleware');
const mockSecurityMiddleware = SecurityMiddleware as jest.MockedClass<typeof SecurityMiddleware>
mockSecurityMiddleware.prototype.createToken.mockImplementation(() => 'mockToken');

const app = createServer(prismaMock);

const rquest =request(app)

describe('User controller Endpoints', () => {
    beforeEach(() => {
        prismaMock.user.findUnique.mockClear();
    });

    describe('api/user/login', () => {
        it('should return a token for valid credentials', async () => {
            prismaMock.user.findUnique.mockResolvedValue(user1);
            const response = await rquest
                .post('/api/user/login')
                .send({
                    email: user1.email,
                    password: user1.password
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'ok',
                message: textResponses.success,
                data: { token: 'mockToken', uuid:user1.uuid }
            });
    
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                select: { uuid: true },
                where: { email: user1.email, password: user1.password }
            });
    
            expect(mockSecurityMiddleware.prototype.createToken).toHaveBeenCalledWith(user1.uuid);
        });
    
        it('should return an error for invalid credentials', async () => {
            prismaMock.user.create.mockResolvedValue(user2);
            const response = await rquest
                .post('/api/user/login')
                .send({
                    email: user1.email,
                    password: user1.password
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: {}
            });
        });
    });

    describe('/api/user/:email', () => {
        it('should return data for valid credentials', async() => {
            prismaMock.user.findUnique.mockResolvedValue(user1);
            const token = 'token_';

            mockSecurityMiddleware.prototype.decodeToken.mockImplementation(() => {
                return { _foo: user1.uuid, new: true };
            });
            const decodedToken = mockSecurityMiddleware.prototype.decodeToken(token);

            mockSecurityMiddleware.prototype.validateToken.mockImplementation((req, _res, next) => {
                req.body.uuid = decodedToken._foo;
                next();
            });

            const response = await rquest
                .get(`/api/user/${user1.email}`)
                .set('authorization', 'Bearer mockToken');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'ok',
                message: textResponses.success,
                data: { user: user1 }
            });
        });
        it('should return error for invalid credentials', async () => {

            mockSecurityMiddleware.prototype.validateToken.mockImplementation((req, _res, next) => {
                req.body.uuid = user1.uuid;
                next();
            });

            prismaMock.user.create.mockResolvedValue(user2);
            const response = await request(app)
                .get(`/api/user/${user1.email}`)
                .set('authorization', 'Bearer mockToken');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'fail',
                message: textResponses.incorrectCredentials,
                data: {}
                });
        });
    });

    describe('/api/user/ create user', () => {
        it('should return data for user credentials', async() => {
            prismaMock.user.create.mockResolvedValue(user1);
            const token = 'token_';

            mockSecurityMiddleware.prototype.decodeToken.mockImplementation(() => {
                return { _foo: user1.uuid, new: true };
            });
            const decodedToken = mockSecurityMiddleware.prototype.decodeToken(token);

            mockSecurityMiddleware.prototype.validateToken.mockImplementation((req, _res, next) => {
                req.body.uuid = decodedToken._foo;
                next();
            });

            const response = await rquest
                .post(`/api/user/`)
                .set('Content-Type',  'application/json')
                .set('authorization', 'Bearer mockToken')
                .send({ email: user1.email, firstName: user1.firstName, lastName: user1.lastName });

            expect(response.status).toBe(200);
            expect(response.body.status).toContain('ok');
            expect(response.body.message).toContain(textResponses.createdResponse);
        });
    });

    describe('/api/user/ update user', () => {
        it('should update data for user credentials', async() => {
            prismaMock.user.update.mockResolvedValue(user1);
            const token = 'token_';

            mockSecurityMiddleware.prototype.decodeToken.mockImplementation(() => {
                return { _foo: user1.uuid, new: true };
            });
            const decodedToken = mockSecurityMiddleware.prototype.decodeToken(token);

            mockSecurityMiddleware.prototype.validateToken.mockImplementation((req, _res, next) => {
                req.body.uuid = decodedToken._foo;
                next();
            });

            const response = await rquest
                .put(`/api/user/`)
                .set('Content-Type',  'application/json')
                .set('authorization', 'Bearer mockToken')
                .send({ email: user1.email, firstName: user1.firstName, lastName: user1.lastName });

            expect(response.status).toBe(200);
            expect(response.body.status).toContain('ok');
            expect(response.body.message).toContain(textResponses.updatedResponse);
        });
    });

    describe('/api/user/:email delete user', () => {
        it('should delete data for user credentials', async() => {
            prismaMock.user.delete.mockResolvedValue(user1);
            const token = 'token_';

            mockSecurityMiddleware.prototype.decodeToken.mockImplementation(() => {
                return { _foo: user1.uuid, new: true };
            });
            const decodedToken = mockSecurityMiddleware.prototype.decodeToken(token);

            mockSecurityMiddleware.prototype.validateToken.mockImplementation((req, _res, next) => {
                req.body.uuid = decodedToken._foo;
                next();
            });

            const response = await rquest
                .delete(`/api/user/${user1.email}`)
                .set('Content-Type',  'application/json')
                .set('authorization', 'Bearer mockToken');

            expect(response.status).toBe(200);
            expect(response.body.status).toContain('ok');
            expect(response.body.message).toContain(textResponses.deleteResponse);
        });
    });

});