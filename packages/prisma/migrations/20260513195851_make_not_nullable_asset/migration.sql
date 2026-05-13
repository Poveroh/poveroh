/*
  Warnings:

  - Made the column `currentValue` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentValueAsOf` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalInvested` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantityChange` on table `AssetTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitPrice` on table `AssetTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalAmount` on table `AssetTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `settlementDate` on table `AssetTransaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acquisitionCost` on table `CollectibleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acquisitionDate` on table `CollectibleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `appraisalValue` on table `CollectibleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `appraisalDate` on table `CollectibleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `policyNumber` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `premiumPaid` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `surrenderValue` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `beneficiary` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endDate` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `insurer` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `policyType` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `premiumFrequency` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startDate` on table `InsuranceAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `symbol` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isin` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assetClass` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `exchange` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastPriceSync` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sector` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `committedAmount` on table `PrivateDealAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `calledAmount` on table `PrivateDealAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latestNav` on table `PrivateDealAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `navDate` on table `PrivateDealAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `RealEstateAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchasePrice` on table `RealEstateAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchaseDate` on table `RealEstateAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `VehicleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchasePrice` on table `VehicleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchaseDate` on table `VehicleAsset` required. This step will fail if there are existing NULL values in that column.
  - Made the column `plateNumber` on table `VehicleAsset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "currentValue" SET NOT NULL,
ALTER COLUMN "currentValueAsOf" SET NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "totalInvested" SET NOT NULL;

-- AlterTable
ALTER TABLE "AssetTransaction" ALTER COLUMN "quantityChange" SET NOT NULL,
ALTER COLUMN "unitPrice" SET NOT NULL,
ALTER COLUMN "totalAmount" SET NOT NULL,
ALTER COLUMN "settlementDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "CollectibleAsset" ALTER COLUMN "acquisitionCost" SET NOT NULL,
ALTER COLUMN "acquisitionDate" SET NOT NULL,
ALTER COLUMN "appraisalValue" SET NOT NULL,
ALTER COLUMN "appraisalDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "InsuranceAsset" ALTER COLUMN "policyNumber" SET NOT NULL,
ALTER COLUMN "premiumPaid" SET NOT NULL,
ALTER COLUMN "surrenderValue" SET NOT NULL,
ALTER COLUMN "beneficiary" SET NOT NULL,
ALTER COLUMN "endDate" SET NOT NULL,
ALTER COLUMN "insurer" SET NOT NULL,
ALTER COLUMN "policyType" SET NOT NULL,
ALTER COLUMN "premiumFrequency" SET NOT NULL,
ALTER COLUMN "startDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "MarketableAsset" ALTER COLUMN "symbol" SET NOT NULL,
ALTER COLUMN "isin" SET NOT NULL,
ALTER COLUMN "assetClass" SET NOT NULL,
ALTER COLUMN "exchange" SET NOT NULL,
ALTER COLUMN "lastPriceSync" SET NOT NULL,
ALTER COLUMN "region" SET NOT NULL,
ALTER COLUMN "sector" SET NOT NULL;

-- AlterTable
ALTER TABLE "PrivateDealAsset" ALTER COLUMN "committedAmount" SET NOT NULL,
ALTER COLUMN "calledAmount" SET NOT NULL,
ALTER COLUMN "latestNav" SET NOT NULL,
ALTER COLUMN "navDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "RealEstateAsset" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "purchasePrice" SET NOT NULL,
ALTER COLUMN "purchaseDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "VehicleAsset" ALTER COLUMN "year" SET NOT NULL,
ALTER COLUMN "purchasePrice" SET NOT NULL,
ALTER COLUMN "purchaseDate" SET NOT NULL,
ALTER COLUMN "plateNumber" SET NOT NULL;
