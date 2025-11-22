import prisma from '@poveroh/prisma'

export const UserHelper = {
    getUser(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }
}
