/*
  Warnings:

  - You are about to drop the column `currentValue` on the `RealEstateAsset` table. All the data in the column will be lost.
  - Added the required column `type` to the `AssetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AssetTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CollectibleAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InsuranceAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MarketableAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PrivateDealAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `RealEstateAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RealEstateAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SnapshotAccountBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SnapshotAssetValue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DepreciationValueType" AS ENUM ('AMOUNT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "DepreciationBase" AS ENUM ('PURCHASE_PRICE', 'CURRENT_VALUE', 'LAST_SNAPSHOT');

-- CreateEnum
CREATE TYPE "AssetTransactionType" AS ENUM ('BUY', 'SELL', 'DIVIDEND', 'INTEREST', 'FEE', 'DEPOSIT', 'WITHDRAWAL', 'VALUATION_ADJUSTMENT', 'CAPITAL_CALL', 'DISTRIBUTION');

-- CreateEnum
CREATE TYPE "ValueSource" AS ENUM ('MANUAL', 'MARKET', 'APPRAISAL', 'DEPRECIATION', 'IMPORT', 'CALCULATED');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BOAT', 'MOTORCYCLE', 'SNOWMOBILE', 'BIKE', 'OTHER');

-- CreateEnum
CREATE TYPE "RealEstateType" AS ENUM ('PRIMARY_HOUSE', 'SECONDARY_HOUSE', 'RENTAL_PROPERTY');

-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'VEHICLE';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "currentValue" DECIMAL(20,2),
ADD COLUMN     "valueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "AssetTransaction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'EUR',
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "fxRate" DECIMAL(20,10),
ADD COLUMN     "type" "AssetTransactionType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "quantityChange" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CollectibleAsset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "InsuranceAsset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MarketableAsset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PrivateDealAsset" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RealEstateAsset" DROP COLUMN "currentValue",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "type" "RealEstateType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SnapshotAccountBalance" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SnapshotAssetValue" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMPTZ,
ADD COLUMN     "source" "ValueSource" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "VehicleAsset" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "year" INTEGER,
    "purchasePrice" DECIMAL(20,2),
    "purchaseDate" TIMESTAMP(3),
    "plateNumber" TEXT,
    "vin" TEXT,
    "mileage" INTEGER,
    "condition" "AssetCondition",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "VehicleAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoDepreciation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "depreciationBase" "DepreciationBase" NOT NULL DEFAULT 'CURRENT_VALUE',
    "depreciationType" "DepreciationValueType" NOT NULL DEFAULT 'AMOUNT',
    "depreciationValue" DECIMAL(20,4) NOT NULL,
    "cyclePeriod" "CyclePeriod" NOT NULL DEFAULT 'YEAR',
    "cycleNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "AutoDepreciation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleAsset_assetId_key" ON "VehicleAsset"("assetId");

-- CreateIndex
CREATE INDEX "AutoDepreciation_assetId_idx" ON "AutoDepreciation"("assetId");

-- CreateIndex
CREATE INDEX "AutoDepreciation_assetId_startDate_endDate_idx" ON "AutoDepreciation"("assetId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "AssetTransaction_assetId_type_idx" ON "AssetTransaction"("assetId", "type");

-- AddForeignKey
ALTER TABLE "VehicleAsset" ADD CONSTRAINT "VehicleAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoDepreciation" ADD CONSTRAINT "AutoDepreciation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
