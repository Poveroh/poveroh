/*
  Warnings:

  - The values [TRANSFER] on the enum `TransactionAction` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `amount` on the `Amount` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,2)`.
  - You are about to alter the column `amount` on the `Subscription` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,2)`.
  - You are about to drop the column `action` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionAction_new" AS ENUM ('EXPENSES', 'INCOME');
ALTER TABLE "public"."Amount" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "public"."Transaction" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "Amount" ALTER COLUMN "action" TYPE "TransactionAction_new" USING ("action"::text::"TransactionAction_new");
ALTER TABLE "Category" ALTER COLUMN "for" TYPE "TransactionAction_new" USING ("for"::text::"TransactionAction_new");
ALTER TABLE "Transaction" ALTER COLUMN "action" TYPE "TransactionAction_new" USING ("action"::text::"TransactionAction_new");
ALTER TYPE "TransactionAction" RENAME TO "TransactionAction_old";
ALTER TYPE "TransactionAction_new" RENAME TO "TransactionAction";
DROP TYPE "public"."TransactionAction_old";
ALTER TABLE "Amount" ALTER COLUMN "action" SET DEFAULT 'EXPENSES';
COMMIT;

-- AlterTable
ALTER TABLE "Amount" ADD COLUMN     "importReference" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,2);

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,2);

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "action",
ADD COLUMN     "isTransferLeg" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transferHash" VARCHAR(64),
ADD COLUMN     "transferId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transferDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "note" TEXT,
    "fromTransactionId" TEXT,
    "toTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_fromTransactionId_key" ON "Transfer"("fromTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfer_toTransactionId_key" ON "Transfer"("toTransactionId");

-- CreateIndex
CREATE INDEX "Transfer_userId_idx" ON "Transfer"("userId");

-- CreateIndex
CREATE INDEX "Transfer_transferDate_idx" ON "Transfer"("transferDate");

-- CreateIndex
CREATE INDEX "Transfer_fromTransactionId_idx" ON "Transfer"("fromTransactionId");

-- CreateIndex
CREATE INDEX "Transfer_toTransactionId_idx" ON "Transfer"("toTransactionId");

-- CreateIndex
CREATE INDEX "Transfer_userId_transferDate_idx" ON "Transfer"("userId", "transferDate");

-- CreateIndex
CREATE INDEX "Transaction_isTransferLeg_idx" ON "Transaction"("isTransferLeg");

-- CreateIndex
CREATE INDEX "Transaction_transferId_idx" ON "Transaction"("transferId");

-- CreateIndex
CREATE INDEX "Transaction_transferHash_idx" ON "Transaction"("transferHash");

-- CreateIndex
CREATE INDEX "Transaction_importId_idx" ON "Transaction"("importId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromTransactionId_fkey" FOREIGN KEY ("fromTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toTransactionId_fkey" FOREIGN KEY ("toTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
