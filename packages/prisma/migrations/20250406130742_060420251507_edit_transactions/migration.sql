/*
  Warnings:

  - You are about to drop the `internal_transfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'INTERNAL_TRANSFER';

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_bank_account_from_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_bank_account_to_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_category_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_transfer" DROP CONSTRAINT "internal_transfer_user_id_fkey";

-- AlterTable
ALTER TABLE "amounts" ADD COLUMN     "action" "TransactionType" NOT NULL DEFAULT 'EXPENSES';

-- DropTable
DROP TABLE "internal_transfer";
