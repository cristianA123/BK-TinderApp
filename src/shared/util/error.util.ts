import AppError from '../errors/app.error';

export class InternalServerError extends AppError {
    constructor(message: string, errorCode = -30) {
        super(message, 500, errorCode, true);
    }
}

export class NotAuth extends AppError {
    constructor(message: string, errorCode = -40) {
        super(message, 401, errorCode, true);
    }
}