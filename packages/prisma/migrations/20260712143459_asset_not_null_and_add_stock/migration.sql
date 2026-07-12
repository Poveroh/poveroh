/*
  Warnings:

  - Made the column `assetClass` on table `MarketableAsset` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "MarketableAssetClass" ADD VALUE 'STOCK';

-- AlterTable
ALTER TABLE "MarketableAsset" ALTER COLUMN "assetClass" SET NOT NULL;
