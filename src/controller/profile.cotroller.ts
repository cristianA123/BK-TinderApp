import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import SecurityMiddleware from '../middleware/security.middleware';
import LogginMiddleware from '../middleware/loggin.middleware';
import ProfileManager from '../manager/profile.manager';

const profileController = (prisma: PrismaClient) => {
    const profileManager = new ProfileManager(prisma);
    const securityHandler = new SecurityMiddleware();
    const logginHandler = new LogginMiddleware();

    const router = Router();

    router.use(logginHandler.loggingMiddleware);

    router.get('/', securityHandler.validateToken.bind(securityHandler), profileManager.profile.bind(profileManager));
    router.post('/', securityHandler.validateToken.bind(securityHandler), profileManager.createProfile.bind(profileManager));
    router.put('/', securityHandler.validateToken.bind(securityHandler), profileManager.updateProfile.bind(profileManager));

    return router;
};

export default profileController;