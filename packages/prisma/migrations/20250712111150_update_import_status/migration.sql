/*
  Warnings:

  - The values [IMPORTING] on the enum `ImportStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImportStatus_new" AS ENUM ('APPROVED', 'REJECTED', 'IMPORT_PENDING', 'IMPORT_REJECTED', 'IMPORT_APPROVED');
ALTER TABLE "imports" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "imports" ALTER COLUMN "status" TYPE "ImportStatus_new" USING ("status"::text::"ImportStatus_new");
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "ImportStatus_new" USING ("status"::text::"ImportStatus_new");
ALTER TYPE "ImportStatus" RENAME TO "ImportStatus_old";
ALTER TYPE "ImportStatus_new" RENAME TO "ImportStatus";
DROP TYPE "ImportStatus_old";
ALTER TABLE "imports" ALTER COLUMN "status" SET DEFAULT 'IMPORT_PENDING';
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'REJECTED';
COMMIT;

-- AlterTable
ALTER TABLE "imports" ALTER COLUMN "status" SET DEFAULT 'IMPORT_PENDING';
