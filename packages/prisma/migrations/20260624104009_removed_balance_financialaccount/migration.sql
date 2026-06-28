/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `FinancialAccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `FinancialAccounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialAccountBalance" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "FinancialAccounts" DROP COLUMN "balance";
