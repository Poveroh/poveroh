/*
  Warnings:

  - The values [PENDING,PROCESSING,PARTIALLY_IMPORTED,IMPORTED,FAILED] on the enum `ImportStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImportStatus_new" AS ENUM ('APPROVED', 'REJECTED', 'IMPORTING');
ALTER TABLE "imports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pending_transactions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "imports" ALTER COLUMN "status" TYPE "ImportStatus_new" USING ("status"::text::"ImportStatus_new");
ALTER TABLE "pending_transactions" ALTER COLUMN "status" TYPE "ImportStatus_new" USING ("status"::text::"ImportStatus_new");
ALTER TYPE "ImportStatus" RENAME TO "ImportStatus_old";
ALTER TYPE "ImportStatus_new" RENAME TO "ImportStatus";
DROP TYPE "ImportStatus_old";
ALTER TABLE "imports" ALTER COLUMN "status" SET DEFAULT 'IMPORTING';
ALTER TABLE "pending_transactions" ALTER COLUMN "status" SET DEFAULT 'REJECTED';
COMMIT;

-- AlterTable
ALTER TABLE "imports" ALTER COLUMN "status" SET DEFAULT 'IMPORTING';

-- AlterTable
ALTER TABLE "pending_transactions" ALTER COLUMN "status" SET DEFAULT 'REJECTED';
