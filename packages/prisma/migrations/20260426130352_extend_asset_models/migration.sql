/*
  Warnings:

  - The values [AGRICULTURAL_LAND] on the enum `AssetType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `valueDate` on the `Asset` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MarketableAssetClass" AS ENUM ('EQUITY', 'BOND', 'ETF', 'CRYPTO', 'COMMODITY', 'REIT', 'MIXED');

-- CreateEnum
CREATE TYPE "InsurancePolicyType" AS ENUM ('LIFE', 'UNIT_LINKED', 'INDEX_LINKED', 'PURE_RISK');

-- AlterEnum
BEGIN;
CREATE TYPE "AssetType_new" AS ENUM ('STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'CRYPTOCURRENCY', 'REAL_ESTATE', 'COLLECTIBLE', 'VEHICLE', 'PRIVATE_EQUITY', 'VENTURE_CAPITAL', 'PRIVATE_DEBT', 'P2P_LENDING', 'INSURANCE_POLICY', 'OTHER');
ALTER TABLE "Asset" ALTER COLUMN "type" TYPE "AssetType_new" USING ("type"::text::"AssetType_new");
ALTER TYPE "AssetType" RENAME TO "AssetType_old";
ALTER TYPE "AssetType_new" RENAME TO "AssetType";
DROP TYPE "public"."AssetType_old";
COMMIT;

-- DropIndex
DROP INDEX "AssetTransaction_assetId_date_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "description",
DROP COLUMN "valueDate",
ADD COLUMN     "currentValueAsOf" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AssetTransaction" ADD COLUMN     "financialAccountId" TEXT,
ADD COLUMN     "settlementDate" TIMESTAMP(3),
ADD COLUMN     "taxAmount" DECIMAL(20,2);

-- AlterTable
ALTER TABLE "InsuranceAsset" ADD COLUMN     "beneficiary" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "insurer" TEXT,
ADD COLUMN     "policyType" "InsurancePolicyType",
ADD COLUMN     "premiumFrequency" "CyclePeriod",
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MarketableAsset" ADD COLUMN     "assetClass" "MarketableAssetClass",
ADD COLUMN     "exchange" TEXT,
ADD COLUMN     "lastPriceSync" TIMESTAMP(3),
ADD COLUMN     "region" TEXT,
ADD COLUMN     "sector" TEXT;

-- CreateIndex
CREATE INDEX "Asset_userId_deletedAt_idx" ON "Asset"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "AssetTransaction_assetId_date_idx" ON "AssetTransaction"("assetId", "date" DESC);

-- CreateIndex
CREATE INDEX "AssetTransaction_financialAccountId_idx" ON "AssetTransaction"("financialAccountId");

-- CreateIndex
CREATE INDEX "MarketableAsset_symbol_idx" ON "MarketableAsset"("symbol");

-- CreateIndex
CREATE INDEX "MarketableAsset_isin_idx" ON "MarketableAsset"("isin");

-- AddForeignKey
ALTER TABLE "AssetTransaction" ADD CONSTRAINT "AssetTransaction_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
