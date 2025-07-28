/*
  Warnings:

  - The values [INTERNAL] on the enum `TransactionAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionAction_new" AS ENUM ('TRANSFER', 'EXPENSES', 'INCOME');
ALTER TABLE "Amount" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "Transaction" ALTER COLUMN "action" TYPE "TransactionAction_new" USING ("action"::text::"TransactionAction_new");
ALTER TABLE "Category" ALTER COLUMN "for" TYPE "TransactionAction_new" USING ("for"::text::"TransactionAction_new");
ALTER TABLE "Amount" ALTER COLUMN "action" TYPE "TransactionAction_new" USING ("action"::text::"TransactionAction_new");
ALTER TYPE "TransactionAction" RENAME TO "TransactionAction_old";
ALTER TYPE "TransactionAction_new" RENAME TO "TransactionAction";
DROP TYPE "TransactionAction_old";
ALTER TABLE "Amount" ALTER COLUMN "action" SET DEFAULT 'EXPENSES';
ALTER TABLE "Transaction" ALTER COLUMN "action" SET DEFAULT 'EXPENSES';
COMMIT;
