import { PrismaClient } from '@repo/prisma'

const prismaClientSingleton = () => {
    return new PrismaClient()
}
const prisma = prismaClientSingleton();

export default prisma;
