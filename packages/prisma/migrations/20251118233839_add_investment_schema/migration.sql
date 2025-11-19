-- CreateEnum
CREATE TYPE "SnapshotFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'CRYPTOCURRENCY', 'REAL_ESTATE', 'COLLECTIBLE', 'PRIVATE_EQUITY', 'VENTURE_CAPITAL', 'PRIVATE_DEBT', 'P2P_LENDING', 'INSURANCE_POLICY', 'AGRICULTURAL_LAND', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FinancialAccountType" ADD VALUE 'WALLET';
ALTER TYPE "FinancialAccountType" ADD VALUE 'CASH';
ALTER TYPE "FinancialAccountType" ADD VALUE 'CREDIT_CARD';
ALTER TYPE "FinancialAccountType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "baseCurrency" "Currency" NOT NULL DEFAULT 'EUR',
ADD COLUMN     "snapshotFrequency" "SnapshotFrequency" NOT NULL DEFAULT 'MONTHLY';

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AssetType" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketableAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "symbol" TEXT,
    "isin" TEXT,

    CONSTRAINT "MarketableAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "address" TEXT,
    "purchasePrice" DECIMAL(20,2),
    "purchaseDate" TIMESTAMP(3),
    "currentValue" DECIMAL(20,2),

    CONSTRAINT "RealEstateAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectibleAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "acquisitionCost" DECIMAL(20,2),
    "acquisitionDate" TIMESTAMP(3),
    "appraisalValue" DECIMAL(20,2),
    "appraisalDate" TIMESTAMP(3),

    CONSTRAINT "CollectibleAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateDealAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "committedAmount" DECIMAL(20,2),
    "calledAmount" DECIMAL(20,2),
    "latestNav" DECIMAL(20,2),
    "navDate" TIMESTAMP(3),

    CONSTRAINT "PrivateDealAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "policyNumber" TEXT,
    "premiumPaid" DECIMAL(20,2),
    "surrenderValue" DECIMAL(20,2),

    CONSTRAINT "InsuranceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetTransaction" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantityChange" DECIMAL(20,10) NOT NULL,
    "unitPrice" DECIMAL(20,8),
    "totalAmount" DECIMAL(20,2),
    "fees" DECIMAL(10,2),
    "note" TEXT,

    CONSTRAINT "AssetTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMPTZ NOT NULL,
    "note" TEXT,
    "totalCash" DECIMAL(20,2) NOT NULL,
    "totalInvestments" DECIMAL(20,2) NOT NULL,
    "totalNetWorth" DECIMAL(20,2) NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotAccountBalance" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "balance" DECIMAL(20,2) NOT NULL,

    CONSTRAINT "SnapshotAccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotAssetValue" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(20,10),
    "unitPrice" DECIMAL(20,8),
    "totalValue" DECIMAL(20,2) NOT NULL,

    CONSTRAINT "SnapshotAssetValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE INDEX "Asset_userId_type_idx" ON "Asset"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MarketableAsset_assetId_key" ON "MarketableAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAsset_assetId_key" ON "RealEstateAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "CollectibleAsset_assetId_key" ON "CollectibleAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateDealAsset_assetId_key" ON "PrivateDealAsset"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceAsset_assetId_key" ON "InsuranceAsset"("assetId");

-- CreateIndex
CREATE INDEX "AssetTransaction_assetId_idx" ON "AssetTransaction"("assetId");

-- CreateIndex
CREATE INDEX "AssetTransaction_assetId_date_idx" ON "AssetTransaction"("assetId", "date");

-- CreateIndex
CREATE INDEX "Snapshot_userId_snapshotDate_idx" ON "Snapshot"("userId", "snapshotDate" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_userId_snapshotDate_key" ON "Snapshot"("userId", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotAccountBalance_snapshotId_accountId_key" ON "SnapshotAccountBalance"("snapshotId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotAssetValue_snapshotId_assetId_key" ON "SnapshotAssetValue"("snapshotId", "assetId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketableAsset" ADD CONSTRAINT "MarketableAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateAsset" ADD CONSTRAINT "RealEstateAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectibleAsset" ADD CONSTRAINT "CollectibleAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateDealAsset" ADD CONSTRAINT "PrivateDealAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceAsset" ADD CONSTRAINT "InsuranceAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransaction" ADD CONSTRAINT "AssetTransaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAccountBalance" ADD CONSTRAINT "SnapshotAccountBalance_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAccountBalance" ADD CONSTRAINT "SnapshotAccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAssetValue" ADD CONSTRAINT "SnapshotAssetValue_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAssetValue" ADD CONSTRAINT "SnapshotAssetValue_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
