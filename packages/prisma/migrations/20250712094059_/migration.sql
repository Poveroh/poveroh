/*
  Warnings:

  - You are about to drop the `pending_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_transactions_amounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pending_transactions_media` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pending_transactions" DROP CONSTRAINT "pending_transactions_category_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions" DROP CONSTRAINT "pending_transactions_import_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions" DROP CONSTRAINT "pending_transactions_subcategory_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions" DROP CONSTRAINT "pending_transactions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions_amounts" DROP CONSTRAINT "pending_transactions_amounts_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions_amounts" DROP CONSTRAINT "pending_transactions_amounts_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "pending_transactions_media" DROP CONSTRAINT "pending_transactions_media_transaction_id_fkey";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "import_id" TEXT,
ADD COLUMN     "status" "ImportStatus" NOT NULL DEFAULT 'REJECTED';

-- DropTable
DROP TABLE "pending_transactions";

-- DropTable
DROP TABLE "pending_transactions_amounts";

-- DropTable
DROP TABLE "pending_transactions_media";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;
