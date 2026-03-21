/*
  Warnings:

  - The `onBoardingStep` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OnBoardingStep" AS ENUM ('EMAIL', 'GENERALITES', 'PREFERENCES', 'COMPLETED');

-- AlterTable
ALTER TABLE "Snapshot" ALTER COLUMN "totalCash" SET DEFAULT 0,
ALTER COLUMN "totalInvestments" SET DEFAULT 0,
ALTER COLUMN "totalNetWorth" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onBoardingStep",
ADD COLUMN     "onBoardingStep" "OnBoardingStep" NOT NULL DEFAULT 'GENERALITES';
