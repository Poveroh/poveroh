-- AlterTable
ALTER TABLE "SnapshotAssetValue" ADD COLUMN     "fxRate" DECIMAL(20,10),
ADD COLUMN     "originalCurrency" "Currency",
ADD COLUMN     "originalValue" DECIMAL(20,2);

-- CreateTable
CREATE TABLE "FxRate" (
    "id" TEXT NOT NULL,
    "fromCurrency" "Currency" NOT NULL,
    "toCurrency" "Currency" NOT NULL,
    "rate" DECIMAL(20,10) NOT NULL,
    "date" DATE NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "FxRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FxRate_date_idx" ON "FxRate"("date");

-- CreateIndex
CREATE INDEX "FxRate_fromCurrency_toCurrency_idx" ON "FxRate"("fromCurrency", "toCurrency");

-- CreateIndex
CREATE UNIQUE INDEX "FxRate_fromCurrency_toCurrency_date_key" ON "FxRate"("fromCurrency", "toCurrency", "date");
