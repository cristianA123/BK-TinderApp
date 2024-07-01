import { Prisma } from '@prisma/client';
import { InternalServerError } from '../shared/util/error.util';
import { textResponses } from '../shared/util/constants.util';
import { enumUtil } from '../shared/util/enum.util';


class PrismaHandler {
    async executeQuery<T>(queryFunction: () => Promise<T>): Promise<T> {
        try {
            return await queryFunction();
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.error('Prisma database error:', error.message);
                throw new InternalServerError(textResponses.error,enumUtil.errorDBRequest)
            } else {
                console.error('Unknown error:', error);
                throw new Error('Unknown error occurred');
            }
        }
    }
}

export default PrismaHandler;