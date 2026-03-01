import prisma from '@poveroh/prisma'

export const UserHelper = {
    getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }
}
