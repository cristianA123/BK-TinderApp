import { Request, Response, NextFunction } from 'express';
import AppError from '../shared/errors/app.error';

const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    if (!err.isOperational) {
        console.error('INTERNAL SERVER ERROR:', err);
    }

    res.status(err.statusCode).send({
        status: 'fail',
        message: err.message,
        errorCode: err.errorCode
    });
};

export default errorHandler;