/*
  Warnings:

  - Added the required column `bank_account_id` to the `imports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "imports" ADD COLUMN     "bank_account_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
