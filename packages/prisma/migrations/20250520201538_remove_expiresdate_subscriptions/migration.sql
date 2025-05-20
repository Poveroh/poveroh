/*
  Warnings:

  - You are about to drop the column `expires_date` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "subscriptions_expires_date_idx";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "expires_date";
