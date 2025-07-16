-- AlterTable
ALTER TABLE "pending_transactions_amounts" ADD COLUMN     "action" "TransactionType" NOT NULL DEFAULT 'EXPENSES';
