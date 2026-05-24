/*
  Warnings:

  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateFormat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredCurrency` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredLanguage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredMarketDataProviderId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotFrequency` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetTransaction" ALTER COLUMN "quantityChange" DROP NOT NULL,
ALTER COLUMN "unitPrice" DROP NOT NULL,
ALTER COLUMN "totalAmount" DROP NOT NULL,
ALTER COLUMN "settlementDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CollectibleAsset" ALTER COLUMN "acquisitionCost" DROP NOT NULL,
ALTER COLUMN "acquisitionDate" DROP NOT NULL,
ALTER COLUMN "appraisalValue" DROP NOT NULL,
ALTER COLUMN "appraisalDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InsuranceAsset" ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MarketableAsset" ALTER COLUMN "isin" DROP NOT NULL,
ALTER COLUMN "assetClass" DROP NOT NULL,
ALTER COLUMN "exchange" DROP NOT NULL,
ALTER COLUMN "lastPriceSync" DROP NOT NULL,
ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "sector" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PrivateDealAsset" ALTER COLUMN "committedAmount" DROP NOT NULL,
ALTER COLUMN "calledAmount" DROP NOT NULL,
ALTER COLUMN "latestNav" DROP NOT NULL,
ALTER COLUMN "navDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RealEstateAsset" ALTER COLUMN "purchaseDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "country",
DROP COLUMN "dateFormat",
DROP COLUMN "preferredCurrency",
DROP COLUMN "preferredLanguage",
DROP COLUMN "preferredMarketDataProviderId",
DROP COLUMN "snapshotFrequency",
DROP COLUMN "timezone";

-- AlterTable
ALTER TABLE "VehicleAsset" ALTER COLUMN "purchaseDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotFrequency" "SnapshotFrequency" NOT NULL DEFAULT 'MONTHLY',
    "preferredCurrency" "Currency" NOT NULL DEFAULT 'EUR',
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "dateFormat" "DateFormat" NOT NULL DEFAULT 'DD_MM_YYYY',
    "country" "Countries" NOT NULL DEFAULT 'ITALY',
    "timezone" "Timezone" NOT NULL DEFAULT 'ETC_UTC',
    "preferredMarketDataProviderId" TEXT DEFAULT 'yahoo-finance',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
