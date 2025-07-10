-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'PARTIALLY_IMPORTED', 'IMPORTED', 'FAILED');

-- CreateTable
CREATE TABLE "imports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_transactions" (
    "id" TEXT NOT NULL,
    "import_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "icon" TEXT,
    "type" "TransactionType" NOT NULL DEFAULT 'EXPENSES',
    "category_id" TEXT,
    "subcategory_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_transactions_amounts" (
    "id" TEXT NOT NULL,
    "pending_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_transactions_amounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_transactions_media" (
    "id" TEXT NOT NULL,
    "pending_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_transactions_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "imports_user_id_idx" ON "imports"("user_id");

-- CreateIndex
CREATE INDEX "imports_status_idx" ON "imports"("status");

-- CreateIndex
CREATE INDEX "pending_transactions_user_id_idx" ON "pending_transactions"("user_id");

-- CreateIndex
CREATE INDEX "pending_transactions_import_id_idx" ON "pending_transactions"("import_id");

-- CreateIndex
CREATE INDEX "pending_transactions_date_idx" ON "pending_transactions"("date");

-- CreateIndex
CREATE INDEX "pending_transactions_amounts_pending_id_idx" ON "pending_transactions_amounts"("pending_id");

-- CreateIndex
CREATE INDEX "pending_transactions_amounts_bank_account_id_idx" ON "pending_transactions_amounts"("bank_account_id");

-- CreateIndex
CREATE INDEX "pending_transactions_media_pending_id_idx" ON "pending_transactions_media"("pending_id");

-- AddForeignKey
ALTER TABLE "imports" ADD CONSTRAINT "imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions" ADD CONSTRAINT "pending_transactions_import_id_fkey" FOREIGN KEY ("import_id") REFERENCES "imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions" ADD CONSTRAINT "pending_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions" ADD CONSTRAINT "pending_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions" ADD CONSTRAINT "pending_transactions_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions_amounts" ADD CONSTRAINT "pending_transactions_amounts_pending_id_fkey" FOREIGN KEY ("pending_id") REFERENCES "pending_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions_amounts" ADD CONSTRAINT "pending_transactions_amounts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_transactions_media" ADD CONSTRAINT "pending_transactions_media_pending_id_fkey" FOREIGN KEY ("pending_id") REFERENCES "pending_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
