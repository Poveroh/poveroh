-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "quantity" DECIMAL(20,10),
ADD COLUMN     "totalInvested" DECIMAL(20,2);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "preferredMarketDataProviderId" SET DEFAULT 'yahoo-finance';
