import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import swaggeUi from 'swagger-ui-express';
import routes from './routes';
import errorHandler from './handler/error.handler';

import swaggerDocument from './docs/swagger.json'


export const createServer = (prisma: PrismaClient) => {
    const app = express();
    app.use(helmet());
    app.use(cors())
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
    
    routes(app, prisma);

    app.use(errorHandler);

    app.use('/api-docs', swaggeUi.serve,swaggeUi.setup(swaggerDocument))

  return app;
};