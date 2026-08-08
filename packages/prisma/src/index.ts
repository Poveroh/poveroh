import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { decimalToNumberExtension } from './extensions/decimal-to-number.extension'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter }).$extends(decimalToNumberExtension)

export { Prisma }
export default prisma
