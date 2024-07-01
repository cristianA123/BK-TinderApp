import { Prisma } from '@prisma/client';
import PrismaHandler from '../../src/handler/prisma.handler';
import AppError from '../../src/shared/errors/app.error';
describe('PrismaHandler', () => {
  let prismaHandler: PrismaHandler;

  beforeEach(() => {
    prismaHandler = new PrismaHandler();
  });

  it('executes the query function without errors', async () => {
    const queryFunction = jest.fn().mockResolvedValue('result');
    const result = await prismaHandler.executeQuery(queryFunction);
    expect(queryFunction).toHaveBeenCalled();
    expect(result).toEqual('result');
  });

  it('throws an InternalServerError for known PrismaClientKnownRequestError', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Test error', {
      code: 'P1001',
      clientVersion: '2.0.0',
      meta: {},
    });
    const queryFunction = jest.fn().mockRejectedValue(prismaError);
    await expect(prismaHandler.executeQuery(queryFunction)).rejects.toThrowError('Ocurrió un error al procesar la solicitud');
  });

  it('throws an unknown error for other types of errors', async () => {
    const queryFunction = jest.fn().mockRejectedValue(new AppError('Unknown error'));
    await expect(prismaHandler.executeQuery(queryFunction)).rejects.toThrowError('Unknown error occurred');
  });
});
