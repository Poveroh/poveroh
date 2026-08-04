-- AlterTable
ALTER TABLE "MarketableAsset" ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "providerInstrumentId" TEXT;

-- CreateIndex
CREATE INDEX "MarketableAsset_providerId_providerInstrumentId_idx" ON "MarketableAsset"("providerId", "providerInstrumentId");
