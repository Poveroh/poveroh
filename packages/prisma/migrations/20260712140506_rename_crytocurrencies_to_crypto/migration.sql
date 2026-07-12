/*
  Warnings:

  - The values [CRYPTOCURRENCY] on the enum `AssetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetType_new" AS ENUM ('STOCK', 'BOND', 'ETF', 'MUTUAL_FUND', 'CRYPTO', 'REAL_ESTATE', 'COLLECTIBLE', 'VEHICLE', 'PRIVATE_EQUITY', 'VENTURE_CAPITAL', 'PRIVATE_DEBT', 'P2P_LENDING', 'INSURANCE_POLICY', 'OTHER');
ALTER TABLE "Asset" ALTER COLUMN "type" TYPE "AssetType_new" USING ("type"::text::"AssetType_new");
ALTER TYPE "AssetType" RENAME TO "AssetType_old";
ALTER TYPE "AssetType_new" RENAME TO "AssetType";
DROP TYPE "public"."AssetType_old";
COMMIT;
