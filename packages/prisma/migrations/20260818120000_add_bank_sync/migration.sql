-- CreateEnum
CREATE TYPE "BankSyncConnectionStatus" AS ENUM ('PENDING', 'LINKED', 'ERROR', 'REAUTH_REQUIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "BankSyncTrigger" AS ENUM ('CRON', 'MANUAL', 'WEBHOOK', 'INITIAL');

-- CreateEnum
CREATE TYPE "BankSyncRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'BANK_SYNC_PENDING';
ALTER TYPE "TransactionStatus" ADD VALUE 'BANK_SYNC_APPROVED';
ALTER TYPE "TransactionStatus" ADD VALUE 'BANK_SYNC_REJECTED';

-- AlterTable
ALTER TABLE "Amount" ADD COLUMN     "bankSyncAccountId" TEXT,
ADD COLUMN     "externalTransactionId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "bankConnectionId" TEXT;

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "BankSyncConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "externalConnectionId" TEXT,
    "institutionName" TEXT,
    "ciphertext" BYTEA,
    "iv" BYTEA,
    "authTag" BYTEA,
    "algo" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankSyncAccount" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "externalAccountName" TEXT,
    "currency" "Currency",
    "syncCursor" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "BankSyncAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankSyncRun" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "status" "BankSyncRunStatus" NOT NULL DEFAULT 'RUNNING',
    "trigger" "BankSyncTrigger" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "transactionsAdded" INTEGER NOT NULL DEFAULT 0,
    "transactionsModified" INTEGER NOT NULL DEFAULT 0,
    "transactionsRemoved" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "BankSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankConnection_userId_idx" ON "BankConnection"("userId");

-- CreateIndex
CREATE INDEX "BankConnection_status_idx" ON "BankConnection"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_userId_providerId_externalConnectionId_key" ON "BankConnection"("userId", "providerId", "externalConnectionId");

-- CreateIndex
CREATE INDEX "BankSyncAccount_connectionId_idx" ON "BankSyncAccount"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "BankSyncAccount_connectionId_externalAccountId_key" ON "BankSyncAccount"("connectionId", "externalAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "BankSyncAccount_financialAccountId_key" ON "BankSyncAccount"("financialAccountId");

-- CreateIndex
CREATE INDEX "BankSyncRun_connectionId_startedAt_idx" ON "BankSyncRun"("connectionId", "startedAt");

-- CreateIndex
CREATE INDEX "Amount_bankSyncAccountId_idx" ON "Amount"("bankSyncAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Amount_bankSyncAccountId_externalTransactionId_key" ON "Amount"("bankSyncAccountId", "externalTransactionId");

-- CreateIndex
CREATE INDEX "Transaction_bankConnectionId_idx" ON "Transaction"("bankConnectionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amount" ADD CONSTRAINT "Amount_bankSyncAccountId_fkey" FOREIGN KEY ("bankSyncAccountId") REFERENCES "BankSyncAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankSyncAccount" ADD CONSTRAINT "BankSyncAccount_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankSyncAccount" ADD CONSTRAINT "BankSyncAccount_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankSyncRun" ADD CONSTRAINT "BankSyncRun_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

