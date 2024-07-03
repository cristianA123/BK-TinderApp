import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import SecurityMiddleware from '../middleware/security.middleware';
import LogginMiddleware from '../middleware/loggin.middleware';
import AuthManager from '../manager/auth.manager';

const authController = (prisma: PrismaClient) => {
    const authManager = new AuthManager(prisma);
    const securityHandler = new SecurityMiddleware();
    const logginHandler = new LogginMiddleware();

    const router = Router();

    router.use(logginHandler.loggingMiddleware);

    router.post('/login', authManager.login.bind(authManager));
    router.get('/me', securityHandler.validateToken.bind(securityHandler), authManager.me.bind(authManager));
    router.post('/register', authManager.createUser.bind(authManager));
    router.get('/refresh', securityHandler.validateToken.bind(securityHandler), authManager.refresh.bind(authManager));

    return router;
};

export default authController;