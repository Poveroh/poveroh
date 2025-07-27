/*
  Warnings:

  - The `action` column on the `Amount` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - Changed the type of `for` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionAction" AS ENUM ('INTERNAL', 'EXPENSES', 'INCOME');

-- AlterTable
ALTER TABLE "Amount" DROP COLUMN "action",
ADD COLUMN     "action" "TransactionAction" NOT NULL DEFAULT 'EXPENSES';

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "for",
ADD COLUMN     "for" "TransactionAction" NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "type",
ADD COLUMN     "action" "TransactionAction" NOT NULL DEFAULT 'EXPENSES';

-- DropEnum
DROP TYPE "TransactionType";

-- CreateIndex
CREATE INDEX "Amount_action_idx" ON "Amount"("action");

-- CreateIndex
CREATE INDEX "Category_for_idx" ON "Category"("for");
