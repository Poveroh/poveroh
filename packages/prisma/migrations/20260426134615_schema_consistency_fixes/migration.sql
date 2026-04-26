/*
  Warnings:

  - You are about to alter the column `cycleNumber` on the `Subscription` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to drop the column `transferHash` on the `Transaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LiabilityType" AS ENUM ('MORTGAGE', 'LOAN', 'CREDIT_LINE', 'OTHER');

-- CreateEnum
CREATE TYPE "MortgageType" AS ENUM ('FIRST_HOME', 'SECOND_HOME', 'INVESTMENT', 'REFINANCE');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'CAR', 'STUDENT', 'CONSUMER', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "InterestRateType" AS ENUM ('FIXED', 'VARIABLE', 'MIXED');

-- CreateEnum
CREATE TYPE "LiabilityTransactionType" AS ENUM ('PAYMENT', 'EXTRA_PAYMENT', 'INTEREST_CHARGE', 'FEE', 'RATE_CHANGE', 'DISBURSEMENT');

-- DropForeignKey
ALTER TABLE "SnapshotAccountBalance" DROP CONSTRAINT "SnapshotAccountBalance_accountId_fkey";

-- DropForeignKey
ALTER TABLE "SnapshotAssetValue" DROP CONSTRAINT "SnapshotAssetValue_assetId_fkey";

-- DropIndex
DROP INDEX "Asset_userId_idx";

-- DropIndex
DROP INDEX "AssetTransaction_assetId_idx";

-- DropIndex
DROP INDEX "AutoDepreciation_assetId_idx";

-- DropIndex
DROP INDEX "Transaction_date_idx";

-- DropIndex
DROP INDEX "Transaction_transferHash_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "Transfer_userId_idx";

-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "totalLiabilities" DECIMAL(20,2) NOT NULL DEFAULT 0,
ALTER COLUMN "snapshotDate" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "SnapshotAccountBalance" ADD COLUMN     "fxRate" DECIMAL(20,10),
ADD COLUMN     "originalCurrency" "Currency",
ADD COLUMN     "originalValue" DECIMAL(20,2),
ALTER COLUMN "accountId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SnapshotAssetValue" ALTER COLUMN "assetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "cycleNumber" SET DEFAULT 1,
ALTER COLUMN "cycleNumber" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transferHash";

-- CreateTable
CREATE TABLE "Liability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "LiabilityType" NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "principalAmount" DECIMAL(20,2) NOT NULL,
    "currentBalance" DECIMAL(20,2) NOT NULL,
    "interestRate" DECIMAL(8,5),
    "interestRateType" "InterestRateType",
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "durationMonths" INTEGER,
    "monthlyPayment" DECIMAL(20,2),
    "financialAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MortgageLiability" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "mortgageType" "MortgageType" NOT NULL,
    "lender" TEXT,
    "propertyAddress" TEXT,
    "ltv" DECIMAL(5,2),
    "fixedPeriodMonths" INTEGER,
    "indexedTo" TEXT,
    "spread" DECIMAL(8,5),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "MortgageLiability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanLiability" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "lender" TEXT,
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "LoanLiability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiabilityTransaction" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,
    "type" "LiabilityTransactionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(20,2) NOT NULL,
    "principalPart" DECIMAL(20,2),
    "interestPart" DECIMAL(20,2),
    "feesPart" DECIMAL(20,2),
    "currency" "Currency" NOT NULL DEFAULT 'EUR',
    "fxRate" DECIMAL(20,10),
    "financialAccountId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "LiabilityTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SnapshotLiabilityBalance" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "liabilityId" TEXT,
    "balance" DECIMAL(20,2) NOT NULL,
    "originalCurrency" "Currency",
    "originalValue" DECIMAL(20,2),
    "fxRate" DECIMAL(20,10),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "SnapshotLiabilityBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Liability_userId_type_idx" ON "Liability"("userId", "type");

-- CreateIndex
CREATE INDEX "Liability_userId_deletedAt_idx" ON "Liability"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Liability_financialAccountId_idx" ON "Liability"("financialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "MortgageLiability_liabilityId_key" ON "MortgageLiability"("liabilityId");

-- CreateIndex
CREATE UNIQUE INDEX "LoanLiability_liabilityId_key" ON "LoanLiability"("liabilityId");

-- CreateIndex
CREATE INDEX "LiabilityTransaction_liabilityId_type_idx" ON "LiabilityTransaction"("liabilityId", "type");

-- CreateIndex
CREATE INDEX "LiabilityTransaction_liabilityId_date_idx" ON "LiabilityTransaction"("liabilityId", "date" DESC);

-- CreateIndex
CREATE INDEX "LiabilityTransaction_financialAccountId_idx" ON "LiabilityTransaction"("financialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "SnapshotLiabilityBalance_snapshotId_liabilityId_key" ON "SnapshotLiabilityBalance"("snapshotId", "liabilityId");

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Liability" ADD CONSTRAINT "Liability_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortgageLiability" ADD CONSTRAINT "MortgageLiability_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanLiability" ADD CONSTRAINT "LoanLiability_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiabilityTransaction" ADD CONSTRAINT "LiabilityTransaction_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiabilityTransaction" ADD CONSTRAINT "LiabilityTransaction_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAccountBalance" ADD CONSTRAINT "SnapshotAccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotAssetValue" ADD CONSTRAINT "SnapshotAssetValue_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotLiabilityBalance" ADD CONSTRAINT "SnapshotLiabilityBalance_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SnapshotLiabilityBalance" ADD CONSTRAINT "SnapshotLiabilityBalance_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
