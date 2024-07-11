import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import ResponseDTO from '../DTO/response.dto';
import { textResponses } from '../shared/util/constants.util';
import AppError from '../shared/errors/app.error';
import { enumUtil } from '../shared/util/enum.util';
import PrismaHandler from '../handler/prisma.handler';
import ProfileDataDTO from '../DTO/profileData.dto';


const prismaHandler = new PrismaHandler();

class ProfileManager {
    private prisma: PrismaClient;

    constructor(prisma:PrismaClient) {
        this.prisma = prisma;
    }

    public async profile(req: Request, res: Response, next: NextFunction): Promise<any> {

        try {
            const { uuid } = req.body;
            if (!uuid) {
                throw new AppError(textResponses.badParameters, 400, enumUtil.badParametersInput);
            }

            const response: ResponseDTO = { status: "ok", message: textResponses.success, data: {} };
    
            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.findUnique({
                    where: { uuid },
                });
            });

            console.log(user?.id)
    
            if (!user) {
                response.status = "fail";
                response.message = textResponses.incorrectCredentials;
                return res.status(200).json(response);
            }

            const profile = await prismaHandler.executeQuery(async () => {
                return await this.prisma.profile.findUnique({
                    where: { userId: user.id },
                });
            });

            console.log(profile)
            if (profile) {
                response.data.profile = profile;
            } else {
                response.status = "fail";
                response.message = "No se encontró el perfil del usuario.";
            }

            return res.status(200).json(response);
    
        } catch (error) {
            console.log("error Profilemanager.profile =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { 
            firstName,
            lastName,
            age,
            gender,
            bio,
            location,
            photoUrl,
            userId
        } = req.body;
    
        try {
            const response: ResponseDTO = { status: "ok", message: textResponses.createdResponse, data: {} };
    
            if (userId) {
                const profileData: ProfileDataDTO = {
                    firstName,
                    lastName,
                    age,
                    gender,
                    bio,
                    location,
                    photoUrl,
                    userId
                };
                
                const profile = await prismaHandler.executeQuery(async () => {
                    return this.prisma.profile.create({ data: profileData });
                });
    
                response.data.profile = profile;
                res.status(200).send(response);
            } else {
                throw new AppError(textResponses.badParameters, 400, enumUtil.badParametersInput);
            }
    
        } catch (error) {
            console.log("error Profilemanager.createProfile =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

    public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<any> {

        const { 
            firstName,
            lastName,
            age,
            gender,
            bio,
            location,
            photoUrl,
            id
         } = req.body;

        try {

            const { uuid } = req.body;
            if (!uuid) {
                throw new AppError(textResponses.badParameters, 400, enumUtil.badParametersInput);
            }
    
            const response: ResponseDTO = { status: "ok", message: textResponses.success, data: {} };
    
            const user = await prismaHandler.executeQuery(async () => {
                return await this.prisma.user.findUnique({
                    where: { uuid },
                });
            });

            if (!user) {
                response.status = "fail";
                response.message = textResponses.incorrectCredentials;
                return res.status(200).json(response);
            }

            const profileData = {
                firstName,
                lastName,
                age,
                gender,
                bio,
                location,
                photoUrl,
            };
           
            const profile = await prismaHandler.executeQuery(async () => {
                return await this.prisma.profile.update({
                    where: {
                       id
                    },
                    data: profileData,
                })
            });

            if (profile) {
                response.data.profile = profile
            } else {
                response.status = "fail"
                response.message = textResponses.incorrectCredentials
            }
            res.status(200).send(response);
    
        } catch (error) {
            console.log("error Profilemanager.createUser =", error);
            next(error instanceof AppError ? error : new AppError((error as Error).message, 500, enumUtil.functionalError));
        }
    }

}

export default ProfileManager;