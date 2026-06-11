-- CreateTable
CREATE TABLE "FinancialAccountBalance" (
    "id" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "balance" DECIMAL(20,2) NOT NULL,
    "note" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "FinancialAccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialAccountBalance_financialAccountId_date_idx" ON "FinancialAccountBalance"("financialAccountId", "date" ASC);

-- CreateIndex
CREATE INDEX "FinancialAccountBalance_financialAccountId_idx" ON "FinancialAccountBalance"("financialAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAccountBalance_financialAccountId_date_key" ON "FinancialAccountBalance"("financialAccountId", "date");

-- AddForeignKey
ALTER TABLE "FinancialAccountBalance" ADD CONSTRAINT "FinancialAccountBalance_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "FinancialAccounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
