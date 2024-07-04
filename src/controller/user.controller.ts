import { Router } from 'express';
import UserManager from '../manager/user.manager';
import { PrismaClient } from '@prisma/client';
import SecurityMiddleware from '../middleware/security.middleware';
import LogginMiddleware from '../middleware/loggin.middleware';

const userController = (prisma: PrismaClient) => {
    const userManager = new UserManager(prisma);
    const securityHandler = new SecurityMiddleware();
    const logginHandler = new LogginMiddleware();

    const router = Router();

    router.use(logginHandler.loggingMiddleware);

    router.post('/login', userManager.login.bind(userManager));
    router.get('/:email', securityHandler.validateToken.bind(securityHandler), userManager.getProfile.bind(userManager));
    // router.put('/', securityHandler.validateToken.bind(securityHandler), userManager.updateUser.bind(userManager));
    router.post('/', securityHandler.validateToken.bind(securityHandler), userManager.createUser.bind(userManager));
    router.delete('/:email', securityHandler.validateToken.bind(securityHandler), userManager.deleteUser.bind(userManager));
    return router;
};

export default userController;