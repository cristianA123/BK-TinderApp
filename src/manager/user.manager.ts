import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import UserDataDTO from '../DTO/userData.dto';
import ResponseDTO from '../DTO/response.dto';
import { textResponses } from '../shared/util/constants.util';
import SecurityMiddleware from '../middleware/security.middleware';
import AppError from '../shared/errors/app.error';
import { InternalServerError } from '../shared/util/error.util';
import { enumUtil } from '../shared/util/enum.util';
import PrismaHandler from '../handler/prisma.handler';


const prismaHandler = new PrismaHandler();

class UserManager {
    private prisma: PrismaClient;
    private security: SecurityMiddleware;

    constructor(prisma:PrismaClient) {
        this.prisma = prisma;
        this.security = new SecurityMiddleware();
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email, password} = req.body
        try{
            const response:ResponseDTO = { status:"ok", message:textResponses.success, data: {} }

            if(!email || !password){
                throw new InternalServerError(textResponses.badParameters,enumUtil.badParametersInput)
            }
            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.findUnique({
                    select: {uuid: true}, where: {email: email, password: password}
                })
            });
            if(user){
                const token = this.security.createToken(user.uuid)
                response.data.token = token
                response.data.uuid = user.uuid
            }else{
                response.status = "fail"
                response.message = textResponses.incorrectCredentials
            }
            res.status(200).send(response);

        }catch(error){
            console.log("error usermanager.login =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {email} = req.params;
        const {uuid} = req.body;
        try{
            const response:ResponseDTO = { status:"ok", message:textResponses.success, data: {} }

            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.findUnique({
                    select: {email: true, firstName: true, lastName: true},
                    where: {email: email, uuid: uuid}
                })
            });

            if(user){
                response.data.user = user
            }else{
                response.status = "fail"
                response.message = textResponses.incorrectCredentials
            }
            res.status(200).send(response);
        }catch(error){
            console.log("error usermanager.getProfile =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {email} = req.params;
        try{
            const response:ResponseDTO = { status:"ok", message:textResponses.deleteResponse, data: {} }

            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.delete({
                    where: {email: email}
                })
            });

            if(!user){
                response.status = "fail"
                response.message = textResponses.incorrectCredentials
            }
            res.status(200).send(response);
        }catch(error){
            console.log("error usermanager.deleteUser =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {uuid, email, firstName, lastName} = req.body;
        try{
            const response:ResponseDTO = { status:"ok", message:textResponses.updatedResponse, data: {} }

            if (!uuid || !email || !firstName || !lastName) {
                throw new AppError(textResponses.badParameters, 400, enumUtil.badParametersInput);
            }

            const userData: Partial<UserDataDTO> = { firstName, lastName }
            
            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.update({
                    where: {email, uuid},
                    data: userData,
                })
            });
            
            if(user){
                userData.email = email
                response.data.user = userData
            }else{
                response.status = "fail"
                response.message = textResponses.incorrectCredentials
            }
            res.status(200).send(response);
        }catch(error){
            console.log("error usermanager.updateUser =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { uuid, email, firstName, lastName } = req.body;
        try {
            const response: ResponseDTO = { status: "ok", message: textResponses.createdResponse, data: {} }
    
            if (uuid && email && firstName && lastName && typeof email === 'string') {
                const userData: UserDataDTO = {
                    email,
                    firstName,
                    lastName,
                    uuid: uuidv4(),
                    password: this.createRandomPass(10)
                }
    
                const user = await prismaHandler.executeQuery(async () => {
                    return await this.prisma.user.create({ data: userData })
                });

                if (user) {
                    delete userData.password
                    response.data.user = userData
                } else {
                    response.status = "fail"
                    response.message = textResponses.incorrectCredentials
                }
                res.status(200).send(response);
            } else {
                throw new AppError(textResponses.badParameters, 400, enumUtil.badParametersInput);
            }
    
        } catch (error) {
            console.log("error usermanager.createUser =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    private createRandomPass(longitud: number): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let clave = "";
        Array.from({ length: longitud }).forEach(() => {
            const index = Math.floor(Math.random() * chars.length);
            clave += chars.charAt(index);
        });
        return clave;
    }

}

export default UserManager;