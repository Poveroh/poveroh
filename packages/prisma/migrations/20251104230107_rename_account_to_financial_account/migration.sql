/*
  Warnings:

  - You are about to drop the column `accountId` on the `Amount` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Import` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `BankAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `financialAccountId` to the `Amount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `financialAccountId` to the `Import` table without a default value. This is not possible if the table is not empty.
  - Added the required column `financialAccountId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FinancialAccountType" AS ENUM ('ONLINE_BANK', 'BANK_ACCOUNT', 'CIRCUIT', 'DEPOSIT_BANK', 'BROKER');

-- DropForeignKey
ALTER TABLE "public"."Amount" DROP CONSTRAINT "Amount_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BankAccount" DROP CONSTRAINT "BankAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Import" DROP CONSTRAINT "Import_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_accountId_fkey";

-- DropIndex
DROP INDEX "public"."Amount_accountId_idx";

-- DropIndex
DROP INDEX "public"."Subscription_accountId_idx";

-- AlterTable
ALTER TABLE "Amount" DROP COLUMN "accountId",
ADD COLUMN     "financialAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Import" DROP COLUMN "accountId",
ADD COLUMN     "financialAccountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "accountId",
ADD COLUMN     "financialAccountId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."BankAccount";

-- DropEnum
DROP TYPE "public"."AccountType";

-- CreateTable
CREATE TABLE "FinancialAccounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL DEFAULT 'BANK_ACCOUNT',
    "logoIcon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialAccounts_userId_idx" ON "FinancialAccounts"("userId");

-- CreateIndex
CREATE INDEX "Amount_financialAccountId_idx" ON "Amount"("financialAccountId");

-- CreateIndex
CREATE INDEX "Subscription_financialAccountId_idx" ON "Subscription"("financialAccountId");

-- AddForeignKey
ALTER TABLE "FinancialAccounts" ADD CONSTRAINT "FinancialAccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amount" ADD CONSTRAINT "Amount_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
