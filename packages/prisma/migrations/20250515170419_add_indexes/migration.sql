-- CreateIndex
CREATE INDEX "amounts_transaction_id_idx" ON "amounts"("transaction_id");

-- CreateIndex
CREATE INDEX "amounts_bank_account_id_idx" ON "amounts"("bank_account_id");

-- CreateIndex
CREATE INDEX "amounts_action_idx" ON "amounts"("action");

-- CreateIndex
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts"("user_id");

-- CreateIndex
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");

-- CreateIndex
CREATE INDEX "categories_for_idx" ON "categories"("for");

-- CreateIndex
CREATE INDEX "subcategories_category_id_idx" ON "subcategories"("category_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_bank_account_id_idx" ON "subscriptions"("bank_account_id");

-- CreateIndex
CREATE INDEX "subscriptions_expires_date_idx" ON "subscriptions"("expires_date");

-- CreateIndex
CREATE INDEX "subscriptions_is_enabled_idx" ON "subscriptions"("is_enabled");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

-- CreateIndex
CREATE INDEX "transactions_subcategory_id_idx" ON "transactions"("subcategory_id");

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX "transactions_user_id_date_idx" ON "transactions"("user_id", "date");

-- CreateIndex
CREATE INDEX "transactions_media_transaction_id_idx" ON "transactions_media"("transaction_id");

-- CreateIndex
CREATE INDEX "users_surname_idx" ON "users"("surname");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_login_user_id_idx" ON "users_login"("user_id");

-- CreateIndex
CREATE INDEX "users_login_created_at_idx" ON "users_login"("created_at");
