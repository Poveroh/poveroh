/*
  Warnings:

  - You are about to drop the column `pending_id` on the `pending_transactions_amounts` table. All the data in the column will be lost.
  - You are about to drop the column `pending_id` on the `pending_transactions_media` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `pending_transactions_amounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `pending_transactions_media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pending_transactions_amounts" DROP CONSTRAINT "pending_transactions_amounts_pending_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions_media" DROP CONSTRAINT "pending_transactions_media_pending_id_fkey";

-- DropIndex
DROP INDEX "pending_transactions_amounts_pending_id_idx";

-- DropIndex
DROP INDEX "pending_transactions_media_pending_id_idx";

-- AlterTable
ALTER TABLE "pending_transactions_amounts" DROP COLUMN "pending_id",
ADD COLUMN     "transaction_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pending_transactions_media" DROP COLUMN "pending_id",
ADD COLUMN     "transaction_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "pending_transactions_amounts_transaction_id_idx" ON "pending_transactions_amounts"("transaction_id");

-- CreateIndex
CREATE INDEX "pending_transactions_media_transaction_id_idx" ON "pending_transactions_media"("transaction_id");

-- AddForeignKey
ALTER TABLE "pending_transactions_amounts" ADD CONSTRAINT "pending_transactions_amounts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pending_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions_media" ADD CONSTRAINT "pending_transactions_media_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "pending_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
