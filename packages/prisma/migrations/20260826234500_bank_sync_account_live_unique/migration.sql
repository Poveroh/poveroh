-- Release the account mappings of connections that were already revoked. The previous table-wide
-- unique on "financialAccountId" ignored soft deletes, so those mappings kept occupying their
-- FinancialAccount forever and re-linking the same account through a new connection always failed.
UPDATE "BankSyncAccount" AS a
SET "deletedAt" = COALESCE(c."deletedAt", NOW())
FROM "BankConnection" AS c
WHERE a."connectionId" = c."id"
  AND a."deletedAt" IS NULL
  AND c."deletedAt" IS NOT NULL;

-- DropIndex
DROP INDEX "BankSyncAccount_financialAccountId_key";

-- CreateIndex: uniqueness now only constrains live mappings, so releasing a mapping frees its
-- FinancialAccount while the row is preserved as history for already-imported transactions.
CREATE UNIQUE INDEX "BankSyncAccount_financialAccountId_active_key"
    ON "BankSyncAccount"("financialAccountId")
    WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "BankSyncAccount_financialAccountId_idx" ON "BankSyncAccount"("financialAccountId");
