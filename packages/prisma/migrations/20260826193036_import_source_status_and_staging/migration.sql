-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING', 'PENDING_REVIEW', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('CSV', 'BANK_SYNC', 'MANUAL', 'API');

-- AlterTable
ALTER TABLE "BankConnection" ADD COLUMN     "autoApproveTransactions" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Import" ADD COLUMN     "autoApprove" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bankConnectionId" TEXT,
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "source" "ImportSource" NOT NULL DEFAULT 'CSV',
ADD COLUMN     "sourceReference" TEXT;

-- Move Import.status onto its own enum, converting every existing row in place instead of dropping
-- the column: an import awaiting review becomes PENDING_REVIEW, a completed one becomes COMPLETED.
-- IMPORT_REJECTED was never written to an import by the application, so it folds into PENDING_REVIEW.
ALTER TABLE "Import" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Import" ALTER COLUMN "status" TYPE "ImportStatus" USING (
    CASE "status"::text
        WHEN 'APPROVED' THEN 'COMPLETED'
        WHEN 'IMPORT_APPROVED' THEN 'COMPLETED'
        ELSE 'PENDING_REVIEW'
    END::"ImportStatus"
);
ALTER TABLE "Import" ALTER COLUMN "status" SET DEFAULT 'PROCESSING';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "subscriptionId" TEXT;

-- CreateTable
CREATE TABLE "ImportStagedTransaction" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "action" "TransactionAction" NOT NULL,
    "externalTransactionId" TEXT,
    "bankSyncAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportStagedTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportStagedTransaction_importId_idx" ON "ImportStagedTransaction"("importId");

-- CreateIndex
CREATE UNIQUE INDEX "ImportStagedTransaction_importId_externalTransactionId_key" ON "ImportStagedTransaction"("importId", "externalTransactionId");

-- Import_status_idx is intentionally not recreated: converting the column in place leaves the
-- existing index on it untouched.
-- CreateIndex
CREATE INDEX "Import_userId_source_idx" ON "Import"("userId", "source");

-- CreateIndex
CREATE INDEX "Import_bankConnectionId_idx" ON "Import"("bankConnectionId");

-- CreateIndex
CREATE INDEX "Transaction_subscriptionId_idx" ON "Transaction"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Import" ADD CONSTRAINT "Import_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportStagedTransaction" ADD CONSTRAINT "ImportStagedTransaction_importId_fkey" FOREIGN KEY ("importId") REFERENCES "Import"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill the source of imports created before this column existed: an import whose transactions
-- carry a bank connection came from a sync run, everything else was a CSV upload (the default).
-- The connection and its provider are lifted onto the import so the source survives on the row
-- itself rather than being re-derived from the transactions every time.
UPDATE "Import" i
SET "source" = 'BANK_SYNC',
    "bankConnectionId" = linked."bankConnectionId",
    "sourceReference" = c."providerId"
FROM (
    SELECT DISTINCT ON ("importId") "importId", "bankConnectionId"
    FROM "Transaction"
    WHERE "importId" IS NOT NULL AND "bankConnectionId" IS NOT NULL
    ORDER BY "importId", "createdAt"
) AS linked
JOIN "BankConnection" c ON c."id" = linked."bankConnectionId"
WHERE i."id" = linked."importId";
