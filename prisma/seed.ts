import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const userList = [
        {
            email: "jleccac@utp.edu.pe",
            uuid: uuidv4(),
            firstName:"Javier",
            lastName:"Lecca",
            password: "utp@jleccac",
            userName: "jleccac"
        },
        {
            email: "cchipana@utp.edu.pe",
            uuid: uuidv4(),
            firstName:"Cristian",
            lastName:"Chipana",
            password: "utp@cchipana",
            userName: "cchipana"
        },
    ]

    await prisma.user.createMany({ data: userList })

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });