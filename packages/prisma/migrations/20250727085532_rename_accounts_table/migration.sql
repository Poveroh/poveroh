/*
  Warnings:

  - You are about to drop the column `bankAccountId` on the `Amount` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountId` on the `Import` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `BankAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountId` to the `Amount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Import` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ONLINE_BANK', 'BANK_ACCOUNT', 'CIRCUIT', 'DEPOSIT_BANK', 'BROKER');

-- DropForeignKey
ALTER TABLE "Amount" DROP CONSTRAINT "Amount_bankAccountId_fkey";

-- DropForeignKey
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "Import" DROP CONSTRAINT "Import_bankAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_bankAccountId_fkey";

-- DropIndex
DROP INDEX "Amount_bankAccountId_idx";

-- DropIndex
DROP INDEX "Subscription_bankAccountId_idx";

-- AlterTable
ALTER TABLE "Amount" DROP COLUMN "bankAccountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Import" DROP COLUMN "bankAccountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "bankAccountId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BankAccount";

-- DropEnum
DROP TYPE "BankAccountType";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'BANK_ACCOUNT',
    "logoIcon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Amount_accountId_idx" ON "Amount"("accountId");

-- CreateIndex
CREATE INDEX "Subscription_accountId_idx" ON "Subscription"("accountId");

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amount" ADD CONSTRAINT "Amount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
