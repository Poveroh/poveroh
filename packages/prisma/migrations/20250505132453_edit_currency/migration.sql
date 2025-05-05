/*
  Warnings:

  - You are about to drop the column `currency_id` on the `amounts` table. All the data in the column will be lost.
  - You are about to drop the column `current_id` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "amounts" DROP COLUMN "currency_id";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "current_id";
