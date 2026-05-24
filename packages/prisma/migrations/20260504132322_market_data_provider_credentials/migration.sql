-- AlterTable
ALTER TABLE "User" ADD COLUMN "preferredMarketDataProviderId" TEXT;

-- CreateTable
CREATE TABLE "MarketDataProviderCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "authTag" BYTEA NOT NULL,
    "algo" TEXT NOT NULL DEFAULT 'aes256gcm-v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketDataProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketDataProviderCredential_userId_idx" ON "MarketDataProviderCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketDataProviderCredential_userId_providerId_key" ON "MarketDataProviderCredential"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "MarketDataProviderCredential" ADD CONSTRAINT "MarketDataProviderCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
