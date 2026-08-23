/*
  Warnings:

  - The values [BANK_SYNC_PENDING,BANK_SYNC_APPROVED,BANK_SYNC_REJECTED] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('APPROVED', 'REJECTED', 'IMPORT_PENDING', 'IMPORT_REJECTED', 'IMPORT_APPROVED');
ALTER TABLE "public"."Import" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Transaction" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Import" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TABLE "Transaction" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
ALTER TABLE "Import" ALTER COLUMN "status" SET DEFAULT 'IMPORT_PENDING';
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'APPROVED';
COMMIT;
