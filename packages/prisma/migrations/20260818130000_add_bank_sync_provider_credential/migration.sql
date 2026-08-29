-- CreateTable
CREATE TABLE "BankSyncProviderCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "authTag" BYTEA NOT NULL,
    "algo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankSyncProviderCredential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankSyncProviderCredential_userId_idx" ON "BankSyncProviderCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BankSyncProviderCredential_userId_providerId_key" ON "BankSyncProviderCredential"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "BankSyncProviderCredential" ADD CONSTRAINT "BankSyncProviderCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

