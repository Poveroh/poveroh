/*
  Warnings:

  - The `status` column on the `imports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('APPROVED', 'REJECTED', 'IMPORT_PENDING', 'IMPORT_REJECTED', 'IMPORT_APPROVED');

-- AlterTable
ALTER TABLE "imports" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'IMPORT_PENDING';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'REJECTED';

-- DropEnum
DROP TYPE "ImportStatus";

-- CreateIndex
CREATE INDEX "imports_status_idx" ON "imports"("status");
