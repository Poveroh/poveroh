/*
  Warnings:

  - You are about to drop the column `currency` on the `Transfer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_transferId_fkey";

-- AlterTable
ALTER TABLE "Transfer" DROP COLUMN "currency";
