-- CreateEnum
CREATE TYPE "UserActivityEntity" AS ENUM ('USER', 'USER_PREFERENCES', 'CATEGORY', 'SUBCATEGORY', 'TRANSACTION', 'TRANSFER', 'SUBSCRIPTION', 'FINANCIAL_ACCOUNT', 'ASSET', 'ASSET_TRANSACTION', 'LIABILITY', 'IMPORT', 'SNAPSHOT', 'DASHBOARD_LAYOUT', 'MARKET_DATA_CREDENTIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "UserActivityAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'GENERATED', 'SIGNED_UP', 'SIGNED_IN', 'SIGNED_OUT', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'ONBOARDING_COMPLETED', 'SYNCED', 'OTHER');

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityType" "UserActivityEntity" NOT NULL,
    "action" "UserActivityAction" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UserActivity_userId_entityType_idx" ON "UserActivity"("userId", "entityType");

-- CreateIndex
CREATE INDEX "UserActivity_userId_action_idx" ON "UserActivity"("userId", "action");

-- CreateIndex
CREATE INDEX "UserActivity_userId_entityType_entityId_idx" ON "UserActivity"("userId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
