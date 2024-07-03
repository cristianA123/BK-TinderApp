import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import userController from '../controller/user.controller';
import authController from '../controller/auth.controller';
import profileController from '../controller/profile.cotroller';

const routers = (app: Express, prisma: PrismaClient) => {
    app.use('/api/user', userController(prisma));
    app.use('/api/auth', authController(prisma));
    app.use('/api/profile', profileController(prisma));
};

export = routers;