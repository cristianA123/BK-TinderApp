import * as dotenv from 'dotenv';
import { createServer } from './server';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const app = createServer(prisma);

app.listen(process.env.PORT,() => {
    console.log(`Server running on port ${process.env.PORT}`)
})

export default app;