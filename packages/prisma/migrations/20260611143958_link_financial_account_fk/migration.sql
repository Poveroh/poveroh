/*
  Warnings:

  - You are about to drop the column `totalCash` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `totalInvestments` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `totalLiabilities` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `totalNetWorth` on the `Snapshot` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `SnapshotAccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `fxRate` on the `SnapshotAccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `originalCurrency` on the `SnapshotAccountBalance` table. All the data in the column will be lost.
  - You are about to drop the column `originalValue` on the `SnapshotAccountBalance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Snapshot" DROP COLUMN "totalCash",
DROP COLUMN "totalInvestments",
DROP COLUMN "totalLiabilities",
DROP COLUMN "totalNetWorth";

-- AlterTable
ALTER TABLE "SnapshotAccountBalance" DROP COLUMN "balance",
DROP COLUMN "fxRate",
DROP COLUMN "originalCurrency",
DROP COLUMN "originalValue",
ADD COLUMN     "financialAccountBalanceId" TEXT;

-- CreateIndex
CREATE INDEX "SnapshotAccountBalance_financialAccountBalanceId_idx" ON "SnapshotAccountBalance"("financialAccountBalanceId");

-- AddForeignKey
ALTER TABLE "SnapshotAccountBalance" ADD CONSTRAINT "SnapshotAccountBalance_financialAccountBalanceId_fkey" FOREIGN KEY ("financialAccountBalanceId") REFERENCES "FinancialAccountBalance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
