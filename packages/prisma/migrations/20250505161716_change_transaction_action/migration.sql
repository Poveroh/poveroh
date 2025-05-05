/*
  Warnings:

  - The values [INTERNAL_TRANSFER] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('INTERNAL', 'EXPENSES', 'INCOME');
ALTER TABLE "amounts" ALTER COLUMN "action" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TABLE "categories" ALTER COLUMN "for" TYPE "TransactionType_new" USING ("for"::text::"TransactionType_new");
ALTER TABLE "amounts" ALTER COLUMN "action" TYPE "TransactionType_new" USING ("action"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
ALTER TABLE "amounts" ALTER COLUMN "action" SET DEFAULT 'EXPENSES';
ALTER TABLE "transactions" ALTER COLUMN "type" SET DEFAULT 'EXPENSES';
COMMIT;
