-- Read model: each financial account with its current balance, taken from the
-- most recent FinancialAccountBalance point (latest date first). Falls back to 0
-- for accounts that have no balance point yet.
CREATE VIEW "FinancialAccountWithBalance" AS
SELECT
    fa.id,
    fa."userId",
    fa.title,
    COALESCE(fab.balance, 0)::numeric(20, 2) AS balance,
    fa.type,
    fa."logoIcon",
    fa."createdAt",
    fa."updatedAt",
    fa."deletedAt"
FROM "FinancialAccounts" fa
LEFT JOIN LATERAL (
    SELECT b.balance
    FROM "FinancialAccountBalance" b
    WHERE b."financialAccountId" = fa.id
    ORDER BY b.date DESC
    LIMIT 1
) fab ON true;
