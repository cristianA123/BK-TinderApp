import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import userController from '../controller/user.controller';
import authController from '../controller/auth.controller';

const routers = (app: Express, prisma: PrismaClient) => {
    app.use('/api/user', userController(prisma));
    app.use('/api/auth', authController(prisma));
};

export = routers;