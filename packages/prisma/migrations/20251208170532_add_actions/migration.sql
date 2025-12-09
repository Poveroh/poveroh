-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "action" "TransactionAction" NOT NULL DEFAULT 'EXPENSES';
