/*
  Warnings:

  - You are about to drop the column `isTransferLeg` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_isTransferLeg_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isTransferLeg";
