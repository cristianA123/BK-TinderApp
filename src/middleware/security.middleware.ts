import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { textResponses } from '../shared/util/constants.util';
import { NotAuth } from '../shared/util/error.util';
import AppError from '../shared/errors/app.error';
import { enumUtil } from '../shared/util/enum.util';

dotenv.config();

class SecurityMiddleware {
    private jwt_key: string;

    constructor() {
        this.jwt_key = process.env.JWT_TOKEN || '';
    }

    public createToken(id:string): string {
        return jwt.sign( { _foo: id, new: true }, this.jwt_key, { expiresIn: '1d' });
    }

    public decodeToken(token:string): JwtPayload {
        return jwt.verify(token, this.jwt_key)  as JwtPayload;
    }

    public validateToken(req: Request, _res: Response, next: NextFunction): void {
        const {authorization} = req.headers;
        if (authorization) {
            try {
            const [bearerPrefix, token] = authorization.split(' ');

            if (bearerPrefix.toLowerCase() !== 'bearer' || !token) {
                throw new NotAuth(textResponses.invalidToken,enumUtil.errorAuth)
            }
                const decoded = this.decodeToken(token)
                req.body.uuid = (decoded as JwtPayload)._foo;
                next();
            } catch (error: unknown) {
                if (error instanceof JsonWebTokenError) {
                    console.error('Error al decodificar el token JWT');
                    throw new NotAuth(textResponses.invalidToken,enumUtil.errorAuth)
                } else {
                    console.error('Error desconocido:', error);
                    next(new AppError('Unknown error', 500, enumUtil.functionalError));
                }
            }
        }else{
            throw new NotAuth(textResponses.nonToken,enumUtil.errorAuth)
        }

    }
}
export default SecurityMiddleware;